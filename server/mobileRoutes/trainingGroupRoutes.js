const express = require('express');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');
const {
  listTrainingGroups,
  createTrainingGroup,
  updateTrainingGroup,
} = require('../controllers/classes/trainingGroupsController');

const trainingGroupRoutes = (db) => {
  const router = express.Router();

  router.get('/', (req, res) => listTrainingGroups(req, res, db));
  router.post('/', checkPermission('manage_classes'), (req, res) => createTrainingGroup(req, res, db));
  router.put('/:id', checkPermission('manage_classes'), (req, res) => updateTrainingGroup(req, res, db));

  return router;
};

module.exports = trainingGroupRoutes;
