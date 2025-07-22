const express = require('express');
const { mobileLogin, refreshToken, revokeToken } = require('../controllers/authController');

const authRoutes = (db) => {
  const router = express.Router();

  router.post('/login', (req, res) => mobileLogin(req, res, db));
  router.post('/refresh', (req, res) => refreshToken(req, res, db));
  router.post('/revoke', (req, res) => revokeToken(req, res, db));
  
  // router.post('/signup', (req, res) => signup(req, res, db));

  return router;
};

module.exports = authRoutes;