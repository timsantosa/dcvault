const express = require('express');
const { getMemberSchedule } = require('../controllers/memberScheduleController');

const memberScheduleRoutes = (db) => {
  const router = express.Router();
  router.get('/', (req, res) => getMemberSchedule(req, res, db));
  return router;
};

module.exports = memberScheduleRoutes;
