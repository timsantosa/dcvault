const { isAthleteProfileActive } = require('./rankingUtils');
const { Op } = require('sequelize');

/**
 * Ensures all athlete profiles are participants in the announcement_all conversation
 * @param {number} conversationId - The announcement_all conversation ID
 * @param {Object} db - Database instance
 */
async function syncAllAthleteParticipants(conversationId, db) {
  const transaction = await db.tables.Conversations.sequelize.transaction();
  
  try {
    // Get all athlete profiles
    const allAthleteProfiles = await db.tables.AthleteProfiles.findAll({
      attributes: ['id'],
      transaction
    });

    // Get current participants (excluding admins)
    const currentParticipants = await db.tables.ConversationParticipants.findAll({
      where: { 
        conversationId,
        role: { [Op.ne]: 'admin' }
      },
      attributes: ['athleteProfileId'],
      transaction
    });

    const currentParticipantIds = new Set(currentParticipants.map(p => p.athleteProfileId));
    const allAthleteIds = allAthleteProfiles.map(p => p.id);

    // Find athletes that need to be added
    const toAdd = allAthleteIds.filter(id => !currentParticipantIds.has(id));

    if (toAdd.length > 0) {
      const newParticipants = toAdd.map(athleteProfileId => ({
        conversationId,
        athleteProfileId,
        role: 'readonly'
      }));

      await db.tables.ConversationParticipants.bulkCreate(newParticipants, {
        transaction,
        ignoreDuplicates: true
      });
    }

    await transaction.commit();
    console.log(`Added ${toAdd.length} athletes to announcement_all conversation`);
    
    return { added: toAdd.length };
  } catch (error) {
    await transaction.rollback();
    console.error('Error syncing all athlete participants:', error);
    throw error;
  }
}

/**
 * Ensures only active athlete profiles are participants in the announcement_active conversation
 * @param {number} conversationId - The announcement_active conversation ID
 * @param {Object} db - Database instance
 */
async function syncActiveAthleteParticipants(conversationId, db) {
  const transaction = await db.tables.Conversations.sequelize.transaction();
  
  try {
    // Get all athlete profiles
    const allAthleteProfiles = await db.tables.AthleteProfiles.findAll({
      attributes: ['id', 'alwaysActiveOverride', 'athleteId'],
      transaction
    });

    // Check which athletes are active
    const activeAthleteIds = [];
    for (const profile of allAthleteProfiles) {
      const isActive = await isAthleteProfileActive(profile, db);
      if (isActive) {
        activeAthleteIds.push(profile.id);
      }
    }

    // Get current participants (excluding admins)
    const currentParticipants = await db.tables.ConversationParticipants.findAll({
      where: { 
        conversationId,
        role: { [Op.ne]: 'admin' }
      },
      attributes: ['athleteProfileId'],
      transaction
    });

    const currentParticipantIds = new Set(currentParticipants.map(p => p.athleteProfileId));
    const activeAthleteIdsSet = new Set(activeAthleteIds);

    // Find athletes that need to be added (active but not in conversation)
    const toAdd = activeAthleteIds.filter(id => !currentParticipantIds.has(id));

    // Find athletes that need to be removed (in conversation but not active)
    const toRemove = currentParticipants
      .filter(p => !activeAthleteIdsSet.has(p.athleteProfileId))
      .map(p => p.athleteProfileId);

    // Add new active participants
    if (toAdd.length > 0) {
      const newParticipants = toAdd.map(athleteProfileId => ({
        conversationId,
        athleteProfileId,
        role: 'readonly'
      }));

      await db.tables.ConversationParticipants.bulkCreate(newParticipants, {
        transaction,
        ignoreDuplicates: true
      });
    }

    // Remove inactive participants
    if (toRemove.length > 0) {
      await db.tables.ConversationParticipants.destroy({
        where: {
          conversationId,
          athleteProfileId: toRemove,
          role: 'readonly'
        },
        transaction
      });
    }

    await transaction.commit();
    console.log(`Active athlete participants sync: +${toAdd.length}, -${toRemove.length}`);
    
    return { added: toAdd.length, removed: toRemove.length };
  } catch (error) {
    await transaction.rollback();
    console.error('Error syncing active athlete participants:', error);
    throw error;
  }
}

/**
 * Checks if a user has permission to send announcements
 * @param {Object} user - User object with permissions
 * @returns {boolean} - Whether user can send announcements
 */
function canSendAnnouncements(user) {
  return user.permissions && user.permissions.includes('can_send_announcements');
}

/**
 * Creates an announcement conversation if it doesn't exist, or returns existing one
 * @param {string} type - 'announcement_all' or 'announcement_active'
 * @param {number} creatorId - ID of the admin creating the conversation
 * @param {Object} db - Database instance
 * @returns {Object} - The conversation object
 */
