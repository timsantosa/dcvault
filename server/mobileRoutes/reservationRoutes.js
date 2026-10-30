const express = require('express');
const { reserveClass, cancelReservation } = require('../controllers/classes/reservationsController');

const reservationRoutes = (db) => {
  const router = express.Router();
  router.post('/', (req, res) => reserveClass(req, res, db));
  router.post('/cancel', (req, res) => cancelReservation(req, res, db));
  return router;
};

module.exports = reservationRoutes;
