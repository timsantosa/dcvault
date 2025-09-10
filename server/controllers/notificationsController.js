const { Expo } = require('expo-server-sdk');
const { tables } = require('../db/db');
const { Op } = require('sequelize');
const NotificationUtils = require('../utils/notificationUtils');

class NotificationsController {
  /**
   * Register or update a device token for the current user
   * Simple approach using findOrCreate to handle duplicates gracefully
   */
  static async registerDevice(req, res) {
    try {
      const { expoPushToken, deviceInfo } = req.body;
      const userId = req.user.id;
      
      if (!expoPushToken) {
        return res.status(400).json({ error: 'expoPushToken is required' });
      }

      if (!Expo.isExpoPushToken(expoPushToken)) {
        return res.status(400).json({ error: 'Invalid Expo push token format' });
      }

      // Try to find or create the device
      const [device, created] = await tables.UserDevices.findOrCreate({
        where: { expoPushToken },
        defaults: {
          userId,
          expoPushToken,
          deviceInfo,
          isActive: true,
          lastUsed: new Date()
        }
      });

      // If device exists but belongs to different user, transfer it
      if (!created && parseInt(device.userId) !== parseInt(userId)) {
        // Update the existing device to the new user instead of creating a new one
        await device.update({
          userId,
          deviceInfo,
          isActive: true,
          lastUsed: new Date()
        });
        
        return res.json({ 
          success: true, 
          message: 'Device transferred to new user successfully',
          deviceId: device.id
        });
      }

      // Update existing device for same user or return newly created device
      if (!created) {
        await device.update({
          lastUsed: new Date(),
          deviceInfo: deviceInfo || device.deviceInfo,
          isActive: true
        });
      }

      return res.json({ 
        success: true, 
        message: created ? 'Device registered successfully' : 'Device token updated successfully',
        deviceId: device.id
      });

    } catch (error) {
      console.error('Error registering device:', error);
      
      // Handle race condition by trying to find and update existing device
      if (error.name === 'SequelizeUniqueConstraintError') {
        try {
          const existingDevice = await tables.UserDevices.findOne({
            where: { expoPushToken: req.body.expoPushToken }
          });
          
          if (existingDevice && parseInt(existingDevice.userId) === parseInt(req.user.id)) {
            await existingDevice.update({
              lastUsed: new Date(),
              deviceInfo: req.body.deviceInfo || existingDevice.deviceInfo,
              isActive: true
            });
            
            return res.json({ 
              success: true, 
              message: 'Device token updated successfully',
              deviceId: existingDevice.id
            });
          }
        } catch (fallbackError) {
          console.error('Fallback update failed:', fallbackError);
        }
      }
      
      return res.status(500).json({ error: 'Failed to register device' });
    }
  }

  /**
   * Get all devices registered for the current user
   */
  static async getUserDevices(req, res) {
    try {
      const userId = req.user.id;

      const devices = await tables.UserDevices.findAll({
        where: { 
          userId,
          isActive: true 
        },
        attributes: ['id', 'deviceInfo', 'lastUsed', 'createdAt'],
        order: [['lastUsed', 'DESC']]
      });

      const formattedDevices = devices.map(device => ({
        id: device.id,
        deviceName: device.deviceInfo?.deviceName || 'Unknown Device',
        modelName: device.deviceInfo?.modelName || 'Unknown Model',
        osName: device.deviceInfo?.osName || 'Unknown OS',
        osVersion: device.deviceInfo?.osVersion || 'Unknown Version',
        platform: device.deviceInfo?.platform || 'Unknown Platform',
        lastUsed: device.lastUsed,
        registeredAt: device.createdAt
      }));

      res.json({ 
        success: true, 
        devices: formattedDevices,
        count: formattedDevices.length
      });
    } catch (error) {
      console.error('Error getting user devices:', error);
      res.status(500).json({ error: 'Failed to get user devices' });
    }
  }

  /**
   * Unregister current device (for logout)
   */
  static async unregisterCurrentDevice(req, res) {
    try {
      const { expoPushToken } = req.body;
      const userId = req.user.id;

      if (!expoPushToken) {
        return res.status(400).json({ error: 'expoPushToken is required' });
      }

      // Find and deactivate the device for this user
      const device = await tables.UserDevices.findOne({
        where: { 
          expoPushToken,
          userId,
          isActive: true 
        }
      });

      if (device) {
        await device.update({ isActive: false });
        return res.json({ 
          success: true, 
          message: 'Device unregistered successfully'
        });
      } else {
        // Device not found, but that's okay - maybe already unregistered
        return res.json({ 
          success: true, 
          message: 'Device was not registered or already unregistered'
        });
      }
    } catch (error) {
      console.error('Error unregistering device:', error);
      res.status(500).json({ error: 'Failed to unregister device' });
    }
  }

  /**
   * Remove a specific device for the current user
   */
  static async removeDevice(req, res) {
    try {
      const userId = req.user.id;
      const { deviceId } = req.params;

      const device = await tables.UserDevices.findOne({
        where: { 
          id: deviceId,
          userId,
          isActive: true 
        }
      });

      if (!device) {
        return res.status(404).json({ error: 'Device not found or already removed' });
      }

      await device.update({ isActive: false });

      res.json({ 
        success: true, 
        message: 'Device removed successfully'
      });
    } catch (error) {
      console.error('Error removing device:', error);
      res.status(500).json({ error: 'Failed to remove device' });
    }
  }

