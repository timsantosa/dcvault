const { validatePoleBrand } = require("../utils/poleBrandValidation");

const addOrUpdateDrill = async (req, res, db) => {
  try {
    const athleteProfileId = req.query.athleteProfileId;
    const { id, date, hardMetrics, softMetrics, notes, videoLink } = req.body.drill;

    // Validate required fields
    if (!athleteProfileId || !date || !hardMetrics?.drillType) {
      return res.status(400).json({ ok: false, message: 'Athlete ID, Date, and Drill Type are required.' });
    }

    // New drills come in with an id of -1
    const drillId = id > 0 ? id : undefined;

    // Flatten hardMetrics for upsert
    const flattenedHardMetrics = {
      drillType: hardMetrics.drillType,
      runStepNum: hardMetrics.run?.stepNum,
      runDistanceInches: hardMetrics.run?.distanceInches,
      targetTakeOffInches: hardMetrics.run?.targetTakeOffInches,
      actualTakeOffInches: hardMetrics.run?.actualTakeOffInches,
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

    // Upsert drill
    const [drillRow, created] = await db.tables.Drills.upsert({
      id: drillId,
      athleteProfileId,
      date,
      notes,
      videoLink,
      ...flattenedHardMetrics,
      softMetrics,
    });

    const drill = mapDbRowToDrill(drillRow);

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

    const drill = mapDbRowToDrill(drillRow);

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

    const drill = await db.tables.Drills.findByPk(drillId);

    if (!drill) {
      return res.status(404).json({ ok: false, message: 'Drill not found.' });
    }

    await drill.destroy();

    res.json({ ok: true, message: 'Drill deletion successful.' });
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

    const drills = await db.tables.Drills.findAll({
      where: { athleteProfileId },
      order: [['date', 'DESC']], // Most recent first
    });

    const returnedDrills = drills.map(mapDbRowToDrill);

    res.json({
      ok: true,
      drills: returnedDrills,
    });
  } catch (error) {
    console.error('Error in fetchDrills:', error);
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
        targetTakeOffInches: dbRow.targetTakeOffInches,
        actualTakeOffInches: dbRow.actualTakeOffInches ?? undefined,
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
  getDrillTypes,
  setDrillTypes,
};
