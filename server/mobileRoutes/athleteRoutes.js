const express = require('express');
const { getProfile, upsertProfile, deleteProfile, getProfiles, getLatestAthlete, getAthleteProfilesForUser, getRegisteredAthletesForUser } = require('../controllers/athletesController');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');


const athleteRoutes = (db) => {
  const router = express.Router();

  const checkUserPermission = (req, res, next) => {
    console.log('Checking user has permission for these commands');
    next();
  }
  router.use(checkUserPermission);

  const checkSelfOrAdmin = (req, res, next) => {
    const user = req.user;
    if(user.isAdmin) {
      return next();
    }

    const athleteProfileId = req.body.athleteProfileId;
    const userId = req.body.userId
    // If the request has an athleteProfileId, and it's the same as the user's who
    // is sending the request, then we're good.
    if (athleteProfileId && user.athleteProfileId &&
      athleteProfileId === user.athleteProfileId
    ) {
      return next();
    } 
    
    // If the request has a userId, and it's the same as the user's who
    // is sending the request, then we're good.
    if (userId && user.id &&
      userId === user.id
    ) {
      return next();
    }
      
    return res.status(403).json({ ok: false, message: 'Forbidden' });
  }

  // Pass the db to the controller functions
  router.route('/profile') // TODO: Consider converting to use user id as a path parameter
    .get(checkPermission('view_profiles'), (req, res) => getProfile(req, res, db))
    .put(checkSelfOrAdmin, (req, res) => upsertProfile(req, res, db))
    .delete(checkSelfOrAdmin, (req, res) => deleteProfile(req, res, db));

  router.get('/profiles', (req, res) => getProfiles(req, res, db));

  router.get('/latestregistered', checkSelfOrAdmin, (req, res) => getLatestAthlete(req, res, db))

  router.get('/user/profiles', checkPermission('manage_roles'), (req, res) => getAthleteProfilesForUser(req, res, db));
  router.get('/user/registered', checkPermission('manage_roles'), (req, res) => getRegisteredAthletesForUser(req, res, db));

  return router;
};

module.exports = athleteRoutes;