'use strict';

const { normalizeTrainingGroupInput } = require('../../lib/trainingGroups');

function toTrainingGroupJson(row) {
  return { id: row.id, key: row.key, label: row.label };
}

async function loadGroups(db) {
  const rows = await db.tables.TrainingGroups.findAll({
    order: [['id', 'ASC']],
  });
  return rows.map(toTrainingGroupJson);
}

async function listTrainingGroups(req, res, db) {
  try {
    res.json({ ok: true, trainingGroups: await loadGroups(db) });
  } catch (error) {
    console.error('Error in listTrainingGroups:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function createTrainingGroup(req, res, db) {
  try {
    const groups = await loadGroups(db);
    const normalized = normalizeTrainingGroupInput(req.body, { groups: groups, currentId: null });
    if (!normalized.ok) {
      return res.status(400).json({ ok: false, message: normalized.message });
    }
    const created = await db.tables.TrainingGroups.create({
      key: normalized.value.key,
      label: normalized.value.label,
    });
    res.status(201).json({ ok: true, trainingGroup: toTrainingGroupJson(created) });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ ok: false, message: 'A group with that name already exists.' });
    }
    console.error('Error in createTrainingGroup:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function updateTrainingGroup(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, message: 'Invalid group id.' });
    }
    const row = await db.tables.TrainingGroups.findByPk(id);
    if (!row) {
      return res.status(404).json({ ok: false, message: 'Group not found.' });
    }
    const groups = await loadGroups(db);
    const normalized = normalizeTrainingGroupInput(req.body, { groups: groups, currentId: id });
    if (!normalized.ok) {
      return res.status(400).json({ ok: false, message: normalized.message });
    }
    await row.update({ label: normalized.value.label });
    res.json({ ok: true, trainingGroup: toTrainingGroupJson(row) });
  } catch (error) {
    console.error('Error in updateTrainingGroup:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

module.exports = {
  listTrainingGroups,
  createTrainingGroup,
  updateTrainingGroup,
};