async function getOrCreateAnnouncementConversation(type, creatorId, db) {
  // Check if conversation already exists
  let conversation = await db.tables.Conversations.findOne({
    where: { type }
  });

  if (conversation) {
    return conversation;
  }

  // Create new announcement conversation
  const transaction = await db.tables.Conversations.sequelize.transaction();
  
  try {
    const name = type === 'announcement_all' 
      ? 'Announcements' 
      : 'Active Member Announcements';
    
    conversation = await db.tables.Conversations.create({
      name,
      type,
      createdBy: creatorId,
      settings: { 
        canSendMessages: false, // Only admins can send
        canReact: false,       // No reactions in announcements
        // isAnnouncement: true 
      }
    }, { transaction });

    // Add the creator as admin
    await db.tables.ConversationParticipants.create({
      conversationId: conversation.id,
      athleteProfileId: creatorId,
      role: 'admin'
    }, { transaction });

    await transaction.commit();
    console.log(`Created ${type} conversation with ID ${conversation.id}`);
    
    return conversation;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

/**
 * Gets or creates a direct conversation between two users
 * @param {number} senderId - First user's athlete profile ID
 * @param {number} receiverId - Second user's athlete profile ID
 * @param {Object} db - Database instance
 * @param {Object} transaction - Optional transaction object
 * @returns {number} - The conversation ID
 */
async function getOrCreateDirectConversation(senderId, receiverId, db, transaction) {
  // First, get all direct conversations that include the recipient (will be faster than finding all conversations with the sender)
  const conversationsWithProfile1 = await db.tables.Conversations.findAll({
    where: { type: 'direct' },
    include: [{
      model: db.tables.ConversationParticipants,
      as: 'participants',
      where: {
        athleteProfileId: receiverId
      }
    }],
    transaction
  });

  // For each conversation, check if it also includes the sender and has exactly 2 participants
  for (const conversation of conversationsWithProfile1) {
    // Get all participants for this conversation
    const allParticipants = await db.tables.ConversationParticipants.findAll({
      where: { conversationId: conversation.id },
      attributes: ['athleteProfileId'],
      transaction
    });

    const participantIds = allParticipants.map(p => p.athleteProfileId);
    
    // Check if this is a direct conversation between exactly these two users
    if (participantIds.length === 2 && 
        participantIds.includes(senderId) && 
        participantIds.includes(receiverId)) {
      return conversation.id;
    }
  }

  // No existing conversation found, create a new one
  const conversation = await db.tables.Conversations.create({
    name: null, // Direct messages don't need a name
    type: 'direct',
    createdBy: senderId,
    settings: { canSendMessages: true, canReact: true }
  }, { transaction });

  // Add both participants
  await db.tables.ConversationParticipants.bulkCreate([
    { conversationId: conversation.id, athleteProfileId: senderId, role: 'admin' },
    { conversationId: conversation.id, athleteProfileId: receiverId, role: 'member' }
  ], { 
    transaction,
    ignoreDuplicates: true 
  });

  return conversation.id;
}

/**
 * Sends a message in a conversation (without HTTP response handling)
 * @param {number} conversationId - Conversation ID
 * @param {number} senderId - Sender's athlete profile ID
 * @param {string} content - Message content
 * @param {Object} db - Database instance
 * @param {Object} options - Optional parameters
 * @param {Object} options.transaction - Transaction object
 * @param {string} options.type - Message type (default: 'text')
 * @param {Object} options.attachments - Message attachments
 * @param {number} options.parentMessageId - Parent message ID for reactions/replies
 * @param {boolean} options.skipNotification - Skip sending push notification
 * @param {Function} options.customNotificationHandler - Custom function to handle notifications (receives message, conversation, db)
 * @returns {Object} - The created message
 */
async function sendMessageInConversation(conversationId, senderId, content, db, options = {}) {
  const { 
    transaction, 
    type = 'text', 
    attachments, 
    parentMessageId,
    skipNotification = false,
    customNotificationHandler
  } = options;

  // Create the message
  const message = await db.tables.Messages.create({
    conversationId,
    senderId,
    content,
    type,
    parentMessageId,
    attachments
  }, { transaction });

  // Send push notifications if not skipped
  if (!skipNotification) {
    try {
      const NotificationUtils = require('./notificationUtils');
      
      // Use custom notification handler if provided
      if (customNotificationHandler) {
        const conversation = await db.tables.Conversations.findByPk(conversationId);
        await customNotificationHandler(message, conversation, db);
      } else if (type === 'text' || type === 'attachment') {
        // Default notification for text/attachment messages
        await NotificationUtils.notifyMessageRecipients(
          conversationId, 
          senderId, 
          content || 'Sent an attachment'
        );
      }
      // Reactions are handled by customNotificationHandler in the controller
    } catch (notificationError) {
      console.error('Error sending push notification for message:', notificationError);
      // Don't fail the message send if notification fails
    }
  }

  return message;
}

module.exports = {
  syncAllAthleteParticipants,
  syncActiveAthleteParticipants,
  canSendAnnouncements,
  getOrCreateAnnouncementConversation,
  getOrCreateDirectConversation,
  sendMessageInConversation
};
