const express = require('express');
const NotificationsController = require('../controllers/notificationsController');
const { checkPermission } = require('../middlewares/mobileAuthMiddleware');

module.exports = function(db) {
  const router = express.Router();

  // User device management endpoints
  router.post('/register-device', NotificationsController.registerDevice);
  router.post('/unregister-device', NotificationsController.unregisterCurrentDevice);
  router.get('/my-devices', NotificationsController.getUserDevices);
  router.delete('/devices/:deviceId', NotificationsController.removeDevice);
  router.post('/test', NotificationsController.sendTestNotification);


  // Admin-only endpoints for managing notifications
  router.get('/stats', 
    checkPermission('send_notifications'), 
    NotificationsController.getNotificationStats
  );

  router.delete('/cleanup-old-devices', 
    checkPermission('send_notifications'), 
    NotificationsController.cleanupOldDevices
  );

  return router;
};
