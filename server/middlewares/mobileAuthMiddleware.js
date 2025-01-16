const jwt = require('jwt-simple');
const config = require('../config/config');

// TODO: This is not yet right
// function authenticateJWT(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (authHeader) {
//     const token = authHeader.split(' ')[1];

//     jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//       if (err) {
//         return res.sendStatus(403);
//       }
//       req.user = user; // Attach user to request object
//       next();
//     });
//   } else {
//     return res.sendStatus(401);
//   }
// }

function authenticateJWT(req, res, next) {
  const authBearer = req.headers?.authorization;
  if (!authBearer) {
    return res.status(401).json({ok: false, message: 'no token'});
  }
  const token = authBearer.split(' ')[1];
  if (!token) {
    return res.status(401).json({ok: false, message: 'no token'});
  } 
  try {
    let user = jwt.decode(token, config.auth.secret);
    // let user2 = helpers.decodeUser(token);
    if (!user) {
      return res.status(401).json({ok: false, message: 'bad token'});
    }
    // Successfully authenticated, move along and attach user to request
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ok: false, message: 'bad token'});
  }
}

module.exports = { authenticateJWT };