const express = require('express');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');
const { reserveClass, cancelReservation } = require('../controllers/classes/reservationsController');

const reservationRoutes = (db) => {
  const router = express.Router();
  router.post('/', checkPermission('reserve_classes'), (req, res) => reserveClass(req, res, db));
  // Own profile with reserve_classes, or any profile with manage_classes.
  router.post('/cancel', (req, res) => cancelReservation(req, res, db));
  return router;
};

module.exports = reservationRoutes;
