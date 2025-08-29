const { literal, Op } = require('sequelize');
const { 
  canSendAnnouncements, 
  getOrCreateAnnouncementConversation,
  syncAllAthleteParticipants,
  syncActiveAthleteParticipants
} = require('../utils/messagesUtils');

// Get all conversations for the current user
async function getConversations(req, res, db) {
  try {
    const { athleteProfileId } = req.query;
    
    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // First, get all regular conversations that the user is part of
    const userRegularConversations = await db.tables.Conversations.findAll({
      where: {
        type: { [Op.notIn]: ['announcement_all', 'announcement_active'] }
      },
      include: [
        {
          model: db.tables.ConversationParticipants,
          as: 'participants',
          required: true,
          where: { athleteProfileId },
          attributes: []
        }
      ],
      order: [[literal('(SELECT MAX(createdAt) FROM messages WHERE messages.conversationId = conversation.id)'), 'DESC']]
    });

    const regularConversationIds = userRegularConversations.map(conv => conv.id);

    // Now get the full regular conversation data with ALL participants
    const regularConversations = await db.tables.Conversations.findAll({
      where: { id: regularConversationIds },
      include: [
        {
          model: db.tables.ConversationParticipants,
          as: 'participants',
          include: [{
            model: db.tables.AthleteProfiles,
            as: 'athleteProfile',
            attributes: ['id', 'firstName', 'lastName', 'profileImage']
          }]
        },
        {
          model: db.tables.Messages,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: db.tables.AthleteProfiles,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName']
          }]
        }
      ],
      order: [[literal('(SELECT MAX(createdAt) FROM messages WHERE messages.conversationId = conversation.id)'), 'DESC']]
    });

    // Get announcement conversations that the user is part of (with only the requesting athlete's participant info)
    const announcementConversations = await db.tables.Conversations.findAll({
      where: {
        type: { [Op.in]: ['announcement_all', 'announcement_active'] }
      },
      include: [
        {
          model: db.tables.ConversationParticipants,
          as: 'participants',
          required: true,
          where: { athleteProfileId },
          include: [{
            model: db.tables.AthleteProfiles,
            as: 'athleteProfile',
            attributes: ['id', 'firstName', 'lastName', 'profileImage']
          }]
        },
        {
          model: db.tables.Messages,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: db.tables.AthleteProfiles,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName']
          }]
        }
      ],
      order: [[literal('(SELECT MAX(createdAt) FROM messages WHERE messages.conversationId = conversation.id)'), 'DESC']]
    });

    // For announcement conversations, add participant count
    for (const conversation of announcementConversations) {
      conversation.dataValues.participantCount = await db.tables.ConversationParticipants.count({
        where: { conversationId: conversation.id }
      });
    }

    // Combine and sort all conversations by last message time
    const allConversations = [...regularConversations, ...announcementConversations];
    allConversations.sort((a, b) => {
      const aLastMessage = a.messages?.[0]?.createdAt || a.createdAt;
      const bLastMessage = b.messages?.[0]?.createdAt || b.createdAt;
      return new Date(bLastMessage) - new Date(aLastMessage);
    });

    res.json({ ok: true, conversations: allConversations });
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ ok: false, message: 'Failed to get conversations' });
  }
}

