const express = require('express');
const { getProfile, upsertProfile, deleteProfile, getProfiles, getLatestAthlete } = require('../controllers/athletesController');
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

    // TODO: add athlete profile id to jwt
    const athleteProfileId = req.body.athleteProfileId;
    const userId = req.body.userId
    if (!user.id || !user.athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Unauthorized' });
    }

    // If trying to modify another athlete's profile or 
    // create one for another user, reject it.
    if ((athleteProfileId && (athleteProfileId !== user.athleteProfileId)) ||
      (userId && (userId !== user.id))
    ) {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }

    next();
  }

  // Pass the db to the controller functions
  router.route('/profile') // TODO: Consider converting to use user id as a path parameter
    .get(checkPermission('view_profiles'), (req, res) => getProfile(req, res, db))
    .put(checkSelfOrAdmin, (req, res) => upsertProfile(req, res, db))
    .delete(checkSelfOrAdmin, (req, res) => deleteProfile(req, res, db));

  router.get('/profiles', (req, res) => getProfiles(req, res, db));

  // TODO: this fails because not self or admin, check for athlete Id
  router.get('/latestregistered', checkSelfOrAdmin, (req, res) => getLatestAthlete(req, res, db))

  return router;
};

module.exports = athleteRoutes;