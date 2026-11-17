const express = require('express');
const { getClassProgress } = require('../controllers/classes/classProgressController');

const classProgressRoutes = (db) => {
  const router = express.Router();
  router.get('/', (req, res) => getClassProgress(req, res, db));
  return router;
};

module.exports = classProgressRoutes;
