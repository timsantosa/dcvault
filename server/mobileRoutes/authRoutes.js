const express = require('express');
const { login, register } = require('../controllers/authController');


const authRoutes = (db) => {
  const router = express.Router();

  // const checkUserPermission = (req, res, next) => {
  //   console.log('Checking user has permission for these commands')
  //   next()
  // }
  // router.use(checkUserPermission)

  // Pass the db to the controller functions
  router.post('/login', (req, res) => login(req, res, db));
  router.post('/register', (req, res) => register(req, res, db));

  return router;
};

module.exports = authRoutes;