// import { Request, Response } from 'express';

const addOrUpdateJump = async (req, res, db) => {
  try {
    const athleteProfileId = req.body.athleteProfileId;
    const { id, date, hardMetrics, meetInfo, softMetrics, notes, videoLink } = req.body.jump;

    // Validate required fields
    if (!athleteProfileId || !date) {
      return res.status(400).json({ ok: false, message: 'Athlete ID and Date are required.' });
    }

    // New jumps come in with an id of -1
    const jumpId = id > 0 ? id : undefined;

    // Flatten hardMetrics for upsert
    const flattenedHardMetrics = {
      stepNum: hardMetrics?.run?.stepNum,
      distanceInches: hardMetrics?.run?.distanceInches,
      midMarkInches: hardMetrics?.run?.midMarkInches,
      targetTakeOffInches: hardMetrics?.run?.targetTakeOffInches,
      actualTakeOffInches: hardMetrics?.run?.actualTakeOffInches,
      gripInches: hardMetrics?.pole?.gripInches,
      poleLengthInches: hardMetrics?.pole?.lengthInches,
      poleWeight: hardMetrics?.pole?.weight,
      poleBrand: hardMetrics?.pole?.brand,
      poleFlex: hardMetrics?.pole?.flex,
      heightInches: hardMetrics?.height?.inches,
      isBar: hardMetrics?.height?.isBar,
      standardsInches: hardMetrics?.height?.standardsInches,
      result: hardMetrics?.height?.result,
      athleteHeightInches: hardMetrics?.athleteStats?.heightInches,
      athleteWeightPounds: hardMetrics?.athleteStats?.weightPounds,
    };

    // Upsert jump
    const [jumpRow, created] = await db.tables.Jumps.upsert({
      id: jumpId,
      athleteProfileId,
      date,
      notes,
      videoLink,
      ...flattenedHardMetrics,
      softMetrics,
      meetInfo,
    });

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

// Not really used at the moment
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
    const { jumpId } = req.query;

    if (!jumpId) {
      return res.status(400).json({ ok: false, message: 'Jump ID is required.' });
    }

    const jump = await db.tables.Jumps.findByPk(jumpId);

    if (!jump) {
      return res.status(404).json({ ok: false, message: 'Jump not found.' });
    }

    console.log('athlete id', jump.athleteProfileId);

    // Check permissions
    if (!req.user.isAdmin && req.user.athleteProfileId !== jump.athleteProfileId) { // For now, no one can delete jumps because they don't have am athleteProfileId
      return res.status(403).json({ ok: false, message: 'You are not authorized to delete this jump.' });
    }

    await jump.destroy();

    res.json({ ok: true, message: 'Jump deletion successful.' });
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

    console.log(jumps.map(mapDbRowToJump)[0].hardMetrics.run);

    res.json({
      ok: true,
      jumps: jumps.map(mapDbRowToJump),
      total: count,
      currentPage: limit ? parseInt(page, 10) : 1, // Default to page 1 if no pagination
      totalPages: limit ? Math.ceil(count / limit) : 1,
    });
  } catch (error) {
    console.error('Error in fetchJumps:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
};



module.exports = { addOrUpdateJump, getJump, deleteJump, fetchJumps }



// helper

function mapDbRowToJump(dbRow) {
  return {
    id: dbRow.id,
    date: dbRow.date,
    softMetrics: dbRow.softMetrics
      ? {
          mentalRating: dbRow.softMetrics.mentalRating,
          physicalRating: dbRow.softMetrics.physicalRating,
          weatherRating: dbRow.softMetrics.weatherRating,
        }
      : undefined,
    hardMetrics: {
      setting: dbRow.setting,
      focus: dbRow.focus,
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
      height: dbRow.heightIsBar
        ? {
            isBar: dbRow.heightIsBar,
            inches: dbRow.heightInches,
            standardsInches: dbRow.standardsInches ?? undefined,
            result: dbRow.heightResult ?? undefined,
          }
        : undefined,
      athleteStats: {
        heightInches: dbRow.athleteHeightInches ?? undefined,
        weightPounds: dbRow.athleteWeightPounds ?? undefined,
      },
    },
    meetInfo: dbRow.meetInfo
      ? {
          eventDetails: {
            meetName: dbRow.meetInfo.eventDetails.meetName,
            facility: dbRow.meetInfo.eventDetails.facility,
            location: dbRow.meetInfo.eventDetails.location,
            organization: dbRow.meetInfo.eventDetails.organization,
            isChampionship: dbRow.meetInfo.eventDetails.isChampionship,
          },
          placement: dbRow.meetInfo.placement ?? undefined,
          record: dbRow.meetInfo.record ?? undefined,
        }
      : undefined,
    notes: dbRow.notes ?? undefined,
    videoLink: dbRow.videoLink ?? undefined,
  };
}