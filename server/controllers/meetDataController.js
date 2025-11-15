const { tables } = require('../db/db');

const getAllMeetInfoOptions = async (req, res) => {
  try {
    const championshipTypes = await tables.ChampionshipTypes.findAll({
      attributes: ['name'],
      order: [['id', 'ASC']],
      raw: true
    });
    const divisionTypes = await tables.DivisionTypes.findAll({
      attributes: ['name'],
      order: [['id', 'ASC']],
      raw: true
    });
    const recordTypes = await tables.RecordTypes.findAll({
      attributes: ['name'],
      order: [['id', 'ASC']],
      raw: true
    });

    res.json({
      ok: true,
      message: 'Successfully grabbed meet options',
      meetInfoOptions: {
        championshipTypes: championshipTypes.map(ct => ct.name),
        divisionTypes: divisionTypes.map(dt => dt.name),
        recordTypes: recordTypes.map(rt => rt.name)
      }
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error fetching meet type options',
      error: error.message
    });
  }
};

const getChampionshipTypes = async (req, res) => {
  try {
    const championshipTypes = await tables.ChampionshipTypes.findAll({
      attributes: ['name'],
      order: [['id', 'ASC']],
      raw: true
    });
    res.json({
      ok: true,
      message: 'Successfully grabbed championship types',
      championshipTypes: championshipTypes.map(ct => ct.name)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error fetching championship types',
      error: error.message
    });
  }
};

const getDivisionTypes = async (req, res) => {
  try {
    const divisionTypes = await tables.DivisionTypes.findAll({
      attributes: ['name'],
      order: [['id', 'ASC']],
      raw: true
    });
    res.json({
      ok: true,
      message: 'Successfully grabbed division types',
      divisionTypes: divisionTypes.map(dt => dt.name)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error fetching division types',
      error: error.message
    });
  }
};

const getRecordTypes = async (req, res) => {
  try {
    const recordTypes = await tables.RecordTypes.findAll({
      attributes: ['name'],
      order: [['id', 'ASC']],
      raw: true
    });
    res.json({
      ok: true,
      message: 'Successfully grabbed record types',
      recordTypes: recordTypes.map(rt => rt.name)
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error fetching record types',
      error: error.message
    });
  }
};

const updateChampionshipTypes = async (req, res) => {
  try {
    const { championshipTypes } = req.body;
    if (!Array.isArray(championshipTypes)) {
      return res.status(400).json({
        ok: false,
        message: 'championshipTypes must be an array'
      });
    }

    // Delete all existing types
    await tables.ChampionshipTypes.destroy({ where: {} });
    
    // Insert new types in order
    await tables.ChampionshipTypes.bulkCreate(
      championshipTypes.map(name => ({ name })),
      { returning: true }
    );

    res.json({
      ok: true,
      message: 'Successfully updated championship types'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error updating championship types',
      error: error.message
    });
  }
};

const updateDivisionTypes = async (req, res) => {
  try {
    const { divisionTypes } = req.body;
    if (!Array.isArray(divisionTypes)) {
      return res.status(400).json({
        ok: false,
        message: 'divisionTypes must be an array'
      });
    }

    // Delete all existing types
    await tables.DivisionTypes.destroy({ where: {} });
    
    // Insert new types in order
    await tables.DivisionTypes.bulkCreate(
      divisionTypes.map(name => ({ name })),
      { returning: true }
    );

    res.json({
      ok: true,
      message: 'Successfully updated division types'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error updating division types',
      error: error.message
    });
  }
};

const updateRecordTypes = async (req, res) => {
  try {
    const { recordTypes } = req.body;
    if (!Array.isArray(recordTypes)) {
      return res.status(400).json({
        ok: false,
        message: 'recordTypes must be an array'
      });
    }

    // Delete all existing types
    await tables.RecordTypes.destroy({ where: {} });
    
    // Insert new types in order
    await tables.RecordTypes.bulkCreate(
      recordTypes.map(name => ({ name })),
      { returning: true }
    );

    res.json({
      ok: true,
      message: 'Successfully updated record types'
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Error updating record types',
      error: error.message
    });
  }
};

module.exports = {
  getAllMeetInfoOptions,
  getChampionshipTypes,
  getDivisionTypes,
  getRecordTypes,
  updateChampionshipTypes,
  updateDivisionTypes,
  updateRecordTypes
};
