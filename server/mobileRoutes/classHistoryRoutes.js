const express = require('express');
const { getClassProgress, getClassHistory } = require('../controllers/classes/classHistoryController');

const classProgressRoutes = (db) => {
  const router = express.Router();
  router.get('/', (req, res) => getClassProgress(req, res, db));
  return router;
};

const classHistoryRoutes = (db) => {
  const router = express.Router();
  router.get('/', (req, res) => getClassHistory(req, res, db));
  return router;
};

module.exports = {
  classProgressRoutes,
  classHistoryRoutes,
};
