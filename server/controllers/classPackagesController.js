'use strict';

const {
  normalizeClassPackageInput,
  sortOrdersForSection,
  toClassPackageJson,
} = require('../lib/classPackageCatalog');

async function listClassPackages(req, res, db) {
  try {
    const rows = await db.tables.ClassPackages.findAll({
      order: [['sortOrder', 'ASC'], ['name', 'ASC'], ['id', 'ASC']],
    });
    res.json({ ok: true, classPackages: rows.map(toClassPackageJson) });
  } catch (error) {
    console.error('Error in listClassPackages:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function loadPackageNames(db) {
  const rows = await db.tables.ClassPackages.findAll({
    attributes: ['id', 'audience', 'name'],
  });
  return rows.map((row) => ({ id: row.id, audience: row.audience, name: row.name }));
}

async function nextSortOrder(db, audience) {
  const max = await db.tables.ClassPackages.max('sortOrder', { where: { audience: audience } });
  if (max == null) {
    return 1;
  }
  return Number(max) + 1;
}

async function createClassPackage(req, res, db) {
  try {
    const packages = await loadPackageNames(db);
    const normalized = normalizeClassPackageInput(req.body, { packages: packages, currentId: null });
    if (!normalized.ok) {
      return res.status(400).json({ ok: false, message: normalized.message });
    }
    const sortOrder = await nextSortOrder(db, normalized.value.audience);
    const created = await db.tables.ClassPackages.create({
      name: normalized.value.name,
      price: normalized.value.price,
      audience: normalized.value.audience,
      creditCount: normalized.value.creditCount,
      inviteLevel: normalized.value.inviteLevel,
      active: normalized.value.active,
      sortOrder: sortOrder,
    });
    res.status(201).json({ ok: true, classPackage: toClassPackageJson(created) });
  } catch (error) {
    console.error('Error in createClassPackage:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function updateClassPackage(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ ok: false, message: 'Invalid package id.' });
    }
    const row = await db.tables.ClassPackages.findByPk(id);
    if (!row) {
      return res.status(404).json({ ok: false, message: 'Package not found.' });
    }
    const packages = await loadPackageNames(db);
    const normalized = normalizeClassPackageInput(req.body, { packages: packages, currentId: id });
    if (!normalized.ok) {
      return res.status(400).json({ ok: false, message: normalized.message });
    }
    const audienceChanged = row.audience !== normalized.value.audience;
    const sortOrder = audienceChanged ? await nextSortOrder(db, normalized.value.audience) : row.sortOrder;
    await row.update({
      name: normalized.value.name,
      price: normalized.value.price,
      audience: normalized.value.audience,
      creditCount: normalized.value.creditCount,
      inviteLevel: normalized.value.inviteLevel,
      active: normalized.value.active,
      sortOrder: sortOrder,
    });
    res.json({ ok: true, classPackage: toClassPackageJson(row) });
  } catch (error) {
    console.error('Error in updateClassPackage:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function reorderClassPackages(req, res, db) {
  try {
    const audience = typeof req.body.audience === 'string' ? req.body.audience.trim().toLowerCase() : '';
    if (!audience) {
      return res.status(400).json({ ok: false, message: 'Group is required.' });
    }
    const rows = await db.tables.ClassPackages.findAll({
      where: { audience: audience },
      attributes: ['id'],
    });
    const ordered = sortOrdersForSection(req.body.orderedIds, rows.map((row) => row.id));
    if (!ordered.ok) {
      return res.status(400).json({ ok: false, message: ordered.message });
    }
    await db.tables.schema.transaction(async (transaction) => {
      for (let i = 0; i < ordered.updates.length; i += 1) {
        const update = ordered.updates[i];
        await db.tables.ClassPackages.update(
          { sortOrder: update.sortOrder },
          { where: { id: update.id }, transaction: transaction }
        );
      }
    });
    const refreshed = await db.tables.ClassPackages.findAll({
      where: { audience: audience },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']],
    });
    res.json({ ok: true, classPackages: refreshed.map(toClassPackageJson) });
  } catch (error) {
    console.error('Error in reorderClassPackages:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

module.exports = {
  listClassPackages,
  createClassPackage,
  updateClassPackage,
  reorderClassPackages,
};
