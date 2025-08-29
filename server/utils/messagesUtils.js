const { isAthleteProfileActive } = require('../controllers/athletesController');
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
      attributes: ['id'],
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
      attributes: ['id', 'alwaysActiveOverride', 'athleteId'],
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

module.exports = {
  syncAllAthleteParticipants,
  syncActiveAthleteParticipants,
  canSendAnnouncements,
  getOrCreateAnnouncementConversation
};
