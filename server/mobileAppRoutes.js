const config = require('./config/config');
const jwt = require('jwt-simple');
const jumpRoutes = require('./mobileRoutes/jumpRoutes');
const { authenticateJWT, checkPermission, checkOwnUserOrPermission } = require('./middlewares/mobileAuthMiddleware');
const athleteRoutes = require('./mobileRoutes/athleteRoutes');
const authRoutes = require('./mobileRoutes/authRoutes');
const permissionRoutes = require('./mobileRoutes/permissionRoutes');
const userRoutes = require('./mobileRoutes/userRoutes');
const { deleteUser } = require('./controllers/usersController');
const { getMobileUserInfo } = require('./controllers/authController');
const imageUploadRoutes = require('./mobileRoutes/imageUploadRoutes');
const { verifyJump, rejectJumpVerification, getUnverifiedMeetJumps } = require('./controllers/jumpsController');
const poleRoutes = require('./mobileRoutes/poleRoutes');
const meetDataRoutes = require('./mobileRoutes/meetDataRoutes');
const meetEntityRoutes = require('./mobileRoutes/meetEntityRoutes');
const drillTypeRoutes = require('./mobileRoutes/drillTypeRoutes');
const drillRoutes = require('./mobileRoutes/drillRoutes');
const messageRoutes = require('./mobileRoutes/messageRoutes');
const notificationRoutes = require('./mobileRoutes/notificationRoutes');

module.exports = function addMobileAppRoutes(app, db) {

  

  // No JWT needed for these, they are public
  app.use('/mobileapp/auth', authRoutes(db));

  // Everything under '/mobileapp/user' will need to be authenticated
  app.use('/mobileapp/user', authenticateJWT);
  app.use('/mobileapp/user/log', jumpRoutes(db));
  app.use('/mobileapp/user/log', drillRoutes(db));
  app.use('/mobileapp/user/athlete', athleteRoutes(db));
  app.use('/mobileapp/user/images', imageUploadRoutes(db));

  app.use('/mobileapp/user/poles', poleRoutes(db));
  app.use('/mobileapp/user/meet-data', meetDataRoutes(db));
  app.use('/mobileapp/user/meet-entities', meetEntityRoutes(db));
  app.use('/mobileapp/user/messaging', messageRoutes(db));
  app.use('/mobileapp/user/notifications', notificationRoutes(db));
  
  app.get('/mobileapp/user/info', async (req, res) => {
    getMobileUserInfo(req, res, db);
  });

  // Account deletion - users can delete their own account, admins with manage_roles can delete any account
  app.delete('/mobileapp/user/users/:userId', (req, res, next) => {
    // Adapt checkOwnUserOrPermission to work with params instead of query
    req.query.userId = req.params.userId;
    checkOwnUserOrPermission(req, res, next, 'delete_users');
  }, (req, res) => deleteUser(req, res, db));

  app.use('/mobileapp/user/drillTypes', drillTypeRoutes(db));

  // Admin routes
  app.post('/mobileapp/user/jump/verify', checkPermission('verify_jumps'), (req, res) => verifyJump(req, res, db));
  app.post('/mobileapp/user/jump/reject', checkPermission('verify_jumps'), (req, res) => rejectJumpVerification(req, res, db));
  app.get('/mobileapp/user/jumps/unverified', checkPermission('verify_jumps'), (req, res) => getUnverifiedMeetJumps(req, res, db));

  app.use('/mobileapp/user/permissions', checkPermission('manage_roles'), permissionRoutes(db));
  app.use('/mobileapp/user/userData', checkPermission('manage_roles'), userRoutes(db));
}