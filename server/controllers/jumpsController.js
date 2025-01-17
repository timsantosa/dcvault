// import { Request, Response } from 'express';

const addOrUpdateJump = async (req, res, db) => {
  try {
    const athleteProfileId = req.body.athleteProfileId;
    const { id, date, hardMetrics, meetInfo, softMetrics, notes, videoLink } = req.body.jump;

    // Validate required fields
    if (!athleteProfileId || !date) {
      return res.status(400).json({ ok: false, message: 'Athlete ID and Date are required.' });
    }

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
    const [jump, created] = await db.tables.Jumps.upsert({
    // const returned = await db.tables.Jumps.upsert({
      id,
      athleteProfileId,
      date,
      notes,
      videoLink,
      ...flattenedHardMetrics,
      softMetrics,
      meetInfo,
    });

    console.log("returned: ",returned)
    throw Error();

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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ ok: false, message: 'Jump ID is required.' });
    }

    const jump = await db.tables.Jumps.findByPk(id);

    if (!jump) {
      return res.status(404).json({ ok: false, message: 'Jump not found.' });
    }

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

    const jump = await db.tables.Jumps.findByPk(id);

    if (!jump) {
      return res.status(404).json({ ok: false, message: 'Jump not found.' });
    }

    // Check permissions
    if (!req.user.isAdmin && req.user.athleteId !== jump.athleteId) {
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
    const { athleteId, stepNum, page = 1, pageSize } = req.query;

    if (!athleteId) {
      return res.status(400).json({ ok: false, message: 'Athlete ID is required.' });
    }

    // Build query with filters
    const where = { athleteId };
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

    res.json({
      ok: true,
      jumps,
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