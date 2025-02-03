const express = require('express');
const { getJump, addOrUpdateJump, deleteJump, fetchJumps, verifyJump } = require('../controllers/jumpsController');
const adminCheck = require('../middlewares/admin');


const jumpRoutes = (db) => {
  const router = express.Router();

  const checkUserPermission = (req, res, next) => {
    console.log('Checking user has permission for these commands')
    next()
  }
  router.use(checkUserPermission)

  // Pass the db to the controller functions
  router.route('/jump')
    .get((req, res) => getJump(req, res, db))
    .put((req, res) => addOrUpdateJump(req, res, db))
    .delete((req, res) => deleteJump(req, res, db));
    
  router.get('/jumps', (req, res) => fetchJumps(req, res, db));


  // Admin routes
  router.get('/jump/verify', adminCheck, (req, res) => verifyJump(req, res, db));

  return router;
};

module.exports = jumpRoutes;