const { Expo } = require('expo-server-sdk');
const { tables } = require('../db/db');
const { Op } = require('sequelize');

// Create a new Expo SDK client
const expo = new Expo();

class NotificationUtils {
  /**
   * Send push notifications to users associated with athlete profiles
   * @param {Array} athleteProfileIds - Array of athlete profile IDs
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data to send with notification
   * @param {number} badge - Badge count for iOS notifications
   * @returns {Object} Result with success status and send count
   */
  static async sendNotificationToAthleteProfiles(athleteProfileIds, title, body, data = {}, badge = undefined) {
    try {
      // Get users associated with these athlete profiles
      const athleteProfiles = await tables.AthleteProfiles.findAll({
        where: { id: athleteProfileIds },
        include: [{
          model: tables.Users,
          as: 'user',
          include: [{
            model: tables.UserDevices,
            as: 'devices',
            where: { isActive: true },
            required: false // LEFT JOIN so we get profiles even without devices
          }]
        }]
      });

      // Collect all active push tokens
      const messages = [];
      const userNotificationMap = new Map();

      // TODO: If athlete profiles belong to the same user, only send one notification.
      athleteProfiles.forEach(profile => {
        if (profile.user && profile.user.devices) {
          profile.user.devices.forEach(device => {
            if (Expo.isExpoPushToken(device.expoPushToken)) {
              const message = {
                to: device.expoPushToken,
                sound: 'default',
                title,
                body,
                data: {
                  ...data,
                  userId: profile.user.id,
                  athleteProfileId: profile.id
                },
                badge: badge,
              };
              
              messages.push(message);
              
              // Track which users we're notifying
              userNotificationMap.set(profile.user.id, {
                name: `${profile.firstName} ${profile.lastName}`,
                deviceCount: (userNotificationMap.get(profile.user.id)?.deviceCount || 0) + 1
              });
            }
          });
        }
      });

      if (messages.length === 0) {
        return { success: true, sentCount: 0, message: 'No active devices found' };
      }

      const tickets = await this.sendPushNotifications(messages);
      
      return {
        success: true,
        sentCount: messages.length,
        userCount: userNotificationMap.size,
        tickets
      };
    } catch (error) {
      console.error('Error sending notifications to athlete profiles:', error);
      throw error;
    }
  }

  /**
   * Send notification when someone sends a message
   * @param {number} conversationId - The conversation ID
   * @param {number} senderId - The athlete profile ID of the sender
   * @param {string} messageContent - The message content
   * @returns {Object} Result with success status
   */
  static async notifyMessageRecipients(conversationId, senderId, messageContent) {
    try {
      // Get conversation info and participants (excluding sender)
      const [conversation, participants] = await Promise.all([
        tables.Conversations.findByPk(conversationId, {
          attributes: ['name', 'type']
        }),
        tables.ConversationParticipants.findAll({
          where: { 
            conversationId,
            athleteProfileId: { [Op.ne]: senderId }
          },
          attributes: ['athleteProfileId']
        })
      ]);

      if (participants.length === 0) {
        return { success: true, notifiedDevices: 0 };
      }

      // Get sender info for notification
      const sender = await tables.AthleteProfiles.findByPk(senderId);
      const senderName = `${sender.firstName} ${sender.lastName}`;

      // Determine conversation display name
      let conversationName = '';
      if (conversation.name) {
        // Group conversation with a name
        conversationName = conversation.name;
      } else if (conversation.type === 'direct') {
        // Direct message - use sender name as context
        conversationName = '';
      } else if (conversation.type === 'announcement_all') {
        conversationName = 'All Athletes';
      } else if (conversation.type === 'announcement_active') {
        conversationName = 'Active Athletes';
      }

      // Build notification title
      const title = conversationName ? conversationName : senderName;
      const body = `${conversation.type !== 'direct' && `${senderName}: `}${messageContent.substring(0, 100)}${messageContent.length > 100 ? '...' : ''}`;

      // Send notifications with badge counts
      const participantIds = participants.map(p => p.athleteProfileId);
      
      // For simplicity, we'll send a batch notification with a generic badge count
      // In a production app, you might want to calculate individual unread counts
      const data = {
        type: 'message',
        conversationId,
        senderId,
        senderName,
        conversationName
      };
      
      const result = await this.sendNotificationToAthleteProfiles(
        participantIds,
        title,
        body,
        data,
        1 // Badge count - shows there's at least 1 unread message
      );

      return { success: true, notifiedDevices: result.sentCount };
    } catch (error) {
      console.error('Error notifying message recipients:', error);
      throw error;
    }
  }

