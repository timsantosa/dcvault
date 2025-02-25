const jwt = require('jwt-simple');
const config = require('../config/config');

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

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions.includes(requiredPermission)) {
      console.warn("User does not have required permission: ", requiredPermission);
      return res.status(403).json({ ok: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { authenticateJWT, checkPermission };