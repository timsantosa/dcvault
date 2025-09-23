const express = require('express');
const {
  getAllUsers,
  getAllUsersWithRole,
  getUserById
} = require('../controllers/usersController');

const userRoutes = (db) => {
  const router = express.Router();

  // Get all users with pagination
  router.route('/users')
    .get((req, res) => getAllUsers(req, res, db));

  // Get user by ID
  router.route('/users/:userId')
    .get((req, res) => getUserById(req, res, db));

  // Get all users with a specific role
  router.route('/role/:roleId/users')
    .get((req, res) => getAllUsersWithRole(req, res, db));

  return router;
};

module.exports = userRoutes;
