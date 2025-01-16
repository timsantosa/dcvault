const express = require('express');
const { getProfile, addOrUpdateProfile, deleteProfile, getProfiles, getLatestAthlete } = require('../controllers/athletesController');


const athleteRoutes = (db) => {
  const router = express.Router();

  const checkUserPermission = (req, res, next) => {
    console.log('Checking user has permission for these commands')
    next()
  }
  router.use(checkUserPermission)

  // Pass the db to the controller functions
  router.route('/profile') // TODO: Consider converting to use user id as a path parameter
    .get((req, res) => getProfile(req, res, db))
    .put((req, res) => addOrUpdateProfile(req, res, db))
    .delete((req, res) => deleteProfile(req, res, db));

  router.get('/profiles', (req, res) => getProfiles(req, res, db));

  router.get('/latestregistered', (req, res) => getLatestAthlete(req, res, db))

  return router;
};

module.exports = athleteRoutes;