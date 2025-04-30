const express = require('express');
const { getProfile, upsertProfile, deleteProfile, getProfiles, getLatestAthlete, getAthleteProfilesForUser, getRegisteredAthletesForUser, getMedalCountsForProfile } = require('../controllers/athletesController');
const { checkPermission, checkOwnAthleteProfileOrPermission } = require('../middlewares/mobileAuthMiddleware');


const athleteRoutes = (db) => {
  const router = express.Router();

  // const checkUserPermission = (req, res, next) => {
  //   console.log('Checking user has permission for these commands');
  //   next();
  // }
  // router.use(checkUserPermission);

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

  // Pass the db to the controller functions
  router.route('/profile') // TODO: Consider converting to use user id as a path parameter
    .get(checkPermission('view_profiles'), (req, res) => getProfile(req, res, db))
    .put(checkEditProfilePermission, (req, res) => upsertProfile(req, res, db))
    .delete(checkEditProfilePermission, (req, res) => deleteProfile(req, res, db));

  router.get('/profiles', checkPermission('view_profiles'), (req, res) => getProfiles(req, res, db));

  // TODO: this might get replaced by /user/registered
  router.get('/latestregistered', checkSelfOrAdmin, (req, res) => getLatestAthlete(req, res, db))

  router.get('/user/profiles', checkPermission('manage_roles'), (req, res) => getAthleteProfilesForUser(req, res, db));
  router.get('/user/registered', checkPermission('manage_roles'), (req, res) => getRegisteredAthletesForUser(req, res, db));
  router.get('/medals', checkPermission('view_profiles'), (req, res) => getMedalCountsForProfile(req, res, db));

  return router;
};

module.exports = athleteRoutes;