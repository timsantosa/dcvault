const express = require('express');
const {
  getRolesForUser,
  addRoleToUser,
  removeRoleFromUser,
  getPermissionsForUser,
  addPermissionToUser,
  removePermissionFromUser,
  getPermissionsForRole,
  addPermissionToRole,
  removePermissionFromRole,
  getAllUsersWithRole,
  createRole,
  deleteRole,
  getAllRoles, 
  getAllPermissions
} = require('../controllers/permissionsController');

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

  router.route('/list')
    .get((req, res) => getAllPermissions(req, res, db));

  router.route('/roles')
    .get((req, res) => getAllRoles(req, res, db));

  router.route('/role')
    .post((req, res) => createRole(req, res, db));

  router.route('/role/:roleId')
    .delete((req, res) => deleteRole(req, res, db));

  router.route('/role/:roleId/users')
    .get((req, res) => getAllUsersWithRole(req, res, db));

  return router;
};

module.exports = permissionRoutes;