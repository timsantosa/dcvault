const { literal, Op } = require('sequelize');
const {
  canSendAnnouncements,
  getOrCreateAnnouncementConversation,
  syncAllAthleteParticipants,
  syncActiveAthleteParticipants,
  getOrCreateDirectConversation,
  sendMessageInConversation
} = require('../utils/messagesUtils');
const NotificationUtils = require('../utils/notificationUtils');
const { deleteCloudinaryImage } = require('./imageUploadController');
const cloudinary = require('./cloudinaryConfig');

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
            attributes: ['id', 'firstName', 'lastName', 'profileImage', 'profileImageVerified']
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
            attributes: ['id', 'firstName', 'lastName', 'profileImage', 'profileImageVerified']
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

    // Calculate unread counts for all conversations using Sequelize (safer approach)
    const conversationsWithUnread = await Promise.all(
      [...regularConversations, ...announcementConversations].map(async (conversation) => {
        // Get the user's participant record for this conversation
        const userParticipant = await db.tables.ConversationParticipants.findOne({
          where: { 
            conversationId: conversation.id, 
            athleteProfileId: parseInt(athleteProfileId) 
          },
          attributes: ['lastReadAt']
        });
        
        const lastReadAt = userParticipant?.lastReadAt;
        
        // Count unread messages (excluding user's own messages)
        const unreadCount = await db.tables.Messages.count({
          where: {
            conversationId: conversation.id,
            senderId: { [Op.ne]: parseInt(athleteProfileId) }, // Don't count own messages
            ...(lastReadAt ? {
              createdAt: { [Op.gt]: lastReadAt }
            } : {}) // If never read, count all messages from others
          }
        });

        // Determine conversation image
        let conversationImage = null;
        if (conversation.type === 'direct') {
          // For direct conversations, use the other participant's verified profile image
          const otherParticipant = conversation.participants?.find(p => p.athleteProfileId !== parseInt(athleteProfileId));
          if (otherParticipant?.athleteProfile?.profileImage && otherParticipant.athleteProfile.profileImageVerified) {
            conversationImage = otherParticipant.athleteProfile.profileImage;
          }
        } else {
          // For group/announcement conversations, use the custom imageUrl if set
          conversationImage = conversation.imageUrl;
        }

        return {
          ...conversation.toJSON(),
          unreadCount,
          imageUrl: conversationImage
        };
      })
    );

    // Sort conversations by last message time
    conversationsWithUnread.sort((a, b) => {
      const aLastMessage = a.messages?.[0]?.createdAt || a.createdAt;
      const bLastMessage = b.messages?.[0]?.createdAt || b.createdAt;
      return new Date(bLastMessage) - new Date(aLastMessage);
    });

    res.json({ ok: true, conversations: conversationsWithUnread });
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

    // TODO: Right now, reactions count as part of the pagination. 
    // This should be fine since every message is created before the reaction is made,
    // but it does limit the number of actual messages.
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
    if (conversation.type === 'announcement_all') {
      // For all member announcement conversations, we don't want to include all the participants because it would be too many.
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
          attributes: ['id', 'firstName', 'lastName', 'profileImage', 'profileImageVerified']
        }]
      });
      conversation.dataValues.participants = participants;
    }

    // Get total count for pagination
    const totalMessages = await db.tables.Messages.count({
      where: { conversationId }
    });

    // Determine conversation image
    let conversationImage = null;
    if (conversation.type === 'direct') {
      // For direct conversations, use the other participant's verified profile image
      const otherParticipant = conversation?.dataValues?.participants?.find(p => p.athleteProfileId !== parseInt(athleteProfileId));
      if (otherParticipant?.athleteProfile?.profileImage && otherParticipant?.athleteProfile?.profileImageVerified) {
        conversationImage = otherParticipant.athleteProfile.profileImage;
      }
    } else {
      // For group/announcement conversations, use the custom imageUrl if set
      conversationImage = conversation.imageUrl;
    }

    // Add imageUrl to conversation data
    conversation.dataValues.imageUrl = conversationImage;

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
      const existingConversationId = await getOrCreateDirectConversation(
        athleteProfileId, 
        participantIds[0], 
        db
      );
      
      // If we got an existing conversation, return it
      const conversation = await db.tables.Conversations.findByPk(existingConversationId, {
        include: [{
          model: db.tables.ConversationParticipants,
          as: 'participants',
          attributes: ['athleteProfileId']
        }]
      });
      
      return res.json({ ok: true, conversation });
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

