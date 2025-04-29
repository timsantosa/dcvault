const express = require('express');
const { getDrill, addOrUpdateDrill, deleteDrill, fetchDrills } = require('../controllers/drillsController');
const { checkOwnAthleteProfileOrPermission } = require('../middlewares/mobileAuthMiddleware');

const drillRoutes = (db) => {
  const router = express.Router();

  // Check if user has permission to view others' drills or is viewing their own
  const checkDrillViewPermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'view_others_jumps');
  };

  // Check if user has permission to edit others' drills or is editing their own
  const checkDrillEditPermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'edit_others_jumps');
  };

  // Pass the db to the controller functions
  router.route('/drill')
    .get(checkDrillViewPermission, (req, res) => getDrill(req, res, db))
    .put(checkDrillEditPermission, (req, res) => addOrUpdateDrill(req, res, db))
    .delete(checkDrillEditPermission, (req, res) => deleteDrill(req, res, db));
    
  router.get('/drills', checkDrillViewPermission, (req, res) => fetchDrills(req, res, db));

  return router;
};

module.exports = drillRoutes;
