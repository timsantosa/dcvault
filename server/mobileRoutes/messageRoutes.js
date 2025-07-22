const express = require('express');
const { checkPermission, checkOwnAthleteProfileOrPermission, checkOwnAthleteProfile } = require('../middlewares/mobileAuthMiddleware');
const {
  getConversations,
  getConversation,
  createConversation,
  sendMessage,
  editMessage,
  addParticipants,
  removeParticipant,
  deleteMessage
} = require('../controllers/messagesController');

function userCanManageConversations(req, res, next) {
  checkOwnAthleteProfileOrPermission(req, res, next, 'manage_conversations');
}

module.exports = function messageRoutes(db) {
  const router = express.Router();

  // Get all conversations for the current user
  router.get('/conversations', checkOwnAthleteProfile, (req, res) => getConversations(req, res, db));

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

  return router;
}; 