const express = require('express');
const { getJump, addOrUpdateJump, deleteJump, fetchJumps, verifyJump, getUnverifiedMeetJumps } = require('../controllers/jumpsController');
const adminCheck = require('../middlewares/admin');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');


const jumpRoutes = (db) => {
  const router = express.Router();

  const checkSelfOrAdmin = (req, res, next) => {
    const user = req.user;
    if(user.isAdmin) {
      return next();
    }

    const athleteProfileId = req.query.athleteProfileId;
    if (!athleteProfileId || !user.athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Unauthorized' });
    }

    if (athleteProfileId != user.athleteProfileId) {
      return res.status(403).json({ ok: false, message: 'Forbidden' });
    }

    next();
  }

  // Pass the db to the controller functions
  router.route('/jump')
    .get(checkSelfOrAdmin, (req, res) => getJump(req, res, db))
    .put(checkSelfOrAdmin, (req, res) => addOrUpdateJump(req, res, db))
    .delete(checkSelfOrAdmin, (req, res) => deleteJump(req, res, db));
    
  router.get('/jumps', checkSelfOrAdmin, (req, res) => fetchJumps(req, res, db));

  return router;
};

module.exports = jumpRoutes;