const express = require('express');
const {
  listStaffCredits,
  adjustStaffCredits,
  endStaffGrant,
} = require('../controllers/classes/creditsController');

const creditRoutes = (db) => {
  const router = express.Router();

  router.get('/', (req, res) => listStaffCredits(req, res, db));
  router.post('/', (req, res) => adjustStaffCredits(req, res, db));
  router.post('/:grantId/end', (req, res) => endStaffGrant(req, res, db));

  return router;
};

module.exports = creditRoutes;