// Get a single conversation with its messages
async function getConversation(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { athleteProfileId, page = 1, limit = 30 } = req.query;

    if (!conversationId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    const parsedLimit = parseInt(limit);
    const offset = (parseInt(page) - 1) * parsedLimit;

    // Check if user is part of the conversation and get their participant info
    const participant = await db.tables.ConversationParticipants.findOne({
      where: { conversationId, athleteProfileId },
      include: [{
        model: db.tables.AthleteProfiles,
        as: 'athleteProfile',
        attributes: ['id', 'firstName', 'lastName', 'profileImage']
      }]
    });

    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to view this conversation' });
    }

    // Update last read timestamp
    await participant.update({ lastReadAt: new Date() });

    // TODO: Send notification to other participants that user has read messages

    // Get conversation with conditional participant loading
    const conversation = await db.tables.Conversations.findOne({
      where: { id: conversationId },
      include: [
        {
          model: db.tables.Messages,
          as: 'messages',
          include: [{
            model: db.tables.AthleteProfiles,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName']
          }],
          order: [['createdAt', 'DESC']],
          limit: parsedLimit,
          offset
        }
      ]
    });

    if (!conversation) {
      return res.status(404).json({ ok: false, message: 'Conversation not found' });
    }

    // Handle participants based on conversation type
    if (conversation.type === 'announcement_all' || conversation.type === 'announcement_active') {
      // For announcement conversations, use the participant info we already fetched
      conversation.dataValues.participants = [participant];
      conversation.dataValues.participantCount = await db.tables.ConversationParticipants.count({
        where: { conversationId }
      });
    } else {
      // For regular conversations, load all participants
      const participants = await db.tables.ConversationParticipants.findAll({
        where: { conversationId },
        include: [{
          model: db.tables.AthleteProfiles,
          as: 'athleteProfile',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }]
      });
      conversation.dataValues.participants = participants;
    }

    // Get total count for pagination
    const totalMessages = await db.tables.Messages.count({
      where: { conversationId }
    });

    res.json({ 
      ok: true, 
      conversation,
      pagination: {
        total: totalMessages,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalMessages / limit)
      }
    });
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ ok: false, message: 'Failed to get conversation' });
  }
}

// Create a new conversation
async function createConversation(req, res, db) {
  try {
    const { name, type, participantIds, settings } = req.body;
    const { athleteProfileId: athleteProfileIdString } = req.query;
    const athleteProfileId = parseInt(athleteProfileIdString);

    // Handle announcement conversations specially
    if (type === 'announcement_all' || type === 'announcement_active') {
      // Check if user has permission to create announcements
      if (!canSendAnnouncements(req.user)) {
        return res.status(403).json({ ok: false, message: 'Insufficient permissions to create announcement conversations' });
      }

      // Get or create the announcement conversation
      const conversation = await getOrCreateAnnouncementConversation(type, athleteProfileId, db);
      return res.json({ ok: true, conversation });
    }

    if (!athleteProfileId || !type || !participantIds?.length) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // For direct conversations, check if one already exists between these participants
    if (type === 'direct' && participantIds.length === 1) {
      // First, get all direct conversations that include the target participant
      // This is the optimization - there will be far fewer conversations with this participant
      const conversationsWithTargetParticipant = await db.tables.Conversations.findAll({
        where: { type: 'direct' },
        include: [{
          model: db.tables.ConversationParticipants,
          as: 'participants',
          where: {
            athleteProfileId: participantIds[0]
          }
        }]
      });

      // For each conversation, check if it also includes the current user and has exactly 2 participants
      for (const conversation of conversationsWithTargetParticipant) {
        // Get all participants for this conversation
        const allParticipants = await db.tables.ConversationParticipants.findAll({
          where: { conversationId: conversation.id },
          attributes: ['athleteProfileId']
        });

        const participantIds = allParticipants.map(p => p.athleteProfileId);
        
        // Check if this is a direct conversation between exactly these two users
        if (participantIds.length === 2 && 
            participantIds.includes(athleteProfileId) && 
            participantIds.includes(participantIds[0])) {
          conversation.participants = allParticipants;
          return res.json({ ok: true, conversation });
        }
      }
    }

    // Start a transaction using the Conversations model's sequelize instance
    const transaction = await db.tables.Conversations.sequelize.transaction();

    try {
      // Create the conversation
      const conversation = await db.tables.Conversations.create({
        name,
        type,
        createdBy: athleteProfileId,
        settings: settings || { canSendMessages: true, canReact: true }
      }, { transaction });

      // Add participants
      const participants = [
        { conversationId: conversation.id, athleteProfileId, role: 'admin' }, // Creator is admin
        ...participantIds.map(id => ({
          conversationId: conversation.id,
          athleteProfileId: id,
          role: 'member'
        }))
      ];

      await db.tables.ConversationParticipants.bulkCreate(participants, { 
        transaction,
        ignoreDuplicates: true 
      });

      // Commit the transaction
      await transaction.commit();

      // TODO: Send notifications to all participants about new conversation. Or not?

      res.json({ ok: true, conversation });
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ ok: false, message: 'Failed to create conversation' });
  }
}