  /**
   * Send notification when jump needs verification
   * @param {number} jumpId - The jump ID
   * @param {number} athleteProfileId - The athlete profile ID
   * @returns {Object} Result with success status
   */
  static async notifyAdminsOfPendingJump(jumpId, athleteProfileId) {
    try {
      // Get users with verify_jumps permission
      const admins = await tables.Users.findAll({
        include: [
          {
            model: tables.UserDevices,
            as: 'devices',
            where: { isActive: true },
            required: false
          },
          {
            model: tables.Permissions,
            where: { permissionKey: 'verify_jumps' },
            through: { attributes: [] } // Don't include junction table data
          }
        ]
      });

      // Get athlete info
      const athleteProfile = await tables.AthleteProfiles.findByPk(athleteProfileId);
      const athleteName = `${athleteProfile.firstName} ${athleteProfile.lastName}`;

      const messages = [];
      admins.forEach(admin => {
        if (admin.devices) {
          admin.devices.forEach(device => {
            if (Expo.isExpoPushToken(device.expoPushToken)) {
              messages.push({
                to: device.expoPushToken,
                sound: 'default',
                title: 'Jump Verification Needed',
                body: `${athleteName} submitted a jump for verification`,
                data: {
                  type: 'jump_verification',
                  jumpId,
                  athleteProfileId,
                  athleteName
                }
              });
            }
          });
        }
      });

      if (messages.length > 0) {
        await this.sendPushNotifications(messages);
      }

      return { success: true, notifiedDevices: messages.length };
    } catch (error) {
      console.error('Error notifying admins of pending jump:', error);
      throw error;
    }
  }


  /**
   * Core function to send push notifications with proper error handling
   * @param {Array} messages - Array of message objects
   * @returns {Array} Array of tickets
   */
  static async sendPushNotifications(messages) {
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
        
        // Update last used timestamp for successful sends
        const successfulTokens = chunk
          .filter((_, index) => ticketChunk[index]?.status === 'ok')
          .map(message => message.to);
        
        if (successfulTokens.length > 0) {
          await tables.UserDevices.update(
            { lastUsed: new Date() },
            { where: { expoPushToken: successfulTokens } }
          );
        }
      } catch (error) {
        console.error('Error sending chunk:', error);
        tickets.push(...chunk.map(() => ({ status: 'error', message: error.message })));
      }
    }
    
    // Schedule receipt checking
    setTimeout(() => {
      this.handlePushReceipts(tickets);
    }, 15 * 60 * 1000); // 15 minutes
    
    return tickets;
  }

  /**
   * Handle push receipts and clean up invalid tokens
   * @param {Array} tickets - Array of tickets from push notification sends
   */
  static async handlePushReceipts(tickets) {
    const receiptIds = tickets
      .filter(ticket => ticket.status === 'ok')
      .map(ticket => ticket.id);
    
    if (receiptIds.length === 0) return;
    
    try {
      const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
      
      for (const chunk of receiptIdChunks) {
        const receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        
        for (const receiptId in receipts) {
          const receipt = receipts[receiptId];
          
          if (receipt.status === 'error') {
            console.error(`Push notification error for ${receiptId}:`, receipt.message);
            
            // Handle DeviceNotRegistered errors
            if (receipt.details && receipt.details.error === 'DeviceNotRegistered') {
              await tables.UserDevices.update(
                { isActive: false },
                { where: { expoPushToken: receipt.details.expoPushToken } }
              );
              console.log(`Deactivated invalid push token: ${receipt.details.expoPushToken}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error handling push receipts:', error);
    }
  }

  /**
   * Clean up old/inactive devices periodically
   * @returns {number} Number of devices cleaned up
   */
  static async cleanupOldDevices() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const deletedCount = await tables.UserDevices.destroy({
        where: {
          isActive: false,
          lastUsed: { [Op.lt]: thirtyDaysAgo }
        }
      });
      
      console.log(`Cleaned up ${deletedCount} old device records`);
      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up old devices:', error);
      throw error;
    }
  }
}

module.exports = NotificationUtils;
