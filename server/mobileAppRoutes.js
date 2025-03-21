const config = require('./config/config');
const jwt = require('jwt-simple');
const jumpRoutes = require('./mobileRoutes/jumpRoutes');
const { authenticateJWT, checkPermission } = require('./middlewares/mobileAuthMiddleware');
const athleteRoutes = require('./mobileRoutes/athleteRoutes');
const authRoutes = require('./mobileRoutes/authRoutes');
const permissionRoutes = require('./mobileRoutes/permissionRoutes');
const adminCheck = require('./middlewares/admin');
const { getMobileUserInfo } = require('./controllers/authController');
const imageUploadRoutes = require('./mobileRoutes/imageUploadRoutes');
const { verifyJump, getUnverifiedMeetJumps } = require('./controllers/jumpsController');
const poleRoutes = require('./mobileRoutes/poleRoutes');

module.exports = function addMobileAppRoutes(app, db) {

  

  // No JWT needed for these, they are public
  app.use('/mobileapp/auth', authRoutes(db));

  // Everything under '/mobileapp/user' will need to be authenticated
  app.use('/mobileapp/user', authenticateJWT);
  app.use('/mobileapp/user/log', jumpRoutes(db));
  app.use('/mobileapp/user/athlete', athleteRoutes(db));
  app.use('/mobileapp/user/profile/image', imageUploadRoutes(db));

  app.use('/mobileapp/user/poles', poleRoutes(db));
  
  app.get('/mobileapp/user/info', async (req, res) => {
    getMobileUserInfo(req, res, db);
  });

  // Admin routes
  app.post('/mobileapp/user/jump/verify', checkPermission('verify_jumps'), (req, res) => verifyJump(req, res, db));
  app.get('/mobileapp/user/jumps/unverified', checkPermission('verify_jumps'), (req, res) => getUnverifiedMeetJumps(req, res, db));

  // TODO: move to controller
  app.get('/mobileapp/user/meetTypeOptions', async (req, res) => {
    // TODO: Grab items from DB
    res.json({
      ok: true,
      message: 'Successfully grabbed meet options',
      meetTypeOptions: {
        meetTypes: [
          'County',
          'Regional',
          'State',
          'Conference',
          'National',
          'International',
          'World',
          'Olympic',
        ],
        divisionTypes: [
          'Elementary',
          'Middle School',
          'High School',
          'Collegiate',
          'Open',
          'Elite',
          'Masters',
        ],
        recordTypes: [
          'School',
          'Meet',
          'Facility',
          'State',
          'Regional',
          'National',
          'Olympic',
          'World',
        ],
      },
    });
  });

  app.use('/mobileapp/user/permissions', adminCheck, permissionRoutes);
}


// TODO: Remove these
/*
 * Helper function to authorize a user's token from the request.
 * 
 * successHandler should take req, res, and an object with an email and password if 
 * the token was valid.
 */
// function authorizeUser(req, res, successHandler) {
//   let authBearer = req.headers?.authorization;
//   if (!authBearer) {
//     res.status(403).send(JSON.stringify({ok: false, message: 'no token'}));
//     console.log("No authorization header");
//     return;
//   }
//   let token = authBearer.split(' ')[1];
//   if (!token) {
//     res.status(403).send(JSON.stringify({ok: false, message: 'no token'}));
//     return;
//   } 
//   try {
//     let user = jwt.decode(token, config.auth.secret);
//     // let user2 = helpers.decodeUser(token);
//     if (!user) {
//       res.status(403).send(JSON.stringify({ok: false, message: 'bad token'}));
//       return;
//     }
//     successHandler(user)
//   } catch (e) {
//     res.status(403).send(JSON.stringify({ok: false, message: 'bad token'}));
//   }
// }

/*
 * Helper function to get a user from the request.
 * If no user is found, sends a network response with an error.
 * 
 * successHandler should take a user as an argument.
 */
// function findUser(db, req, res, successHandler) {
//   authorizeUser(req, res, (user) => {
//     // Check to ensure user still exists in the database
//     db.tables.Users.findOne({where: {email: user.email, password: user.password}}).then((foundUser) => {
//       if (!foundUser) {
//         res.status(403).send(JSON.stringify({ok: false, message: 'invalid user token'}));
//         return;
//       }
//       successHandler(foundUser);
//     }).catch(err => {
//       res.status(500).send({ok: false, message: 'Server error', error: err.message});
//     });
//   });
// }