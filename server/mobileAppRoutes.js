
const helpers = require('./lib/helpers');
const config = require('./config/config');
const jwt = require('jwt-simple');

module.exports = function addMobileAppRoutes(app, db) {
  app.get('/mobileapp/users/info', (req, res) => {
    console.log("Getting user info...");
    let authBearer = req.headers.authorization;
    if (!authBearer) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}));
      console.log("No authorization header");
      return;
    }
    let token = authBearer.split(' ')[1];
    if (!token) {
      res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}));
    } else {
      let user = null;
      try {
        user = jwt.decode(token, config.auth.secret);//helpers.decodeUser(token);
      } catch (e) {
      }
      if (user) {
        db.tables.Users.find({where: {email: user.email, password: user.password}}).then((foundUser) => {
          if (foundUser) {

            // Find associated permissions

            // Find associated athlete profile id

            // For now, return fake user data
            let permissions = {
              isAdmin: true,
              isCoach: true,
            }
            let user = {
              id: foundUser.id,
              permissions: permissions,
              athleteId: 5,
              verified: foundUser.verified,
            }
            res.status(200).send({ok: true, message: 'found user info', user});

          } else {
            res.status(403).send(JSON.stringify({ok: false, message: 'invalid user token'}));
          }
        })
      } else {
        res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}));
      }
    }
  })
}