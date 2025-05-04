const express = require('express');
const { getJump, addOrUpdateJump, deleteJump, fetchJumps, verifyJump, getUnverifiedMeetJumps } = require('../controllers/jumpsController');
const { checkPermission, checkOwnAthleteProfileOrPermission } = require('../middlewares/mobileAuthMiddleware');


const jumpRoutes = (db) => {
  const router = express.Router();

  const checkJumpViewPermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'view_others_jumps');
  }

  const checkJumpEditPermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'edit_others_jumps');
  }

  // Pass the db to the controller functions
  router.route('/jump')
    .get(checkJumpViewPermission, (req, res) => getJump(req, res, db))
    .put(checkJumpEditPermission, (req, res) => addOrUpdateJump(req, res, db))
    .delete(checkJumpEditPermission, (req, res) => deleteJump(req, res, db));
    
  router.get('/jumps', checkJumpViewPermission, (req, res) => fetchJumps(req, res, db));

  return router;
};

module.exports = jumpRoutes;