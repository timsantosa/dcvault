const express = require('express');
const multer = require('multer');
const { checkPermission, checkOwnAthleteProfileOrPermission, checkOwnAthleteProfile } = require('../middlewares/mobileAuthMiddleware');
const {
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
  deleteMessageAttachment,
  addGlobalConversationPin,
  removeGlobalConversationPin,
  reorderGlobalConversationPins,
} = require('../controllers/messagesController');

const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
    files: 5
  }
});

function userCanManageConversations(req, res, next) {
  checkOwnAthleteProfileOrPermission(req, res, next, 'manage_conversations');
}

module.exports = function messageRoutes(db) {
  const router = express.Router();

  // Get all conversations for the current user
  router.get('/conversations', checkOwnAthleteProfile, (req, res) => getConversations(req, res, db));

  // Get unread message counts for badges
  router.get('/conversations/unread-counts', checkOwnAthleteProfile, (req, res) => getUnreadCounts(req, res, db));

  // Global conversation pins (order for all users) — static paths before /conversations/:conversationId
  router.post(
    '/conversations/pins',
    checkPermission('manage_global_conversation_pins'),
    (req, res) => addGlobalConversationPin(req, res, db)
  );
  router.put(
    '/conversations/pins/order',
    checkPermission('manage_global_conversation_pins'),
    (req, res) => reorderGlobalConversationPins(req, res, db)
  );
  router.delete(
    '/conversations/pins/:conversationId',
    checkPermission('manage_global_conversation_pins'),
    (req, res) => removeGlobalConversationPin(req, res, db)
  );

  // Get a single conversation with its messages
  router.get('/conversations/:conversationId',
    checkOwnAthleteProfile,
    (req, res) => getConversation(req, res, db)
  );

  // Create a new conversation (requires permission)
  router.post('/conversations', 
    userCanManageConversations,
    (req, res) => createConversation(req, res, db)
  );

  // Update a conversation (requires permission)
  router.put('/conversations/:conversationId',
    userCanManageConversations,
    (req, res) => updateConversation(req, res, db)
  );

  // Upload message attachments (upload then send in a separate request)
  router.post('/conversations/:conversationId/attachments',
    checkOwnAthleteProfile,
    attachmentUpload.array('attachments', 5),
    (req, res) => uploadMessageAttachment(req, res, db)
  );

  // Delete an orphaned attachment (e.g. user removed from compose before send)
  router.delete('/conversations/:conversationId/attachments',
    checkOwnAthleteProfile,
    (req, res) => deleteMessageAttachment(req, res, db)
  );

  // Send a message (can be regular message or reaction)
  router.post('/conversations/:conversationId/messages', 
    checkOwnAthleteProfile,
    (req, res) => sendMessage(req, res, db)
  );

  // Edit a message
  router.put('/messages/:messageId',
    checkOwnAthleteProfile,
    (req, res) => editMessage(req, res, db)
  );

  // Add participants to a conversation
  router.post('/conversations/:conversationId/participants', 
    userCanManageConversations,
    (req, res) => addParticipants(req, res, db)
  );

  // Remove a participant from a conversation
  router.delete('/conversations/:conversationId/participants/:participantId', 
    userCanManageConversations,
    (req, res) => removeParticipant(req, res, db)
  );

  // Delete a message
  router.delete('/messages/:messageId',
    checkOwnAthleteProfile,
    (req, res) => deleteMessage(req, res, db)
  );

  // Delete a conversation
  router.delete('/conversations/:conversationId',
    userCanManageConversations,
    (req, res) => deleteConversation(req, res, db)
  );

  return router;
}; 