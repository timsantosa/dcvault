
const helpers = require('./lib/helpers');
const config = require('./config/config');
const jwt = require('jwt-simple');

module.exports = function addMobileAppRoutes(app, db) {

  app.get('/mobileapp/user/info', async (req, res) => {
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
        user = jwt.decode(token, config.auth.secret);
        // let user2 = helpers.decodeUser(token);
      } catch (e) {
      }
      if (user) {
        db.tables.Users.findOne({where: {email: user.email, password: user.password}}).then((foundUser) => {
          if (!foundUser) {
            res.status(403).send(JSON.stringify({ok: false, message: 'invalid user token'}));
            return;
          }
          // Find associated permissions

          // Find associated athlete profile id
          db.tables.AthleteProfiles.findOne({attributes: ['id'], where: {userId: foundUser.id}}).then((profileId) => {
            
            // For now, return fake user data
            let permissions = {
              isAdmin: true,
              isCoach: true,
            }
            let user = {
              id: foundUser.id,
              permissions: permissions,
              athleteId: profileId?.id,
              verified: foundUser.verified,
            }
            res.status(200).send({ok: true, message: 'found user info', user});
          })
        })
      } else {
        res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}));
      }
    }
  })

  app.get('/mobileapp/user/athleteprofile', (req, res) => {
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
        // Get profile id
        let id = req.query.athleteId
        console.log(`Getting athlete profile for id: ${id}`);
        if (!id) {
          res.status(403).send(JSON.stringify({ok: false, message: 'no athlete profile id specified.'}));
          return
        }

        db.tables.AthleteProfiles.findOne({where: {id: id}}).then((profileData) => {
          if (profileData) {
            let userId = profileData.userId;
            if (userId) {
              db.tables.Athletes.findOne({where: {userId: userId}}).then((foundAthlete) => {
                if (foundAthlete) {
                  // TODO: Check if user has permission to see athlete profile

                  let athleteProfile = {
                    id: id,
                    firstName: foundAthlete.firstName,
                    lastName: foundAthlete.lastName,
                    nationality: profileData.nationality,
                    dob: foundAthlete.dob,
                    profileImage: '',
                    backgroundImage: '',
                    stats: {
                      height: profileData.height,
                      weight: profileData.weight,
                      age: 21, // TODO: Calculate based on DOB
                      rank: 12, // TODO: Calculate based on jumps
                      pr: 4.5, // TODO: Calculate based on jumps
                      largestPole: '', // TODO: Calculate based on jumps
                    },
                    // contactInfo: '', // TODO: only if admin
                    // emrgencyContactInfo: '', // TODO: only if admin
                  }

                  res.status(200).send({ok: true, message: 'found athlete profile', athleteProfile});
                }
              });
            }
          }
        });
      } else {
        res.status(403).send(JSON.stringify({ok: false, message: 'bad or no token'}));
        return;
      }
    }
    // res.status(500).send(JSON.stringify({ok: false, message: 'Something is wrong!'}));
  })


  app.get('/mobileapp/user/athleteprofiles', (req, res) => {

  })
}