const express = require('express');
const { getJump, addOrUpdateJump, deleteJump, fetchJumps, pinOrUnpinJump, getFavoriteJumps, getTopMeetJumps } = require('../controllers/jumpsController');
const { checkPermission, checkOwnAthleteProfileOrPermission } = require('../middlewares/mobileAuthMiddleware');


const jumpRoutes = (db) => {
  const router = express.Router();

  const checkJumpViewPermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'view_others_jumps');
  }

  const checkViewJumpsOrMeetsRequest = (req, res, next) => {
    if (req.query?.setting === 'meet' || req.query?.setting === 'Meet') {
      return next();
    }
    checkOwnAthleteProfileOrPermission(req, res, next, 'view_others_jumps');
  }

  const checkJumpEditPermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'edit_others_jumps');
  }

  const checkViewProfilesPermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'view_profiles');
  }

  // Pass the db to the controller functions
  router.route('/jump')
    .get(checkJumpViewPermission, (req, res) => getJump(req, res, db))
    .put(checkJumpEditPermission, (req, res) => addOrUpdateJump(req, res, db))
    .delete(checkJumpEditPermission, (req, res) => deleteJump(req, res, db));
    
  router.get('/jumps', checkViewJumpsOrMeetsRequest, (req, res) => fetchJumps(req, res, db));

  // Favorite jumps routes
  router.post('/favorite-jump', checkJumpEditPermission, (req, res) => pinOrUnpinJump(req, res, db));
  router.get('/favorite-jumps', checkJumpViewPermission, (req, res) => getFavoriteJumps(req, res, db));

  router.get('/top-meet-jumps', checkViewProfilesPermission,(req, res) => getTopMeetJumps(req, res, db));

  return router;
};

module.exports = jumpRoutes;