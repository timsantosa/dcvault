const { literal } = require('sequelize');
const { Op } = require('sequelize');

// Get all conversations for the current user
async function getConversations(req, res, db) {
  try {
    const { athleteProfileId } = req.query;
    
    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    const conversations = await db.tables.Conversations.findAll({
      include: [
        {
          model: db.tables.ConversationParticipants,
          as: 'participants',
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
    //   order: [[{ model: db.tables.Messages, as: 'messages' }, 'createdAt', 'DESC']]
      order: [[literal('(SELECT MAX(createdAt) FROM messages WHERE messages.conversationId = conversation.id)'), 'DESC']]
    });

    res.json({ ok: true, conversations });
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

    // Check if user is part of the conversation
    const participant = await db.tables.ConversationParticipants.findOne({
      where: { conversationId, athleteProfileId }
    });

    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to view this conversation' });
    }

    // Update last read timestamp
    await participant.update({ lastReadAt: new Date() });

    // TODO: Send notification to other participants that user has read messages

    const conversation = await db.tables.Conversations.findOne({
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
        },
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

      await db.tables.ConversationParticipants.bulkCreate(participants, { transaction });

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

    await db.tables.ConversationParticipants.bulkCreate(newParticipants);

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
  sendMessage,
  editMessage,
  addParticipants,
  removeParticipant,
  deleteMessage,
  deleteConversation
}; 