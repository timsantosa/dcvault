const express = require('express');
const { mobileLogin,  } = require('../controllers/authController');


const authRoutes = (db) => {
  const router = express.Router();

  router.post('/login', (req, res) => mobileLogin(req, res, db));
  // router.post('/register', (req, res) => register(req, res, db));

  return router;
};

module.exports = authRoutes;