const express = require('express');
const { getProfile, upsertProfile, deleteProfile, getProfiles, getAthleteProfilesForUser, getRegisteredAthletesForUser, getMedalCountsForProfile, getRegisteredAthlete } = require('../controllers/athletesController');
const { 
  checkPermission, 
  checkOwnAthleteProfileOrPermission,
  checkOwnUserOrPermission,
  checkOwnUserOrProfileOrPermission,
} = require('../middlewares/mobileAuthMiddleware');


const athleteRoutes = (db) => {
  const router = express.Router();

  const checkSelfOrAdmin = (req, res, next) => {
    const user = req.user;
    if(user.isAdmin) {
      return next();
    }

    const userId = req.query.userId
    
    // If the request has a userId, and it's the same as the user's who
    // is sending the request, then we're good.
    if (userId && user.id &&
      userId === user.id
    ) {
      return next();
    }
      
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  }

  const checkEditProfilePermission = (req, res, next) => {
    checkOwnAthleteProfileOrPermission(req, res, next, 'edit_others_profiles');
  }
  const checkCreateProfilePermission = (req, res, next) => {
    checkOwnUserOrProfileOrPermission(req, res, next, 'edit_others_profiles');
  }
  const checkManageRolesPermission = (req, res, next) => {
    checkOwnUserOrPermission(req, res, next, 'manage_roles');
  }

  // Pass the db to the controller functions
  router.route('/profile') // TODO: Consider converting to use user id as a path parameter
    .get(checkPermission('view_profiles'), (req, res) => getProfile(req, res, db))
    .put(checkCreateProfilePermission, (req, res) => upsertProfile(req, res, db))
    .delete(checkEditProfilePermission, (req, res) => deleteProfile(req, res, db));

  router.get('/profiles', checkPermission('view_profiles'), (req, res) => getProfiles(req, res, db));

  router.get('/user/profiles', checkManageRolesPermission, (req, res) => getAthleteProfilesForUser(req, res, db));
  router.get('/user/registered', checkManageRolesPermission, (req, res) => getRegisteredAthletesForUser(req, res, db));
  router.get('/medals', checkPermission('view_profiles'), (req, res) => getMedalCountsForProfile(req, res, db));

  // TODO: Add permission check
  router.get('/registered', (req, res) => getRegisteredAthlete(req, res, db));

  return router;
};

module.exports = athleteRoutes;