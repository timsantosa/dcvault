const express = require('express');
const { listCheckIn } = require('../controllers/classes/checkInController');

const classAttendeeRoutes = (db) => {
  const router = express.Router();
  router.get('/', (req, res) => listCheckIn(req, res, db));
  return router;
};

module.exports = classAttendeeRoutes;
