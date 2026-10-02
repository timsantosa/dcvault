const express = require('express');
const {
  listClassPackages,
  createClassPackage,
  updateClassPackage,
  reorderClassPackages,
} = require('../controllers/classPackagesController');

const classPackageRoutes = (db) => {
  const router = express.Router();

  router.get('/', (req, res) => listClassPackages(req, res, db));
  router.post('/', (req, res) => createClassPackage(req, res, db));
  router.put('/order', (req, res) => reorderClassPackages(req, res, db));
  router.put('/:id', (req, res) => updateClassPackage(req, res, db));

  return router;
};

module.exports = classPackageRoutes;
