const { validatePoleBrand } = require("../utils/poleBrandValidation");
const { destroyJumpDrillCloudinaryAssetIfOwned } = require("../lib/cloudinaryMedia");
const {
  normalizeStoredVideoLink,
  userCanVerifyLogVideoMedia,
  linkPendingLogVideoToDrill,
  destroyPendingLogVideosForDrill,
  attachPendingLogVideoToDrillSingle,
  attachPendingLogVideoToDrills,
} = require('../utils/pendingLogVideo');

const addOrUpdateDrill = async (req, res, db) => {
  try {
    const athleteProfileId = req.query.athleteProfileId;
    const bodyDrill = req.body.drill;
    const {
      id, date, hardMetrics, softMetrics, notes,
      videoLink: videoLinkRaw,
    } = bodyDrill;

    // Validate required fields
    if (!athleteProfileId || !date || !hardMetrics?.drillType) {
      return res.status(400).json({ ok: false, message: 'Athlete ID, Date, and Drill Type are required.' });
    }

    const profileId = parseInt(athleteProfileId, 10);
    if (Number.isNaN(profileId)) {
      return res.status(400).json({ ok: false, message: 'Invalid athlete profile id.' });
    }

    // New drills come in with an id of -1
    const drillId = id > 0 ? id : undefined;

    let originalDrill = null;
    if (drillId) {
      originalDrill = await db.tables.Drills.findByPk(drillId);
      if (!originalDrill) {
        return res.status(404).json({ ok: false, message: 'Drill not found.' });
      }
    }

    // Flatten hardMetrics for upsert
    const flattenedHardMetrics = {
      drillType: hardMetrics.drillType,
      runStepNum: hardMetrics.run?.stepNum,
      runDistanceInches: hardMetrics.run?.distanceInches,
      targetTakeOffInches: hardMetrics.run?.targetTakeOffInches ?? hardMetrics.run?.takeOffInches, // TODO: Remove this fallback eventually
      actualTakeOffInches: hardMetrics.run?.actualTakeOffInches,
      spikes: hardMetrics.run?.spikes,
      // Flattened pole metrics
      poleId: hardMetrics.pole?.id,
      poleLengthInches: hardMetrics.pole?.lengthInches,
      poleWeight: hardMetrics.pole?.weight,
      poleBrand: validatePoleBrand(hardMetrics.pole?.brand),
      poleFlex: hardMetrics.pole?.flex,
      poleGripInches: hardMetrics.pole?.gripInches,
      // Flattened athlete stats
      athleteHeightInches: hardMetrics.athleteStats?.heightInches,
      athleteWeightPounds: hardMetrics.athleteStats?.weightPounds,
    };

    let resolvedVideoLink;
    if (drillId && originalDrill) {
      resolvedVideoLink = "videoLink" in bodyDrill
        ? normalizeStoredVideoLink(bodyDrill.videoLink)
        : normalizeStoredVideoLink(originalDrill.videoLink);
    } else {
      resolvedVideoLink = normalizeStoredVideoLink(videoLinkRaw);
    }

    const pendingLogVideoId =
      bodyDrill.pendingLogVideoId != null && parseInt(bodyDrill.pendingLogVideoId, 10) > 0
        ? parseInt(bodyDrill.pendingLogVideoId, 10)
        : null;
    const canVerifyMedia = userCanVerifyLogVideoMedia(req.user);
    const hasPendingId = pendingLogVideoId != null;

    if (hasPendingId) {
      const pending = await db.tables.PendingLogVideos.findByPk(pendingLogVideoId);
      if (!pending) {
        return res.status(404).json({ ok: false, message: 'Pending log video not found.' });
      }
      if (pending.athleteProfileId !== profileId || pending.entityKind !== 'drill') {
        return res.status(400).json({ ok: false, message: 'Invalid pending log video for this drill.' });
      }
      const bodyUrl = drillId && originalDrill && !('videoLink' in bodyDrill)
        ? normalizeStoredVideoLink(originalDrill.videoLink)
        : normalizeStoredVideoLink(videoLinkRaw);
      if (!bodyUrl || pending.videoUrl !== bodyUrl) {
        return res.status(400).json({ ok: false, message: 'Video URL does not match pending upload.' });
      }
      if (pending.drillId && drillId && pending.drillId !== drillId) {
        return res.status(400).json({ ok: false, message: 'Pending video belongs to another drill.' });
      }
      resolvedVideoLink = null;
    } else {
      if (!drillId) {
        const incoming = normalizeStoredVideoLink(videoLinkRaw);
        if (incoming && !canVerifyMedia) {
          return res.status(400).json({ ok: false, message: 'Log video must be approved before it is saved.' });
        }
      } else if (originalDrill && 'videoLink' in bodyDrill) {
        const incoming = normalizeStoredVideoLink(bodyDrill.videoLink);
        const orig = normalizeStoredVideoLink(originalDrill.videoLink);
        if (incoming && incoming !== orig && !canVerifyMedia) {
          return res.status(400).json({ ok: false, message: 'Log video must be approved before it is saved.' });
        }
      }
      if (drillId && 'videoLink' in bodyDrill && !normalizeStoredVideoLink(bodyDrill.videoLink)) {
        await destroyPendingLogVideosForDrill(db, drillId);
      }
    }

    // Upsert drill
    let drillRow;
    let created;
    const transaction = await db.tables.Drills.sequelize.transaction();
    try {
      [drillRow, created] = await db.tables.Drills.upsert({
        id: drillId,
        athleteProfileId: profileId,
        date,
        notes,
        videoLink: resolvedVideoLink,
        ...flattenedHardMetrics,
        softMetrics,
      }, { transaction });
      if (hasPendingId) {
        await linkPendingLogVideoToDrill(db, pendingLogVideoId, drillRow.id, profileId, { transaction });
      }
      await transaction.commit();
    } catch (e) {
      await transaction.rollback();
      console.error('addOrUpdateDrill upsert/link', e);
      const code = e.statusCode || 500;
      return res.status(code).json({ ok: false, message: e.message || 'Failed to save drill.' });
    }

    if (drillId && originalDrill) {
      const previousVideoLink = normalizeStoredVideoLink(originalDrill.videoLink);
      if (previousVideoLink && previousVideoLink !== resolvedVideoLink) {
        await destroyJumpDrillCloudinaryAssetIfOwned(previousVideoLink);
      }
    }

    let drill = mapDbRowToDrill(drillRow);
    drill = await attachPendingLogVideoToDrillSingle(drill, db, req.user, profileId);

    res.json({
      ok: true,
      message: created ? 'Drill successfully added.' : 'Drill successfully updated.',
      drill,
    });
  } catch (error) {
    console.error('Error in addOrUpdateDrill:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const getDrill = async (req, res, db) => {
  try {
    const { drillId } = req.query;

    if (!drillId) {
      return res.status(400).json({ ok: false, message: 'Drill ID is required.' });
    }

    const drillRow = await db.tables.Drills.findByPk(drillId);

    if (!drillRow) {
      return res.status(404).json({ ok: false, message: 'Drill not found.' });
    }

    // Check if this drill is favorited
    const favoriteDrill = await db.tables.FavoriteDrills.findOne({
      where: { drillId: drillId }
    });

    let drill = mapDbRowToDrill(drillRow);
    drill.isFavorite = !!favoriteDrill;

    drill = await attachPendingLogVideoToDrillSingle(drill, db, req.user, drill.athleteProfileId);

    res.json({ ok: true, drill });
  } catch (error) {
    console.error('Error in getDrill:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const deleteDrill = async (req, res, db) => {
  try {
    const { drillId, athleteProfileId } = req.query;

    if (!drillId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing drill ID or athlete profile id' });
    }

    // Check if drill exists before starting transaction
    const drill = await db.tables.Drills.findByPk(drillId);

    if (!drill) {
      return res.status(404).json({ ok: false, message: 'Drill not found.' });
    }

    const previousVideoLink = normalizeStoredVideoLink(drill.videoLink);

    // Start a transaction using the Drills model's sequelize instance
    const transaction = await db.tables.Drills.sequelize.transaction();

    try {
      await destroyPendingLogVideosForDrill(db, drillId, { transaction });

      // Check if this drill is favorited
      const favoriteDrill = await db.tables.FavoriteDrills.findOne({
        where: { drillId, athleteProfileId },
        transaction
      });

      // If it was a favorite, delete the favorite record
      if (favoriteDrill) {
        await favoriteDrill.destroy({ transaction });
      }

      // Then delete the drill
      await drill.destroy({ transaction });

      // Commit the transaction
      await transaction.commit();

      if (previousVideoLink) {
        try {
          await destroyJumpDrillCloudinaryAssetIfOwned(previousVideoLink);
        } catch (e) {
          console.warn("Drill delete Cloudinary cleanup:", e && e.message);
        }
      }

      res.json({ ok: true, message: "Drill deletion successful." });
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDrill:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const fetchDrills = async (req, res, db) => {
  try {
    const { athleteProfileId } = req.query;

    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Athlete ID is required.' });
    }

    // Fetch favorite drills for the athlete
    const favoriteDrills = await db.tables.FavoriteDrills.findAll({
      where: { athleteProfileId },
      attributes: ['drillId'],
    });

    // Create a map of favorite drill IDs for quick lookup
    const favoriteMap = new Map();
    favoriteDrills.forEach(fav => {
      favoriteMap.set(fav.drillId, true);
    });

    const drills = await db.tables.Drills.findAll({
      where: { athleteProfileId },
      order: [['date', 'DESC']], // Most recent first
    });

    const returnedDrills = drills.map(mapDbRowToDrill).map((drill) => ({
      ...drill,
      isFavorite: favoriteMap.has(drill.id),
    }));

    const withPending = await attachPendingLogVideoToDrills(returnedDrills, db, req.user, athleteProfileId);

    res.json({
      ok: true,
      drills: withPending,
    });
  } catch (error) {
    console.error('Error in fetchDrills:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const pinOrUnpinDrill = async (req, res, db) => {
  try {
    const { athleteProfileId, drillId, drillType, pin } = req.body;

    // Validate required fields
    if (!athleteProfileId || !drillType || !drillId || pin === undefined) {
      return res.status(400).json({ ok: false, message: 'Missing required attributes.' });
    }

    // If pin is true, pin the drill, otherwise unpin any drill of this type.
    if (pin) {
      // First, verify the drill exists and belongs to the athlete
      const drill = await db.tables.Drills.findOne({
        where: { 
          id: drillId, 
          athleteProfileId: athleteProfileId,
          drillType: drillType // Ensure the drill matches the drill type
        }
      });

      if (!drill) {
        return res.status(404).json({ ok: false, message: 'Drill not found or does not match the specified drill type.' });
      }

      // Start transaction only for the destructive/creative operations
      const transaction = await db.tables.Drills.sequelize.transaction();

      try {
        // Remove any existing favorite for this drill type
        await db.tables.FavoriteDrills.destroy({
          where: { athleteProfileId, drillType },
          transaction
        });

        // Create new favorite
        const favoriteDrill = await db.tables.FavoriteDrills.create({
          athleteProfileId,
          drillId,
          drillType
        }, { transaction });

        // Commit the transaction
        await transaction.commit();

        res.json({
          ok: true,
          message: 'Drill pinned as favorite successfully.',
          favoriteDrill: {
            id: favoriteDrill.id,
            drillId: favoriteDrill.drillId,
            drillType: favoriteDrill.drillType
          }
        });
      } catch (error) {
        // If anything fails, rollback the transaction
        await transaction.rollback();
        throw error;
      }
    } else {
      // Unpin any existing favorite for this drill type
      const deletedCount = await db.tables.FavoriteDrills.destroy({
        where: { athleteProfileId, drillType }
      });

      if (deletedCount > 0) {
        res.json({
          ok: true,
          message: 'Drill unpinned successfully.'
        });
      } else {
        res.json({
          ok: true,
          message: 'No favorite drill found for this drill type.'
        });
      }
    }
  } catch (error) {
    console.error('Error in pinOrUnpinDrill:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

const getDrillTypes = async (req, res, db) => {
  try {
    const drillTypes = await db.tables.DrillTypes.findAll({
      attributes: ['name'],
      order: [['id', 'ASC']],
      raw: true
    });

    res.json({
      ok: true,
      message: 'Successfully grabbed drill types',
      drillTypes: drillTypes.map(dt => dt.name)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error fetching drill types',
      error: error.message
    });
  }
};

const setDrillTypes = async (req, res, db) => {
  try {
    const { drillTypes } = req.body;
    if (!Array.isArray(drillTypes)) {
      return res.status(400).json({
        ok: false,
        message: 'drillTypes must be an array'
      });
    }

    // Delete all existing types
    await db.tables.DrillTypes.destroy({ where: {} });
    
    // Insert new types
    await db.tables.DrillTypes.bulkCreate(
      drillTypes.map(name => ({ name })),
      { returning: true }
    );

    res.json({
      ok: true,
      message: 'Successfully updated drill types'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error updating drill types',
      error: error.message
    });
  }
};

function mapDbRowToDrill(dbRow) {
  return {
    id: dbRow.id,
    athleteProfileId: dbRow.athleteProfileId,
    date: dbRow.date,
    softMetrics: dbRow.softMetrics ? {
      mentalRating: dbRow.softMetrics.mentalRating,
      physicalRating: dbRow.softMetrics.physicalRating,
      weatherRating: dbRow.softMetrics.weatherRating,
    } : undefined,
    hardMetrics: {
      drillType: dbRow.drillType,
      run: {
        stepNum: dbRow.runStepNum,
        distanceInches: dbRow.runDistanceInches,
        takeOffInches: dbRow.takeOffInches ?? undefined, // TODO: Remove in a future update
        targetTakeOffInches: dbRow.targetTakeOffInches,
        actualTakeOffInches: dbRow.actualTakeOffInches ?? undefined,
        spikes: dbRow.spikes ?? undefined,
      },
      pole: {
        id: dbRow.poleId,
        lengthInches: dbRow.poleLengthInches,
        weight: dbRow.poleWeight,
        brand: dbRow.poleBrand,
        flex: dbRow.poleFlex,
        gripInches: dbRow.poleGripInches,
      },
      athleteStats: {
        heightInches: dbRow.athleteHeightInches,
        weightPounds: dbRow.athleteWeightPounds,
      },
    },
    notes: dbRow.notes,
    videoLink: dbRow.videoLink,
  };
}

module.exports = {
  addOrUpdateDrill,
  getDrill,
  deleteDrill,
  fetchDrills,
  pinOrUnpinDrill,
  getDrillTypes,
  setDrillTypes,
};
