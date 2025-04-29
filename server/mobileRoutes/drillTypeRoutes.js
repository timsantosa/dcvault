const express = require('express');
const { setDrillTypes, getDrillTypes } = require('../controllers/drillsController');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');

const drillTypeRoutes = (db) => {
  const router = express.Router();

  router.route('/')
    .get((req, res) => getDrillTypes(req, res, db))
    .put(checkPermission('manage_drill_types'), (req, res) => setDrillTypes(req, res, db));

  return router;
};

module.exports = drillTypeRoutes;