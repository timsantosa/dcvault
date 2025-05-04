const express = require('express');
const router = express.Router();
const { 
  getAllMeetInfoOptions,
  getChampionshipTypes,
  getDivisionTypes,
  getRecordTypes,
  updateChampionshipTypes,
  updateDivisionTypes,
  updateRecordTypes
} = require('../controllers/meetDataController');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');

module.exports = function meetDataRoutes(db) {
  // Get all meet type options combined
  router.get('/options', getAllMeetInfoOptions);

  // Get individual type options
  router.get('/championship-types', checkPermission('manage_meet_data'), getChampionshipTypes);
  router.get('/division-types', checkPermission('manage_meet_data'), getDivisionTypes);
  router.get('/record-types', checkPermission('manage_meet_data'), getRecordTypes);

  // Update type options (admin only)
  router.put('/championship-types', checkPermission('manage_meet_data'), updateChampionshipTypes);
  router.put('/division-types', checkPermission('manage_meet_data'), updateDivisionTypes);
  router.put('/record-types', checkPermission('manage_meet_data'), updateRecordTypes);

  return router;
};