// Helper: map mimetype to Cloudinary resource_type
function getCloudinaryResourceType(mimetype) {
  if (!mimetype) return 'raw';
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  return 'raw';
}

// Upload message attachments (returns attachment metadata for use in send message)
async function uploadMessageAttachment(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { athleteProfileId } = req.query;
    const files = req.files;

    if (!conversationId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }
    if (!files || files.length === 0) {
      return res.status(400).json({ ok: false, message: 'At least one file is required' });
    }

    const participant = await db.tables.ConversationParticipants.findOne({
      where: { conversationId, athleteProfileId },
      include: [{ model: db.tables.Conversations, as: 'conversation' }]
    });
    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized to send messages in this conversation' });
    }
    const canSend = participant.role === 'admin' ||
      (participant.role === 'member' && participant.conversation.settings.canSendMessages);
    if (!canSend) {
      return res.status(403).json({ ok: false, message: 'Not authorized to send messages' });
    }

    const attachments = [];
    for (const file of files) {
      const resourceType = getCloudinaryResourceType(file.mimetype);
      const dataUri = `data:${file.mimetype || 'application/octet-stream'};base64,${file.buffer.toString('base64')}`;
      try {
        const result = await cloudinary.uploader.upload(dataUri, {
          resource_type: resourceType,
          folder: 'message_attachments'
        });
        attachments.push({
          url: result.secure_url,
          filename: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          publicId: result.public_id,
          resourceType
        });
      } catch (uploadErr) {
        console.error('Cloudinary upload error:', uploadErr);
        return res.status(502).json({ ok: false, message: 'Failed to upload file to storage' });
      }
    }

    res.json({ ok: true, attachments });
  } catch (error) {
    console.error('Error uploading message attachment:', error);
    res.status(500).json({ ok: false, message: 'Failed to upload attachment' });
  }
}

// Delete an orphaned attachment from Cloudinary (e.g. user removed from compose before send)
async function deleteMessageAttachment(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { athleteProfileId } = req.query;
    const { publicId, resourceType } = req.body || {};

    if (!conversationId || !athleteProfileId || !publicId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters (publicId in body, athleteProfileId in query)' });
    }

    const participant = await db.tables.ConversationParticipants.findOne({
      where: { conversationId, athleteProfileId },
      include: [{ model: db.tables.Conversations, as: 'conversation' }]
    });
    if (!participant) {
      return res.status(403).json({ ok: false, message: 'Not authorized' });
    }
    const canSend = participant.role === 'admin' ||
      (participant.role === 'member' && participant.conversation.settings.canSendMessages);
    if (!canSend) {
      return res.status(403).json({ ok: false, message: 'Not authorized' });
    }

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType || 'image' });
    } catch (destroyErr) {
      if (destroyErr?.error?.http_code === 404) {
        return res.json({ ok: true });
      }
      console.error('Cloudinary destroy error:', destroyErr);
      return res.status(502).json({ ok: false, message: 'Failed to delete attachment from storage' });
    }
    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting message attachment:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete attachment' });
  }
}

