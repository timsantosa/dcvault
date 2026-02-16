'use strict';

async function listVaultAssociations(req, res, db) {
  try {
    const rows = await db.tables.VaultAssociations.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    const vaultAssociations = rows.map((row) => ({ id: row.id, name: row.name }));
    res.json({ ok: true, vaultAssociations });
  } catch (error) {
    console.error('Error in listVaultAssociations:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function createVaultAssociation(req, res, db) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'Name is required and must be non-empty.' });
    }
    const trimmedName = name.trim();
    // Check if name already exists
    const existing = await db.tables.VaultAssociations.findOne({ where: { name: trimmedName } });
    if (existing) {
      return res.status(409).json({ ok: false, message: 'A vault association with this name already exists.' });
    }
    const vaultAssociation = await db.tables.VaultAssociations.create({ name: trimmedName });
    res.status(201).json({
      ok: true,
      vaultAssociation: { id: vaultAssociation.id, name: vaultAssociation.name },
    });
  } catch (error) {
    console.error('Error in createVaultAssociation:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function updateVaultAssociation(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid vault association ID.' });
    }
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ ok: false, message: 'Name is required and must be non-empty.' });
    }
    const vaultAssociation = await db.tables.VaultAssociations.findByPk(id);
    if (!vaultAssociation) {
      return res.status(404).json({ ok: false, message: 'Vault association not found.' });
    }
    await vaultAssociation.update({ name: name.trim() });
    res.json({
      ok: true,
      vaultAssociation: { id: vaultAssociation.id, name: vaultAssociation.name },
    });
  } catch (error) {
    console.error('Error in updateVaultAssociation:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function deleteVaultAssociation(req, res, db) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ ok: false, message: 'Invalid vault association ID.' });
    }
    const vaultAssociation = await db.tables.VaultAssociations.findByPk(id);
    if (!vaultAssociation) {
      return res.status(404).json({ ok: false, message: 'Vault association not found.' });
    }
    await vaultAssociation.destroy();
    res.json({ ok: true, message: 'Vault association deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteVaultAssociation:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

module.exports = {
  listVaultAssociations,
  createVaultAssociation,
  updateVaultAssociation,
  deleteVaultAssociation,
};
