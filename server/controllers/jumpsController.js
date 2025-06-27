// import { Request, Response } from 'express';

const rankingCache = require("./athleteRankingCache");
const { validatePoleBrand } = require("../utils/poleBrandValidation");

// Endpoints:
const addOrUpdateJump = async (req, res, db) => {
  try {
    const athleteProfileId = req.query.athleteProfileId;
    const { id, date, hardMetrics, meetInfo, softMetrics, notes, videoLink } = req.body.jump;

    // Validate required fields
    if (!athleteProfileId || !date) {
      return res.status(400).json({ ok: false, message: 'Athlete ID and Date are required.' });
    }
    if (hardMetrics.setting === "Meet") {
      // Allow 0 for height in case of no height
      const jumpHeight = hardMetrics?.height?.inches;
      if (jumpHeight === undefined || jumpHeight === null || jumpHeight < 0 || !meetInfo) {
        return res.status(400).json({ ok: false, message: 'Missing height or meet info for meet jump' });
      }
      if (jumpHeight === 0 && meetInfo.records?.length > 0) {
        return res.status(400).json({ ok: false, message: 'No height for record jump' });
      }
    }

    // New jumps come in with an id of -1
    const jumpId = id > 0 ? id : undefined;

    // Flatten hardMetrics for upsert
    const flattenedHardMetrics = {
      focus: hardMetrics?.focus,
      setting: hardMetrics?.setting,
      stepNum: hardMetrics?.run?.stepNum,
      distanceInches: hardMetrics?.run?.distanceInches,
      midMarkInches: hardMetrics?.run?.midMarkInches,
      targetTakeOffInches: hardMetrics?.run?.targetTakeOffInches,
      actualTakeOffInches: hardMetrics?.run?.actualTakeOffInches,
      poleGripInches: hardMetrics?.pole?.gripInches,
      poleLengthInches: hardMetrics?.pole?.lengthInches,
      poleWeight: hardMetrics?.pole?.weight,
      poleBrand: validatePoleBrand(hardMetrics?.pole?.brand),
      poleFlex: hardMetrics?.pole?.flex,
      heightInches: hardMetrics?.height?.inches,
      heightIsBar: hardMetrics?.height?.isBar,
      standardsInches: hardMetrics?.height?.standardsInches,
      heightResult: hardMetrics?.height?.result,
      athleteHeightInches: hardMetrics?.athleteStats?.heightInches,
      athleteWeightPounds: hardMetrics?.athleteStats?.weightPounds,
    };

    // Flatten some meet info
    let flattenedMeetInfo = {}
    if (hardMetrics?.setting === "Meet") {
      flattenedMeetInfo.facilitySetting = meetInfo.facilitySetting;
      flattenedMeetInfo.meetType = meetInfo.championshipType;
      flattenedMeetInfo.division = meetInfo.division;
      flattenedMeetInfo.placement = meetInfo.placement;
      flattenedMeetInfo.recordType = meetInfo.records ? meetInfo.records.join(',') : '';
      flattenedMeetInfo.meetEventDetails = meetInfo.eventDetails;
    }

    // Maybe consider auto-verifying if admin made request. Need to update PRs then.
    var needsVerification = false;
    var originalJump = null;
    var wasPr = false;

    if (jumpId) {
      // Get the original jump if we're updating
      originalJump = await db.tables.Jumps.findByPk(jumpId);
      
      if (!originalJump) {
        return res.status(404).json({ ok: false, message: 'Jump not found.' });
      }

      if (!originalJump.verified) {
        // If original jump was unverified, just do normal verification check
        needsVerification = await requiresVerification(hardMetrics, meetInfo, athleteProfileId, db);
      } else if (hardMetrics?.setting === "Meet") {
        // Original jump was verified, check if any critical fields changed
        const criticalFieldsChanged = 
          (meetInfo?.records?.join(',') !== originalJump.recordType) ||
          (meetInfo?.championshipType != originalJump.meetType) ||
          (meetInfo?.placement !== originalJump.placement) ||
          (hardMetrics?.height?.inches !== originalJump.heightInches) ||
          (hardMetrics?.setting !== originalJump.setting);

        if (criticalFieldsChanged) {
          needsVerification = true;
          
          // Only check if it was a PR if we need to recalculate PRs
          const prRecord = await db.tables.PersonalRecords.findOne({
            where: { jumpId, athleteProfileId }
          });
          wasPr = !!prRecord;
        }
      }
    } else {
      // New jump, just do normal verification check
      needsVerification = await requiresVerification(hardMetrics, meetInfo, athleteProfileId, db);
    }

    // If we're updating a verified PR and it needs re-verification, we need to recalculate PRs
    if (jumpId && wasPr && needsVerification) {
      await populatePRsForAthlete(athleteProfileId, db);
    }
    
    const verified = !needsVerification;

    // Upsert jump
    const [jumpRow, created] = await db.tables.Jumps.upsert({
      id: jumpId,
      athleteProfileId,
      date,
      notes,
      videoLink,
      ...flattenedHardMetrics,
      softMetrics,
      ...flattenedMeetInfo,
      verified,
    });

    // If jump is already verified, check if we need to update the personal records table.
    // Otherwise it will get updated when it gets verified.
    if (verified) {
      checkIfJumpIsStepPr(jumpRow, db);
    }

    const jump = mapDbRowToJump(jumpRow);

    res.json({
      ok: true,
      message: created ? 'Jump successfully added.' : 'Jump successfully updated.',
      jump,
    });
  } catch (error) {
    console.error('Error in addOrUpdateJump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

// Verification helper (throws errors)
async function requiresVerification(hardMetrics, meetInfo, athleteProfileId, db) {
  // Auto verify practice jumps
  if (hardMetrics?.setting !== "Meet") {
    return false;
  }
  if (!meetInfo) { 
    console.error("Jump is a meet jump but has no meet info.");
    return true;
  }

  // If it's a championship placement, we need to verify it
  if (meetInfo.championshipType 
    && meetInfo.placement 
    && meetInfo.placement >= 1 && meetInfo.placement <= 3) {
    return true;
  }

  // If it's a record jump, we need to verify it
  if (meetInfo.records && meetInfo.records.length > 0) {
    return true;
  } 

  // If it's a PR jump, we need to verify it
  const athletesPr = await getPersonalBest(athleteProfileId, db);
  if (hardMetrics?.height?.inches > athletesPr) {
    return true;
  }

  return false
}

// Used by admins to check other's jumps
const getJump = async (req, res, db) => {
  try {
    const { jumpId } = req.query;

    if (!jumpId) {
      return res.status(400).json({ ok: false, message: 'Jump ID is required.' });
    }

    const jumpRow = await db.tables.Jumps.findByPk(jumpId);

    if (!jumpRow) {
      return res.status(404).json({ ok: false, message: 'Jump not found.' });
    }

    const jump = mapDbRowToJump(jumpRow);

    res.json({ ok: true, jump });
  } catch (error) {
    console.error('Error in getJump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};


const deleteJump = async (req, res, db) => {
  try {
    const { jumpId, athleteProfileId } = req.query;

    if (!jumpId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing jump ID or athlete profile id' });
    }

    // Start a transaction using the Jumps model's sequelize instance
    const transaction = await db.tables.Jumps.sequelize.transaction();

    try {
      const jump = await db.tables.Jumps.findByPk(jumpId, { transaction });

      if (!jump) {
        await transaction.rollback();
        return res.status(404).json({ ok: false, message: 'Jump not found.' });
      }

      // Check if jump was a PR
      const personalRecord = await db.tables.PersonalRecords.findOne({
        where: { jumpId, athleteProfileId },
        transaction
      });

      // If it was a PR, delete the PR record first
      if (personalRecord) {
        await personalRecord.destroy({ transaction });
      }

      // Then delete the jump
      await jump.destroy({ transaction });

      // Finally, if it was a PR, repopulate PRs
      if (personalRecord) {
        await populatePRsForAthlete(athleteProfileId, db, transaction);
      }

      // Commit the transaction
      await transaction.commit();

      res.json({ ok: true, message: 'Jump deletion successful.' });
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteJump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};


const fetchJumps = async (req, res, db) => {
  try {
    const { athleteProfileId, stepNum, page = 1, pageSize } = req.query;

    if (!athleteProfileId) {
      console.error("No athlete id")
      return res.status(400).json({ ok: false, message: 'Athlete ID is required.' });
    }

    // Build query with filters
    const where = { athleteProfileId };
    if (stepNum) {
      where.stepNum = stepNum;
    }

    // Fetch PRs for the athlete
    const personalRecords = await db.tables.PersonalRecords.findAll({
      where: { athleteProfileId },
      attributes: ['stepNum', 'jumpId'],
    });

    // Create a map of PR jump IDs for quick lookup
    const prMap = new Map();
    personalRecords.forEach(pr => {
      prMap.set(pr.stepNum, pr.jumpId);
    });

    let limit = null;
    let offset = null;

    if (pageSize && parseInt(pageSize, 10) > 0) {
      limit = parseInt(pageSize, 10);
      offset = (parseInt(page, 10) - 1) * limit;
    }

    // Fetch jumps
    const { count, rows: jumps } = await db.tables.Jumps.findAndCountAll({
      where,
      order: [['date', 'DESC']], // Most recent first
      limit,
      offset,
    });

    let returnedJumps = jumps.map(mapDbRowToJump).map((jump => ({
      ...jump,
      isPr: prMap.get(jump.stepNum) === jump.id
    })));

    res.json({
      ok: true,
      jumps: returnedJumps,
      total: count,
      currentPage: limit ? parseInt(page, 10) : 1, // Default to page 1 if no pagination
      totalPages: limit ? Math.ceil(count / limit) : 1,
    });
  } catch (error) {
    console.error('Error in fetchJumps:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};

async function verifyJump(req, res, db) {
  const { jumpId, verify } = req.body;

  if (!jumpId) {
    return res.status(400).json({ message: 'Jump ID is required.' });
  }

  try {
    const jump = await db.tables.Jumps.findByPk(jumpId);

    if (!jump) {
      return res.status(404).json({ message: 'Jump not found.' });
    }

    var message = '';

    // if verifying a jump, check it against the existing PRs
    if (verify === true) {
      // Mark jump as verified
      jump.verified = true;
      await jump.save();

      checkIfJumpIsStepPr(jump, db);

      message = 'Jump verified successfully.';
    } else {
      jump.verified = false;
      await jump.save();
      // If a jump was unverified, we just need to find the next best one
      await populatePRsForAthlete(jump.athleteProfileId, db)

      message = 'Jump unverified successfully.'
    }

    // Reorder ranks for that gender. Can probably be done asyncronusly if needed
    await rankingCache.regenerateAllRankings();

    res.json({ ok: true, message, jump });
  } catch (error) {
    console.error('Error verifying jump:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function checkIfJumpIsStepPr(jump, db) {
  // Check if it's a meet jump and update PR records if applicable
  if (jump.setting === 'Meet' && jump.heightInches) {

    // Check if this jump beats the current PR for its stepNum
    const currentPr = await db.tables.PersonalRecords.findOne({
      where: { athleteProfileId: jump.athleteProfileId, stepNum: jump.stepNum },
      include: {
        model: db.tables.Jumps,
        as: 'jump',
      },
    });

    if (!currentPr || jump.heightInches > currentPr.jump.heightInches) {
      // Update PR
      if (currentPr) {
        await currentPr.destroy(); // Remove old PR record //TODO: What does this destroy, both the jump and the prRow?
      }

      await db.tables.PersonalRecords.create({
        athleteProfileId: jump.athleteProfileId,
        stepNum: jump.stepNum,
        jumpId: jump.id,
      });
    }
  }
}

async function populatePRsForAthlete(athleteProfileId, db, transaction) {
  // Step 1: Get all verified "Meet" jumps for the athlete, grouped by stepNum
  const jumps = await db.tables.Jumps.findAll({
    where: {
      athleteProfileId: athleteProfileId,
      setting: 'Meet',
      verified: true,
    },
    attributes: [
      'id', 'stepNum', 'heightInches'
    ],
    order: [['stepNum', 'ASC'], ['heightInches', 'DESC']], // Order by stepNum, then highest height
    transaction
  });

  if (!jumps.length) {
    console.log(`No verified meet jumps found for athlete ${athleteProfileId}`);
    return;
  }

  // Step 2: Get the best jump for each stepNum
  const bestJumps = {};
  jumps.forEach(jump => {
    if (!bestJumps[jump.stepNum]) {
      bestJumps[jump.stepNum] = jump; // First jump per stepNum will be the best
    }
  });

  // Step 3: Delete all existing PRs for this athlete
  await db.tables.PersonalRecords.destroy({
    where: { athleteProfileId },
    transaction
  });

  // Step 4: Create new PRs for each stepNum using upsert
  for (const stepNum in bestJumps) {
    const bestJump = bestJumps[stepNum];
    await db.tables.PersonalRecords.upsert({
      athleteProfileId: athleteProfileId,
      stepNum: bestJump.stepNum,
      jumpId: bestJump.id,
      uniqueStep: athleteProfileId, // This will enforce uniqueness
    }, {
      transaction,
      fields: ['jumpId'], // Only update the jumpId if record exists
    });
  }

  console.log(`Personal records updated for athlete ${athleteProfileId}`);
}

async function getUnverifiedMeetJumps(req, res, db) {
  try {
    const jumps = await db.tables.Jumps.findAll({
      where: {
        setting: 'Meet',
        verified: false,
      },
      // attributes: [
      //   'id', 'stepNum', 'heightInches', 'poleLengthInches', 'poleWeight', 'meetType',
      //   'division',
      //   'placement',
      //   'recordType',
      //   'meetEventDetails', 'date',
      // ],
      include: [
        {
          model: db.tables.AthleteProfiles,
          as: 'athleteProfile',
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'profileImageVerified'],
        },
      ],
      order: [['date', 'ASC']], // Earlier dates should be first
    });

    let returnedJumps = jumps.map((row) => {
      return {
        jump: mapDbRowToJump(row),
        athlete: {
          id: row.athleteProfile.id,
          name: row.athleteProfile.firstName + ' ' + row.athleteProfile.lastName,
          profileImage: row.athleteProfile.profileImageVerified ? row.athleteProfile.profileImage : undefined,
        },
      }
    });
    res.json({
      ok: true,
      unverifiedJumps: returnedJumps,
    });
  } catch (err) {
    console.error('Error getting unverified jumps jump:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
}

async function getPersonalBests(athleteProfileId, db) {
  try {
    const prs = await db.tables.PersonalRecords.findAll({
      where: { athleteProfileId },
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
        },
      ],
    });

    return prs.map(pr => ({
      stepNum: pr.stepNum,
      jump: mapDbRowToJump(pr.jump).map((j) => ({
        ...j,
        isPr: true,
      })),
    }));
  } catch {

  }
}

async function getPersonalBest(athleteProfileId, db) {
  try {
    const prs = await db.tables.PersonalRecords.findAll({
      where: { athleteProfileId },
      include: [
        {
          model: db.tables.Jumps,
          as: 'jump',
          attributes: ['heightInches'],
        },
      ],
    });

    const pr = Math.max(...prs.map(pr => (pr.jump.heightInches ?? 0)));
    return Math.max(pr, 0);
  } catch (err) {
    console.error(`Error fetching PR for athleteId ${athleteProfileId}:`, err);
    return 0;
  }
}

// async function getPersonalBest(athleteProfileId, db) {
//   try {
//     const result = await db.tables.Jumps.findOne({
//       attributes: [[db.tables.schema.fn('MAX', db.tables.schema.col('heightInches')), 'pr']], // Calculate the max jump height
//       include: [
//         {
//           model: db.tables.PersonalRecords,
//           attributes: [],
//           where: { athleteProfileId }, // Filter by athlete profile ID
//           as: 'personalRecord'
//         },
//       ],
//       raw: true, // Return plain data instead of Sequelize model instances
//     });

//     return result.pr || 0; // Return the PR or 0 if no records found
//   } catch (err) {
//     console.error(`Error fetching PR for athleteId ${athleteProfileId}:`, err);
//     // throw new Error('Failed to fetch PR');
//   }
// };

async function getLargestPole(athleteProfileId, db) {
  // TODO: Base on athlete's jumps

  return {
    lengthInches: 187,
    weight: 180,
    brand: 'UCS',
    flex: null,
  };
}


module.exports = {
  addOrUpdateJump,
  getJump,
  deleteJump,
  fetchJumps,
  verifyJump,
  // populatePRsForAthlete,
  getUnverifiedMeetJumps,
  getPersonalBest,
  // getPersonalBests,
  // getLargestPole,
}



// Helpers

// async function getPrJumps(athleteProfileId) {
//   const prJumps = await db.tables.PrRecords.findAll({
//     where: { athleteProfileId },
//     include: [
//       {
//         model: Jumps,
//         as: 'jump', // Alias if needed
//         attributes: [
//           'id',
//           'date',
//           'stepNum',
//           'heightInches',
//           'verified',
//           'softMetrics',
//           'hardMetrics',
//           'meetInfo',
//           'notes',
//           'videoLink',
//         ],
//       },
//     ],
//   });

//   return prJumps.map(pr => ({
//     stepNum: pr.stepNum,
//     jump: mapDbRowToJump(pr.jump), // Convert to the Jump interface
//   }));
// }

function mapDbRowToJump(dbRow) {
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
      setting: dbRow.setting,
      focus: dbRow.focus ?? undefined,
      run: {
        stepNum: dbRow.stepNum,
        distanceInches: dbRow.distanceInches,
        midMarkInches: dbRow.midMarkInches ?? undefined,
        targetTakeOffInches: dbRow.targetTakeOffInches,
        actualTakeOffInches: dbRow.actualTakeOffInches ?? undefined,
      },
      pole: {
        lengthInches: dbRow.poleLengthInches,
        weight: dbRow.poleWeight,
        brand: dbRow.poleBrand,
        flex: dbRow.poleFlex ?? undefined,
        gripInches: dbRow.poleGripInches ?? undefined,
      },
      height: dbRow.heightInches !== undefined ? {
        isBar: dbRow.heightIsBar,
        inches: dbRow.heightInches,
        standardsInches: dbRow.standardsInches ?? undefined,
        result: dbRow.heightResult ?? undefined,
      } : undefined,
      athleteStats: {
        heightInches: dbRow.athleteHeightInches ?? undefined,
        weightPounds: dbRow.athleteWeightPounds ?? undefined,
      },
    },
    meetInfo: {
      facilitySetting: dbRow.facilitySetting ?? undefined,
      eventDetails: dbRow.meetEventDetails ? { // maybe don't need to copy here?
        meetName: dbRow.meetEventDetails.meetName,
        facility: dbRow.meetEventDetails.facility,
        location: dbRow.meetEventDetails.location,
        organization: dbRow.meetEventDetails.organization,
      } : undefined,
      championshipType: dbRow.meetType ?? undefined,
      division: dbRow.division ?? undefined,
      placement: dbRow.placement ?? undefined,
      records: dbRow.recordType ? dbRow.recordType.split(',') : [],
    },
    notes: dbRow.notes ?? undefined,
    videoLink: dbRow.videoLink ?? undefined,
    verified: dbRow.verified,
  };
}