// Send a message
async function sendMessage(req, res, db) {
  try {
    const { conversationId } = req.params;
    const { content, type = 'text', parentMessageId, attachments } = req.body;
    const { athleteProfileId } = req.query;

    if (!conversationId || !athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }
    if (type === 'text' && !content) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }
    if (type === 'reaction' && !parentMessageId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }
    if (type === 'attachment' && (!attachments || !Array.isArray(attachments) || attachments.length === 0)) {
      return res.status(400).json({ ok: false, message: 'Attachments required for attachment message' });
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
                     (type === 'attachment' && participant.conversation.settings.canSendMessages) ||
                     (type === 'reaction' && participant.conversation.settings.canReact)));
    
    if (!canSend) {
      return res.status(403).json({ ok: false, message: 'Not authorized to send messages' });
    }

    // If this is an announcement conversation and user has announcement permissions, sync participants
    if (participant.conversation.type === 'announcement_all' || participant.conversation.type === 'announcement_active') {
      // It was decided to allow other members to send messages/reactions in announcement channels if the conversation settings allow it.
      // if (!canSendAnnouncements(req.user)) {
      //   return res.status(403).json({ ok: false, message: 'Not authorized to send announcement messages' });
      // }

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

    // Create custom notification handler for reactions
    const customNotificationHandler = type === 'reaction' && parentMessageId ? async (message, conversation, db) => {
      // For reactions, notify the original message sender (if different from reaction sender)
      const originalMessage = await db.tables.Messages.findByPk(parentMessageId);
      if (originalMessage && originalMessage.senderId !== athleteProfileId) {
        const reacterProfile = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
        const reacterName = `${reacterProfile.firstName} ${reacterProfile.lastName}`;
        
        const title = conversation.name || 'New Reaction';
        const body = `${reacterName} ${content}d to your message: ${originalMessage.content}`;
        const data = {
          type: 'reaction',
          conversationId,
          originalMessageId: parentMessageId,
          reacterName
        };
        await NotificationUtils.sendNotificationToAthleteProfiles(
          [originalMessage.senderId],
          title,
          body,
          data
        );
      }
    } : undefined;

    // Create the message using the helper function
    const message = await sendMessageInConversation(
      conversationId,
      athleteProfileId,
      content,
      db,
      {
        type,
        parentMessageId,
        attachments,
        customNotificationHandler
      }
    );

    // Get the full message with sender info
    const fullMessage = await db.tables.Messages.findOne({
      where: { id: message.id },
      include: [{
        model: db.tables.AthleteProfiles,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName']
      }]
    });
    
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

    // Delete attachment assets from Cloudinary before removing the message
    if (message.attachments && Array.isArray(message.attachments) && message.attachments.length > 0) {
      for (const att of message.attachments) {
        if (att.publicId) {
          try {
            await cloudinary.uploader.destroy(att.publicId, {
              resource_type: att.resourceType || 'image'
            });
          } catch (destroyErr) {
            console.error('Error deleting attachment from Cloudinary:', att.publicId, destroyErr);
            // Continue; do not block message deletion
          }
        }
      }
    }

    await message.destroy();

    // TODO: Send notification to conversation participants about deleted message

    res.json({ ok: true });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ ok: false, message: 'Failed to delete message' });
  }
}

// Get unread message counts for all conversations (for badges)
async function getUnreadCounts(req, res, db) {
  try {
    const { athleteProfileId } = req.query;
    
    if (!athleteProfileId) {
      return res.status(400).json({ ok: false, message: 'Missing required parameters' });
    }

    // Get all conversations the user participates in using Sequelize
    const participants = await db.tables.ConversationParticipants.findAll({
      where: { athleteProfileId: parseInt(athleteProfileId) },
      include: [{
        model: db.tables.Conversations,
        as: 'conversation',
        attributes: ['id', 'name', 'type']
      }],
      attributes: ['conversationId', 'lastReadAt']
    });

    const unreadCounts = await Promise.all(
      participants.map(async (participant) => {
        const conversationId = participant.conversationId;
        const lastReadAt = participant.lastReadAt;
        
        const unreadCount = await db.tables.Messages.count({
          where: {
            conversationId,
            senderId: { [Op.ne]: parseInt(athleteProfileId) }, // Don't count own messages
            // Exclude reactions unless they are reactions to a message from the requester
            [Op.or]: [
              { type: { [Op.ne]: 'reaction' } },
              { type: 'reaction', '$parentMessage.senderId$': parseInt(athleteProfileId) }
            ],
            ...(lastReadAt ? {
              createdAt: { [Op.gt]: lastReadAt }
            } : {}) // If never read, count all messages from others
          },
          include: [{
            model: db.tables.Messages,
            as: 'parentMessage',
            attributes: [],
            required: false // LEFT JOIN so non-reaction messages are still counted
          }]
        });

        return {
          conversationId,
          unreadCount,
          conversation: participant.conversation
        };
      })
    );

    // Calculate total unread across all conversations
    const totalUnread = unreadCounts.reduce((sum, conv) => sum + conv.unreadCount, 0);

    // Filter to only conversations with unread messages for efficiency
    const conversationsWithUnread = unreadCounts.filter(conv => conv.unreadCount > 0);

    res.json({ 
      ok: true, 
      unreadCounts: conversationsWithUnread,
      totalUnread,
      hasUnreadMessages: totalUnread > 0
    });
  } catch (error) {
    console.error('Error getting unread counts:', error);
    res.status(500).json({ ok: false, message: 'Failed to get unread counts' });
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

    // Get the conversation to check for image before deletion
    const conversation = await db.tables.Conversations.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ ok: false, message: 'Conversation not found' });
    }

    // Delete the conversation image from Cloudinary if it exists
    if (conversation.imageUrl) {
      await deleteCloudinaryImage(conversation.imageUrl);
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
  deleteConversation,
  getUnreadCounts,
  uploadMessageAttachment,
  deleteMessageAttachment
}; 