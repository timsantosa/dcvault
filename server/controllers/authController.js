
const jwt = require('jwt-simple');
const bcrypt = require('bcrypt-nodejs');
const config = require('../config/config');

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
  const athleteProfile = await db.tables.AthleteProfiles.findOne({
    attributes: ['id'],
    where: { userId: user.id },
    raw: true,
  });
  const athlete = await db.tables.Athletes.findOne({
    attributes: ['id'],
    where: { userId: user.id },
    raw: true,
  });

  const athleteProfileId = athleteProfile?.id;
  const athleteId = athlete?.id;

  return {
    id: user.id,
    isAdmin: user.isAdmin,
    verified: user.verified,
    roles: roleNames,
    permissions: [...permissions], // Convert set to array
    athleteProfileId: athleteProfileId || undefined, 
    athleteId: athleteId || undefined,
  };
}


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

    // Generate JWT with roles & permissions
    const tokenPayload = await generateMobileUser(user, db);

    // const token = jwt.sign(tokenPayload, config.auth.secret, { expiresIn: '1h' });
    const token = jwt.encode(tokenPayload, config.auth.secret);

    return res.json({ ok: true, message: 'Login successful', token });

    // Create Refresh Token
    // const refreshToken = crypto.randomBytes(40).toString('hex'); // Generate a random token
    // await db.tables.RefreshTokens.create({
    //   userId: user.id,
    //   token: refreshToken,
    //   expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days expiration
    // });

    res.json({
      ok: true,
      message: 'Login successful',
      accessToken,
      // refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};


// Also allows client to refresh token
async function getMobileUserInfo(req, res, db) {
  try {
    const user = req.user;
    const refreshedUser = await generateMobileUser(user, db);
    const token = jwt.encode(refreshedUser, config.auth.secret);
    res.json({ ok: true, message: "Refreshed mobile user", userInfo: refreshedUser, token })
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

// Unused below


const register = (req, res, db) => {
  // TODO: 
  res.json({ ok: true, message: 'Registration successful' });
};


// Save for later
const refreshToken = async (req, res, db) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ ok: false, message: 'No refresh token provided' });
    }

    // Find refresh token in database
    const storedToken = await db.tables.RefreshTokens.findOne({ where: { token: refreshToken } });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(403).json({ ok: false, message: 'Invalid or expired refresh token' });
    }

    // Find user associated with token
    const user = await db.tables.Users.findByPk(storedToken.userId);
    if (!user) {
      return res.status(403).json({ ok: false, message: 'User not found' });
    }

    // Generate new Access Token
    // Create Access Token
    const accessTokenPayload = { // TODO: Wrong object
      id: user.id,
      email: user.email,
      role: user.role,
      verified: user.verified,
      // TODO: add more data here
    };
    const newAccessToken = jwt.encode(accessTokenPayload,
      config.auth.secret//,
      // { expiresIn: '15m' }
    );

    res.json({ ok: true, accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

const logout = async (req, res, db) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ ok: false, message: 'No refresh token provided' });
    }

    await db.tables.RefreshTokens.destroy({ where: { token: refreshToken } });

    res.json({ ok: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ ok: false, message: 'Internal server error' });
  }
};

module.exports = { mobileLogin, getMobileUserInfo }