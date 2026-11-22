const express = require('express');
const { markPresent, addWalkIn } = require('../controllers/classes/checkInController');

const checkInRoutes = (db) => {
  const router = express.Router();
  router.post('/walk-in', (req, res) => addWalkIn(req, res, db));
  router.post('/', (req, res) => markPresent(req, res, db));
  return router;
};

module.exports = checkInRoutes;
