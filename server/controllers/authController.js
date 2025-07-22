const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const config = require('../config/config');

const mobileRefreshTokenExpiry = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds
const mobileRefreshTokenNeverExpiry = 100 * 365 * 24 * 60 * 60 * 1000; // 100 years in milliseconds
const mobileAccessTokenExpiry = 15 * 60; // 15 minutes in seconds

// Helpers

// User parameter should be an object from users table or a mobile user object
async function generateMobileUser(user, db) {
  // Get user's roles
  const roles = await db.tables.User_Roles.findAll({
    where: { userId: user.id },
    include: [{ model: db.tables.Roles }]
  });

  const roleNames = roles.map(r => r.role.roleName); // Get role names

  // Get role-based permissions
  const rolePermissions = await db.tables.Role_Permissions.findAll({
    where: { roleId: roles.map(r => r.roleId) },
    include: [{ model: db.tables.Permissions }]
  });

  // Get user-specific permissions
  const userPermissions = await db.tables.User_Permissions.findAll({
    where: { userId: user.id },
    include: [{ model: db.tables.Permissions }]
  });

  // Extract permission keys
  const permissions = new Set([
    ...rolePermissions.map(p => p.permission.permissionKey),
    ...userPermissions.map(p => p.permission.permissionKey)
  ]);

  // Get associated athlete ids
  const athleteProfiles = await db.tables.AthleteProfiles.findAll({
    attributes: ['id'],
    where: { userId: user.id },
    raw: true,
  });
  const athletes = await db.tables.Athletes.findAll({
    attributes: ['id'],
    where: { userId: user.id },
    raw: true,
  });

  const athleteProfileIds = athleteProfiles.map(profile => profile.id);
  const athleteIds = athletes.map(athlete => athlete.id);

  return {
    id: user.id,
    isAdmin: user.isAdmin,
    verified: user.verified,
    roles: roleNames,
    permissions: [...permissions], // Convert set to array
    athleteProfileIds: athleteProfileIds,
    athleteIds: athleteIds,
  };
}

// Generate a secure random refresh token
function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

function getRefreshTokenExpiry() {
  if (config.auth.mobileRefreshTokenExpires === 'true') {
    return new Date(Date.now() + mobileRefreshTokenExpiry); // 6 months
  } else {
    return new Date(Date.now() + mobileRefreshTokenNeverExpiry); // 100 years
  }
}

// Clean up expired refresh tokens
async function cleanupExpiredRefreshTokens(db) {
  await db.tables.MobileRefreshTokens.destroy({
    where: {
      expiresAt: {
        [Op.lt]: new Date()
      }
    }
  });
}

// Clean up existing tokens for a specific user
async function cleanupUserTokens(userId, db) {
  await db.tables.MobileRefreshTokens.destroy({
    where: { userId }
  });
}

// Create a refresh token in the database
async function createRefreshToken(userId, db) {
  // Check how many active tokens this user already has
  const existingTokens = await db.tables.MobileRefreshTokens.count({
    where: { 
      userId,
      isRevoked: false,
      expiresAt: {
        [Op.gt]: new Date() // Not expired
      }
    }
  });

  // If user has 5 or more active tokens, remove the oldest one
  if (existingTokens >= 5) {
    const oldestToken = await db.tables.MobileRefreshTokens.findOne({
      where: { 
        userId,
        isRevoked: false,
        expiresAt: {
          [Op.gt]: new Date()
        }
      },
      order: [['createdAt', 'ASC']]
    });
    
    if (oldestToken) {
      await oldestToken.destroy();
    }
  }
  
  const token = generateRefreshToken();
  const expiresAt = getRefreshTokenExpiry();

  await db.tables.MobileRefreshTokens.create({
    token,
    userId,
    expiresAt,
    isRevoked: false
  });

  return token;
}

function generateJWTWithPayload(payload) {
  return jwt.encode({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + mobileAccessTokenExpiry
  }, config.auth.secret);
}

// Endpoints

const mobileLogin = async (req, res, db) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Bad request' });
    }

    // Find user by email
    const user = await db.tables.Users.findOne({ where: { email } });

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ ok: false, message: 'username or password incorrect' });
    }

    if (!user.verified) {
      return res.status(403).json({ ok: false, message: 'unverified' });
    }

    // During login, if they have no roles assigned to them, add the base role
    await assignBaseRoleIfNecessary(user.id, user.isAdmin, db);

    // Generate JWT payload with roles & permissions
    const tokenPayload = await generateMobileUser(user, db);

    const accessToken = generateJWTWithPayload(tokenPayload);

    // Create refresh token (this will also clean up existing tokens for this user)
    const refreshToken = await createRefreshToken(user.id, db);

    // Clean up expired refresh tokens periodically
    await cleanupExpiredRefreshTokens(db);

    return res.json({ 
      ok: true, 
      message: 'Login successful', 
      accessToken,
      refreshToken,
      expiresIn: mobileAccessTokenExpiry
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

// Refresh access token using refresh token
const refreshToken = async (req, res, db) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ ok: false, message: 'No refresh token provided' });
    }

    // Find refresh token in database
    const storedToken = await db.tables.MobileRefreshTokens.findOne({ 
      where: { 
        token: refreshToken,
        isRevoked: false
      },
      include: [{ model: db.tables.Users }]
    });

    if (!storedToken) {
      return res.status(403).json({ ok: false, message: 'Invalid refresh token' });
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      // Remove expired token
      await storedToken.destroy();
      return res.status(403).json({ ok: false, message: 'Refresh token expired' });
    }

    // Generate new access token and user info
    const tokenPayload = await generateMobileUser(storedToken.user, db);
    const accessToken = generateJWTWithPayload(tokenPayload);

    return res.json({ 
      ok: true, 
      message: 'Token refreshed successfully', 
      accessToken,
      expiresIn: mobileAccessTokenExpiry,
      userInfo: tokenPayload
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

// Revoke refresh token (logout)
const revokeToken = async (req, res, db) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ ok: false, message: 'No refresh token provided' });
    }

    // Mark token as revoked
    await db.tables.MobileRefreshTokens.update(
      { isRevoked: true },
      { where: { token: refreshToken } }
    );

    return res.json({ ok: true, message: 'Token revoked successfully' });

  } catch (error) {
    console.error('Revoke token error:', error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

// Also allows client to refresh token
async function getMobileUserInfo(req, res, db) {
  try {
    const user = req.user;
    const refreshedUser = await generateMobileUser(user, db);
    
    // Create new access token with 15-minute expiration
    const accessToken = generateJWTWithPayload(refreshedUser);

    res.json({ 
      ok: true, 
      message: "Refreshed mobile user", 
      userInfo: refreshedUser, 
      accessToken,
      expiresIn: mobileAccessTokenExpiry
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
}

async function assignBaseRoleIfNecessary(userId, isAdmin, db) {
  // Check if they have any roles
  const userRoles = await db.tables.User_Roles.findAll({
    where: { userId },
    include: [{ model: db.tables.Roles }]
  });
  if (!userRoles || userRoles.length == 0) {
    const roleName = isAdmin ? "Admin" : "Base";

    // Find base role
    let initialRole = await db.tables.Roles.findOne({ where: { roleName }});
    if (!initialRole || !initialRole.id) { return; }

    // Assign role to user
    await db.tables.User_Roles.create({
      userId: userId,
      roleId: initialRole.id 
    });
  }
}

module.exports = { 
  mobileLogin, 
  getMobileUserInfo,
  refreshToken,
  revokeToken,
}