const express = require('express');
const {
  listClasses,
  getClass,
  createClass,
  updateClass,
  cancelClass,
  deleteClass,
} = require('../controllers/classesController');

const classRoutes = (db) => {
  const router = express.Router();

  router.get('/', (req, res) => listClasses(req, res, db));
  router.post('/', (req, res) => createClass(req, res, db));
  router.get('/:id', (req, res) => getClass(req, res, db));
  router.put('/:id', (req, res) => updateClass(req, res, db));
  router.post('/:id/cancel', (req, res) => cancelClass(req, res, db));
  router.post('/:id/delete', (req, res) => deleteClass(req, res, db));

  return router;
};

module.exports = classRoutes;
