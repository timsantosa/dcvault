const express = require('express');
const { checkPermission, checkOwnUserOrPermission } = require('../middlewares/mobileAuthMiddleware');
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
  createRole,
  deleteRole,
  getAllRoles,
  getAllPermissions
} = require('../controllers/permissionsController');
const { getAllUsersWithRole } = require('../controllers/usersController');

const manageRoles = checkPermission('manage_roles');

const permissionRoutes = (db) => {
  const router = express.Router();

  // User role: GET = own user or manage_roles, POST/DELETE = manage_roles
  router.route('/user/role')
    .get((req, res, next) => checkOwnUserOrPermission(req, res, next, 'manage_roles'), (req, res) => getRolesForUser(req, res, db))
    .post(manageRoles, (req, res) => addRoleToUser(req, res, db))
    .delete(manageRoles, (req, res) => removeRoleFromUser(req, res, db));

  // User permission: GET = own user or manage_roles, POST/DELETE = manage_roles
  router.route('/user/permission')
    .get((req, res, next) => checkOwnUserOrPermission(req, res, next, 'manage_roles'), (req, res) => getPermissionsForUser(req, res, db))
    .post(manageRoles, (req, res) => addPermissionToUser(req, res, db))
    .delete(manageRoles, (req, res) => removePermissionFromUser(req, res, db));

  // Role permission: GET = any authenticated, POST/DELETE = manage_roles
  router.route('/role/permission')
    .get(manageRoles, (req, res) => getPermissionsForRole(req, res, db))
    .post(manageRoles, (req, res) => addPermissionToRole(req, res, db))
    .delete(manageRoles, (req, res) => removePermissionFromRole(req, res, db));

  // List endpoints: any authenticated user
  router.route('/list')
    .get((req, res) => getAllPermissions(req, res, db));

  router.route('/roles')
    .get((req, res) => getAllRoles(req, res, db));

  // Role CRUD: POST/DELETE = manage_roles
  router.route('/role')
    .post(manageRoles, (req, res) => createRole(req, res, db));

  router.route('/role/:roleId')
    .delete(manageRoles, (req, res) => deleteRole(req, res, db));

  router.route('/role/:roleId/users')
    .get(manageRoles, (req, res) => getAllUsersWithRole(req, res, db));

  return router;
};

module.exports = permissionRoutes;