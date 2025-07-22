const config = require('./config/config');
const jwt = require('jwt-simple');
const jumpRoutes = require('./mobileRoutes/jumpRoutes');
const { authenticateJWT, checkPermission } = require('./middlewares/mobileAuthMiddleware');
const athleteRoutes = require('./mobileRoutes/athleteRoutes');
const authRoutes = require('./mobileRoutes/authRoutes');
const permissionRoutes = require('./mobileRoutes/permissionRoutes');
const { getMobileUserInfo } = require('./controllers/authController');
const imageUploadRoutes = require('./mobileRoutes/imageUploadRoutes');
const { verifyJump, getUnverifiedMeetJumps } = require('./controllers/jumpsController');
const poleRoutes = require('./mobileRoutes/poleRoutes');
const meetDataRoutes = require('./mobileRoutes/meetDataRoutes');
const drillTypeRoutes = require('./mobileRoutes/drillTypeRoutes');
const drillRoutes = require('./mobileRoutes/drillRoutes');
const messageRoutes = require('./mobileRoutes/messageRoutes');

module.exports = function addMobileAppRoutes(app, db) {

  

  // No JWT needed for these, they are public
  app.use('/mobileapp/auth', authRoutes(db));

  // Everything under '/mobileapp/user' will need to be authenticated
  app.use('/mobileapp/user', authenticateJWT);
  app.use('/mobileapp/user/log', jumpRoutes(db));
  app.use('/mobileapp/user/log', drillRoutes(db));
  app.use('/mobileapp/user/athlete', athleteRoutes(db));
  app.use('/mobileapp/user/profile/image', imageUploadRoutes(db));

  app.use('/mobileapp/user/poles', poleRoutes(db));
  app.use('/mobileapp/user/meet-data', meetDataRoutes(db));
  app.use('/mobileapp/user/messaging', messageRoutes(db));
  
  app.get('/mobileapp/user/info', async (req, res) => {
    getMobileUserInfo(req, res, db);
  });

  app.use('/mobileapp/user/drillTypes', drillTypeRoutes(db));

  // Admin routes
  app.post('/mobileapp/user/jump/verify', checkPermission('verify_jumps'), (req, res) => verifyJump(req, res, db));
  app.get('/mobileapp/user/jumps/unverified', checkPermission('verify_jumps'), (req, res) => getUnverifiedMeetJumps(req, res, db));

  app.use('/mobileapp/user/permissions', checkPermission('manage_roles'), permissionRoutes(db));
}