const jwt = require('jwt-simple');
const config = require('../config/config');
const { isValidId } = require('../lib/helpers');

function authenticateJWT(req, res, next) {
  const authBearer = req.headers?.authorization;
  if (!authBearer) {
    return res.status(401).json({
      ok: false, 
      message: 'no token',
      code: 'NO_TOKEN'
    });
  }

  try {
    const token = authBearer.split(' ')[1]; 
    if (!token) {
      return res.status(401).json({
        ok: false, 
        message: 'no token',
        code: 'NO_TOKEN'
      });
    } 
    const user = jwt.decode(token, config.auth.secret);
    if (!user) {
      return res.status(401).json({
        ok: false, 
        message: 'bad token',
        code: 'INVALID_TOKEN'
      });
    }

    // Check if token has expired
    if (user.exp && user.exp < Math.floor(Date.now() / 1000)) {
      return res.status(401).json({
        ok: false, 
        message: 'token expired',
        code: 'TOKEN_EXPIRED',
        currentTime: Date.now()
      });
    }
    
    // Successfully authenticated, move along and attach user to request
    req.user = user;
    next();
  } catch (e) {
    console.error('JWT decode error:', e);
    
    // Check if the error is specifically about token expiration
    if (e.message === 'Token expired') {
      return res.status(401).json({
        ok: false, 
        message: 'token expired',
        code: 'TOKEN_EXPIRED',
        currentTime: Date.now()
      });
    }
    
    return res.status(401).json({
      ok: false, 
      message: 'bad token',
      code: 'INVALID_TOKEN'
    });
  }
}

const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions?.includes(requiredPermission)) {
      console.warn("User does not have required permission: ", requiredPermission);
      return res.status(403).json({ ok: false, message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

function athleteProfileBelongsToUser(athleteProfileId, user) {
  if (user.athleteProfileIds && Array.isArray(user.athleteProfileIds)) {
    return user.athleteProfileIds.includes(athleteProfileId) ||
           user.athleteProfileIds.includes(Number(athleteProfileId));
  }

  if (user.athleteProfileId) {
    console.warn('User does not have athleteProfileIds, but has athleteProfileId');
    return user.athleteProfileId === athleteProfileId || user.athleteProfileId === Number(athleteProfileId);
  }
  return false;
}

function checkOwnAthleteProfile(req, res, next) {
  const user = req.user;
  const athleteProfileId = parseInt(req.query.athleteProfileId);
  if (!user || !athleteProfileId || !isValidId(athleteProfileId)) {
    return res.status(400).json({ ok: false, message: 'Bad request' });
  }

  if (!athleteProfileBelongsToUser(athleteProfileId, user)) {
    return res.status(403).json({ ok: false, message: 'Forbidden - Athlete profile does not belong to user' });
  }
  next();
}

function checkOwnAthleteProfileOrPermission(req, res, next, permission) {
  const user = req.user;
  const athleteProfileId = parseInt(req.query.athleteProfileId);

  if (!user || !athleteProfileId || !isValidId(athleteProfileId)) {
    return res.status(400).json({ ok: false, message: 'Bad request' });
  }

  // First check if user has any athlete profile IDs at all
  if (!user.athleteProfileIds && !user.athleteProfileId) {
    return res.status(401).json({ ok: false, message: 'Unauthorized - No athlete profiles associated with user' });
  }

  // Check if user has the required permission
  if (user.permissions.includes(permission)) {
    return next();
  }

  // Check if user has access to this specific athlete profile
  if (!athleteProfileBelongsToUser(athleteProfileId, user)) {
    return res.status(403).json({ ok: false, message: 'Forbidden - No access to this athlete profile' });
  }

  next();
}

function checkOwnUserOrPermission(req, res, next, permission) {
  const user = req.user;
  const userId = parseInt(req.query.userId);

  if (!user || !user.id || !isValidId(userId)) {
    return res.status(400).json({ ok: false, message: 'Bad request' });
  }

  // Check if user has the required permission
  if (user.permissions.includes(permission)) {
    return next();
  }

  // Check if user has access to this specific athlete profile
  if (user.id !== userId) {
    return res.status(403).json({ ok: false, message: 'Forbidden - No access to this athlete profile' });
  }

  next();
}

function checkOwnUserOrProfileOrPermission(req, res, next, permission) {
  const user = req.user;
  const athleteProfileId = parseInt(req.query.athleteProfileId);
  const userId = parseInt(req.query.userId);

  if (!user) {
    return res.status(400).json({ ok: false, message: 'Bad request' });
  }

  // Check if user has the required permission
  if (user.permissions.includes(permission)) {
    return next();
  }

  // Check if user has access to this specific athlete profile
  if (athleteProfileId && athleteProfileBelongsToUser(athleteProfileId, user)) {
    return next();
  }

  // Check if user has access to this specific user
  if (userId && user.id === userId) {
    return next();
  }

  return res.status(403).json({ ok: false, message: 'Forbidden - No access to this resource' });
}


module.exports = { 
  authenticateJWT,
  checkPermission,
  athleteProfileBelongsToUser,
  checkOwnAthleteProfileOrPermission,
  checkOwnUserOrPermission,
  checkOwnUserOrProfileOrPermission,
  checkOwnAthleteProfile,
};