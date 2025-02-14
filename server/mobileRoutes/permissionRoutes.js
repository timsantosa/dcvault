
const express = require('express');
const { addRoleToUser, removeRoleFromUser } = require('../controllers/permissionsController');
const adminCheck = require('../middlewares/admin');


const permissionRoutes = (db) => {
  const router = express.Router();

  // Pass the db to the controller functions
  router.route('/user/role')
    .get((req, res) => getRolesForUser(req, res, db))
    .post((req, res) => addRoleToUser(req, res, db))
    .delete((req, res) => removeRoleFromUser(req, res, db));

  router.route('/user/permission')
    .get((req, res) => getPermissionsForUser(req, res, db))
    .post((req, res) => addPermissionToUser(req, res, db))
    .delete((req, res) => removePermissionFromUser(req, res, db));

  router.route('/role/permission')
    .get((req, res) => getPermissionsForRole(req, res, db))
    .post((req, res) => addPermissionToRole(req, res, db))
    .delete((req, res) => removePermissionFromRole(req, res, db));

  return router;
};

module.exports = permissionRoutes;