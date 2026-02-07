const express = require('express');
const router = express.Router();
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');
const {
  getFacilities,
  getOrganizations,
  getMeetNames,
  createFacility,
  updateFacility,
  deleteFacility,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  createMeetName,
  updateMeetName,
  deleteMeetName
} = require('../controllers/meetEntityController');

module.exports = function meetEntityRoutes(db) {
  // GET — optional query param `search`; any authenticated user
  router.get('/facilities', (req, res) => getFacilities(req, res, db));
  router.get('/organizations', (req, res) => getOrganizations(req, res, db));
  router.get('/meet-names', (req, res) => getMeetNames(req, res, db));

  // Admin CRUD — Manage Meet Data permission
  router.post('/facilities', checkPermission('manage_meet_data'), (req, res) => createFacility(req, res, db));
  router.put('/facilities/:id', checkPermission('manage_meet_data'), (req, res) => updateFacility(req, res, db));
  router.delete('/facilities/:id', checkPermission('manage_meet_data'), (req, res) => deleteFacility(req, res, db));

  router.post('/organizations', checkPermission('manage_meet_data'), (req, res) => createOrganization(req, res, db));
  router.put('/organizations/:id', checkPermission('manage_meet_data'), (req, res) => updateOrganization(req, res, db));
  router.delete('/organizations/:id', checkPermission('manage_meet_data'), (req, res) => deleteOrganization(req, res, db));

  router.post('/meet-names', checkPermission('manage_meet_data'), (req, res) => createMeetName(req, res, db));
  router.put('/meet-names/:id', checkPermission('manage_meet_data'), (req, res) => updateMeetName(req, res, db));
  router.delete('/meet-names/:id', checkPermission('manage_meet_data'), (req, res) => deleteMeetName(req, res, db));

  return router;
};
