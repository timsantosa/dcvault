const express = require('express');
const {
  listVaultAssociations,
  createVaultAssociation,
  updateVaultAssociation,
  deleteVaultAssociation,
} = require('../controllers/vaultAssociationsController');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');

const vaultAssociationRoutes = (db) => {
  const router = express.Router();

  router.get('/', (req, res) => listVaultAssociations(req, res, db));
  router.post('/', checkPermission('manage_vault_associations'), (req, res) => createVaultAssociation(req, res, db));
  router.put('/:id', checkPermission('manage_vault_associations'), (req, res) => updateVaultAssociation(req, res, db));
  router.delete('/:id', checkPermission('manage_vault_associations'), (req, res) => deleteVaultAssociation(req, res, db));

  return router;
};

module.exports = vaultAssociationRoutes;