async function updateConversation(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { name, settings, participantIds } = req.body;
    const { athleteProfileId } = req.query;

    if (!conversationId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // Check if user is admin of the conversation
    const adminParticipant = await db.tables.ConversationParticipants.findOne({
      where: { 
        conversationId, 
        athleteProfileId,
        role: 'admin'
      }
    });

    if (!adminParticipant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to update this conversation' });
    }

    // Start a transaction
    const transaction = await db.tables.Conversations.sequelize.transaction();

    try {
      // Update conversation fields if provided
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (settings !== undefined) updateData.settings = settings;

      if (Object.keys(updateData).length > 0) {
        await db.tables.Conversations.update(updateData, {
          where: { id: conversationId },
          transaction
        });
      }

      // Update participants if provided
      if (participantIds !== undefined) {
        // Get ALL current participants (to avoid role-based duplicates)
        const currentParticipants = await db.tables.ConversationParticipants.findAll({
          where: { 
            conversationId
          },
          attributes: ['athleteProfileId', 'role'],
          transaction
        });
        
        const currentParticipantIds = currentParticipants.map(p => p.athleteProfileId);
        const newParticipantIds = new Set(participantIds);
        
        // Remove only MEMBER participants who are no longer in the list (preserve admins)
        const memberParticipants = currentParticipants.filter(p => p.role === 'member');
        const memberParticipantIds = memberParticipants.map(p => p.athleteProfileId);
        const participantsToRemove = memberParticipantIds.filter(id => !newParticipantIds.has(id));
        if (participantsToRemove.length > 0) {
          await db.tables.ConversationParticipants.destroy({
            where: { 
              conversationId,
              athleteProfileId: participantsToRemove,
              role: 'member'
            },
            transaction
          });
        }
        
        // Add only new participants
        const participantsToAdd = participantIds.filter(id => !currentParticipantIds.includes(id));
        if (participantsToAdd.length > 0) {
          const newParticipants = participantsToAdd.map(id => ({
            conversationId,
            athleteProfileId: id,
            role: 'member'
          }));

          await db.tables.ConversationParticipants.bulkCreate(newParticipants, { 
            transaction,
            ignoreDuplicates: true 
          });
        }
      }

      // Commit the transaction
      await transaction.commit();

      // Get the updated conversation with all participants
      const updatedConversation = await db.tables.Conversations.findOne({
        where: { id: conversationId },
        include: [
          {
            model: db.tables.ConversationParticipants,
            as: 'participants',
            include: [{
              model: db.tables.AthleteProfiles,
              as: 'athleteProfile',
              attributes: ['id', 'firstName', 'lastName', 'profileImage']
            }]
          }
        ]
      });

      // TODO: Send notifications to participants about conversation updates

      res.json({ ok: true, conversation: updatedConversation });
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error updating conversation:', error);
    res.status(500).json({ ok: false, message: 'Failed to update conversation' });
  }
}

// Send a message
async function sendMessage(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', parentMessageId, attachments } = req.body;
    const { athleteProfileId } = req.query;

    if (!conversationId || !athleteProfileId || (type === 'text' && !content) || (type === 'reaction' && !parentMessageId)) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // If it's a reaction, check if the parent message exists and replace any reactions from the same sender
    if (type === 'reaction') {
      // Check if parent message exists
      const parentMessage = await db.tables.Messages.findOne({
        where: { id: parentMessageId }
      });

      if (!parentMessage) {
        return res.status(404).json({ ok: false, message: 'Parent message not found' });
      }

      // Delete any existing reactions from this user to the parent message
      await db.tables.Messages.destroy({
        where: {
          parentMessageId,
          senderId: athleteProfileId,
          type: 'reaction'
        }
      });
    }

    // Check if user is part of the conversation
    const participant = await db.tables.ConversationParticipants.findOne({
      where: { conversationId, athleteProfileId },
      include: [{
        model: db.tables.Conversations,
        as: 'conversation'
      }]
    });

    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to send messages in this conversation' });
    }

    // Check permissions
    const canSend = participant.role === 'admin' || 
                   (participant.role === 'member' && 
                    ((type === 'text' && participant.conversation.settings.canSendMessages) ||
                     (type === 'reaction' && participant.conversation.settings.canReact)));
    
    if (!canSend) {
      return res.status(403).json({ ok: false, message: 'Not authorized to send messages' });
    }

    // If this is an announcement conversation and user has announcement permissions, sync participants
    if (participant.conversation.type === 'announcement_all' || participant.conversation.type === 'announcement_active') {
      if (!canSendAnnouncements(req.user)) {
        return res.status(403).json({ ok: false, message: 'Not authorized to send announcement messages' });
      }

      try {
        if (participant.conversation.type === 'announcement_all') {
          await syncAllAthleteParticipants(conversationId, db);
        } else if (participant.conversation.type === 'announcement_active') {
          await syncActiveAthleteParticipants(conversationId, db);
        }
      } catch (syncError) {
        console.error('Error syncing announcement participants:', syncError);
        // Continue with message sending even if sync fails
      }
    }

    // Create the message
    const message = await db.tables.Messages.create({
      conversationId,
      senderId: athleteProfileId,
      content,
      type,
      parentMessageId,
      attachments
    });

    // Get the full message with sender info
    const fullMessage = await db.tables.Messages.findOne({
      where: { id: message.id },
      include: [{
        model: db.tables.AthleteProfiles,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });

    // TODO: Send notifications to all participants except sender
    // TODO: If this is a reaction, send specific notification to the original message sender
    // TODO: Only send notification to user once, in case they have multiple athletes per account.
    
    res.json({ ok: true, message: fullMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ ok: false, message: 'Failed to send message' });
  }
}

// Edit a message
async function editMessage(req, res, db) {
  try {
    const { messageId } = req.params;
    const { content, athleteProfileId } = req.query;

    if (!messageId || !athleteProfileId || !content) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // Find the message
    const message = await db.tables.Messages.findOne({
      where: { id: messageId },
      include: [{
        model: db.tables.Conversations,
        as: 'conversation',
        include: [{
          model: db.tables.ConversationParticipants,
          as: 'participants',
          where: { athleteProfileId }
        }]
      }]
    });

    if (!message) {
      return res.status(404).json({ ok: false, message: 'Message not found' });
    }

    // Check if user is the sender
    if (message.senderId !== athleteProfileId) {
      return res.status(403).json({ ok: false, message: 'Not authorized to edit this message' });
    }

    // Check if message is too old to edit (e.g., 24 hours)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const MAX_EDIT_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (messageAge > MAX_EDIT_AGE) {
      return res.status(400).json({ ok: false, message: 'Message is too old to edit' });
    }

    // Update the message
    await message.update({ 
      content,
      updatedAt: new Date()
    });

    // TODO: Send notification to conversation participants about edited message

    res.json({ ok: true, message });
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ ok: false, message: 'Failed to edit message' });
  }
}