  /**
   * Send a test notification to the current user's devices
   */
  static async sendTestNotification(req, res) {
    try {
      const userId = req.user.id;
      const { title = 'Test Notification', body = 'This is a test notification from DC Vault!' } = req.body;

      const devices = await tables.UserDevices.findAll({
        where: { 
          userId,
          isActive: true 
        }
      });

      if (devices.length === 0) {
        return res.status(404).json({ error: 'No active devices found for this user' });
      }

      const messages = devices
        .filter(device => Expo.isExpoPushToken(device.expoPushToken))
        .map(device => ({
          to: device.expoPushToken,
          sound: 'default',
          title,
          body,
          data: { type: 'test', userId }
        }));

      if (messages.length === 0) {
        return res.status(400).json({ error: 'No valid push tokens found' });
      }

      const tickets = await NotificationUtils.sendPushNotifications(messages);

      res.json({ 
        success: true, 
        message: `Test notification sent to ${messages.length} device(s)`,
        sentCount: messages.length,
        tickets
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({ error: 'Failed to send test notification' });
    }
  }


  /**
   * Get notification statistics (admin only)
   */
  static async getNotificationStats(req, res) {
    try {
      const totalUsers = await tables.Users.count();
      const activeDevices = await tables.UserDevices.count({
        where: { isActive: true }
      });
      const usersWithDevices = await tables.UserDevices.count({
        where: { isActive: true },
        distinct: true,
        col: 'userId'
      });
      const inactiveDevices = await tables.UserDevices.count({
        where: { isActive: false }
      });

      // Get device breakdown by platform - MySQL 5.7 compatible approach
      let devicesByPlatform = [];
      try {
        // Try the JSON_EXTRACT approach first (works in MySQL 5.7.8+)
        devicesByPlatform = await tables.UserDevices.findAll({
          where: { isActive: true },
          attributes: [
            [tables.UserDevices.sequelize.fn('JSON_EXTRACT', tables.UserDevices.sequelize.col('deviceInfo'), '$.platform'), 'platform'],
            [tables.UserDevices.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: [tables.UserDevices.sequelize.fn('JSON_EXTRACT', tables.UserDevices.sequelize.col('deviceInfo'), '$.platform')],
          raw: true
        });
      } catch (jsonError) {
        console.warn('JSON_EXTRACT not supported, falling back to application-level parsing:', jsonError.message);
        
        try {
          // Fallback: Get all devices and parse JSON in application
          const allDevices = await tables.UserDevices.findAll({
            where: { isActive: true },
            attributes: ['deviceInfo'],
            raw: true
          });
          
          // Parse deviceInfo and count platforms
          const platformCounts = {};
          
          if (Array.isArray(allDevices)) {
            allDevices.forEach(device => {
              try {
                // Handle null/undefined device or deviceInfo
                if (!device || device.deviceInfo === null || device.deviceInfo === undefined) {
                  platformCounts['Unknown'] = (platformCounts['Unknown'] || 0) + 1;
                  return;
                }
                
                let deviceInfo;
                if (typeof device.deviceInfo === 'string') {
                  // Parse JSON string, but handle empty strings
                  deviceInfo = device.deviceInfo.trim() ? JSON.parse(device.deviceInfo) : {};
                } else if (typeof device.deviceInfo === 'object') {
                  deviceInfo = device.deviceInfo;
                } else {
                  // Unexpected type
                  deviceInfo = {};
                }
                
                // Safely extract platform
                const platform = (deviceInfo && typeof deviceInfo === 'object' && deviceInfo.platform) 
                  ? String(deviceInfo.platform) 
                  : 'Unknown';
                
                platformCounts[platform] = (platformCounts[platform] || 0) + 1;
              } catch (parseError) {
                // Handle any JSON parsing or other errors for this device
                console.warn('Error parsing device info for individual device:', parseError.message);
                platformCounts['Unknown'] = (platformCounts['Unknown'] || 0) + 1;
              }
            });
          }
          
          // Convert to expected format with safe handling
          try {
            devicesByPlatform = Object.entries(platformCounts || {}).map(([platform, count]) => ({
              platform: String(platform || 'Unknown'),
              count: String(Number(count) || 0) // Ensure valid number conversion
            }));
          } catch (formatError) {
            console.error('Error formatting platform counts:', formatError.message);
            // Provide safe fallback
            devicesByPlatform = [{ platform: 'Unknown', count: '0' }];
          }
          
        } catch (fallbackError) {
          console.error('Fallback devicesByPlatform query failed:', fallbackError.message);
          // Provide safe fallback when everything fails
          devicesByPlatform = [{ platform: 'Unknown', count: '0' }];
        }
      }

      res.json({
        totalUsers,
        activeDevices,
        inactiveDevices,
        usersWithDevices,
        usersWithoutDevices: totalUsers - usersWithDevices,
        enabledPercentage: ((usersWithDevices / totalUsers) * 100).toFixed(1),
        avgDevicesPerUser: usersWithDevices > 0 ? (activeDevices / usersWithDevices).toFixed(1) : '0',
        devicesByPlatform: devicesByPlatform.map(item => ({
          platform: item.platform || 'Unknown',
          count: parseInt(item.count)
        }))
      });
    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({ error: 'Failed to get notification statistics' });
    }
  }

  /**
   * Clean up old devices (admin only)
   */
  static async cleanupOldDevices(req, res) {
    try {
      const deletedCount = await NotificationUtils.cleanupOldDevices();
      
      res.json({ 
        success: true, 
        message: `Cleaned up ${deletedCount} old device records`,
        deletedCount
      });
    } catch (error) {
      console.error('Error cleaning up devices:', error);
      res.status(500).json({ error: 'Failed to cleanup old devices' });
    }
  }
}

module.exports = NotificationsController;
