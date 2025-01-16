const config = require('./config/config');
const jwt = require('jwt-simple');
const jumpRoutes = require('./mobileRoutes/jumpRoutes');
const { authenticateJWT } = require('./middlewares/mobileAuthMiddleware');
const athleteRoutes = require('./mobileRoutes/athleteRoutes');
const authRoutes = require('./mobileRoutes/authRoutes');

module.exports = function addMobileAppRoutes(app, db) {

  

  // No JWT needed for these, they are public
  app.use('/mobileapp/auth', authRoutes(db));

  // Everything under '/mobileapp/user' will need to be authenticated
  app.use('/mobileapp/user', authenticateJWT);
  app.use('/mobileapp/user/log', jumpRoutes(db));
  app.use('/mobileapp/user/athlete', athleteRoutes(db));

  app.get('/mobileapp/user/info', async (req, res) => {
    console.log("Getting user info...");
    const user = req.user;

    // Find associated permissions TODO: user should already include permissions, just send them down.

    // Find associated athlete profile id
    db.tables.AthleteProfiles.findOne({attributes: ['id'], where: {userId: user.id}}).then((profileId) => {
      
      // For now, return fake user data
      let permissions = {
        isAdmin: user.isAdmin,
        isCoach: false,
      }
      let userInfo = {
        id: user.id,
        permissions: permissions,
        athleteId: profileId?.id,
        verified: user.verified,
      }
      res.json({ok: true, message: 'found user info', userInfo});
    });
  });
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