// Add participants to a conversation
async function addParticipants(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { participantIds } = req.body;
    const { athleteProfileId } = req.query;

    if (!conversationId || !athleteProfileId || !participantIds?.length) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // Check if user is admin of the conversation
    const participant = await db.tables.ConversationParticipants.findOne({
      where: { 
        conversationId, 
        athleteProfileId,
        role: 'admin'
      }
    });

    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to add participants' });
    }

    // Add new participants
    const newParticipants = participantIds.map(id => ({
      conversationId,
      athleteProfileId: id,
      role: 'member'
    }));

    await db.tables.ConversationParticipants.bulkCreate(newParticipants, {
      ignoreDuplicates: true
    });

    // TODO: Send notifications to new participants about being added to conversation

    res.json({ ok: true });
  } catch (error) {
    console.error('Error adding participants:', error);
    res.status(500).json({ ok: false, message: 'Failed to add participants' });
  }
}

// Remove a participant from a conversation
async function removeParticipant(req, res, db) {
  try {
    const { conversationId, participantId } = req.params;
    const { athleteProfileId } = req.query;

    if (!conversationId || !participantId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // Check if user is admin of the conversation
    const participant = await db.tables.ConversationParticipants.findOne({
      where: { 
        conversationId, 
        athleteProfileId,
        role: 'admin'
      }
    });

    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to remove participants' });
    }

    await db.tables.ConversationParticipants.destroy({
      where: { conversationId, athleteProfileId: participantId }
    });

    // TODO: Send notification to removed participant
    // TODO: Send notification to remaining participants about the removal

    res.json({ ok: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    res.status(500).json({ ok: false, message: 'Failed to remove participant' });
  }
}

// Delete a message
async function deleteMessage(req, res, db) {
  try {
    const { messageId } = req.params;
    const { athleteProfileId: athleteProfileIdString } = req.query;
    const athleteProfileId = parseInt(athleteProfileIdString);

    if (!messageId || !athleteProfileId || isNaN(athleteProfileId)) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // Find the message
    const message = await db.tables.Messages.findOne({
      where: { id: messageId },
      include: [{
        model: db.tables.Conversations,
        as: 'conversation',
        include: [{
          model: db.tables.ConversationParticipants,
          as: 'participants',
          where: { athleteProfileId }
        }]
      }]
    });

    if (!message) {
      return res.status(404).json({ ok: false, message: 'Message not found' });
    }

    // Check if user is the sender or an admin
    const participant = message.conversation.participants[0];
    if (message.senderId !== athleteProfileId && participant.role !== 'admin') {
      return res.status(403).json({ ok: false, message: 'Not authorized to delete this message' });
    }

    // Check if message is too old to delete (e.g., 24 hours)
    const messageAge = Date.now() - new Date(message.createdAt).getTime();
    const MAX_DELETE_AGE = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (messageAge > MAX_DELETE_AGE && participant.role !== 'admin') {
      return res.status(400).json({ ok: false, message: 'Message is too old to delete' });
    }

    // Delete the message
    await message.destroy();

    // TODO: Send notification to conversation participants about deleted message

    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete message' });
  }
}

// Delete a conversation
async function deleteConversation(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { athleteProfileId } = req.query;

    if (!conversationId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // Check if user is admin of the conversation
    const participant = await db.tables.ConversationParticipants.findOne({
      where: { 
        conversationId, 
        athleteProfileId,
        role: 'admin'
      }
    });

    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to delete this conversation' });
    }

    // Start a transaction
    const transaction = await db.tables.Conversations.sequelize.transaction();

    try {
      // Delete all messages in the conversation
      await db.tables.Messages.destroy({
        where: { conversationId },
        transaction
      });

      // Delete all participants
      await db.tables.ConversationParticipants.destroy({
        where: { conversationId },
        transaction
      });

      // Delete the conversation itself
      await db.tables.Conversations.destroy({
        where: { id: conversationId },
        transaction
      });

      // Commit the transaction
      await transaction.commit();

      // TODO: Send notifications to all participants about conversation deletion (maybe)

      res.json({ ok: true, message: 'Conversation deleted successfully' });
    } catch (error) {
      // If anything fails, rollback the transaction
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete conversation' });
  }
}

module.exports = {
  getConversations,
  getConversation,
  createConversation,
  updateConversation,
  sendMessage,
  editMessage,
  addParticipants,
  removeParticipant,
  deleteMessage,
  deleteConversation
}; 