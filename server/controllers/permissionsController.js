

// Only works for mobile users
// Example usage:
// if (hasPermission(user, 'accessContactInfo')) {
//   console.log('User can access contact info');
// } else {
//   console.log('Permission denied');

const { checkPermission } = require("../middlewares/mobileAuthMiddleware");

// }
const hasPermission = (user, key) => user.permissions?.includes(key);

async function getPermissionsForRole(req, res, db) {
    try {
        const { roleId } = req.params;
        if (!roleId) {
            return res.status(400).json({ ok: false, message: 'Missing roleId' });
        }

        const rolePermissions = await db.tables.Role_Permissions.findAll({
            where: { roleId },
            include: [{ model: db.tables.Permissions }]
        });
    
        const permissions = rolePermissions.map(rp => ({
            id: rp.permission.id,
            permissionKey: rp.permission.permissionKey,
            permissionName: rp.permission.permissionName
        }));
    
        res.json({ 
            ok: true, 
            message: 'Successfully retrieved permissions for role',
            permissions,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function addPermissionToRole(req, res, db) {
    try {
        const { roleId, permissionId } = req.query;
        if (!roleId || !permissionId) {
        return res.status(400).json({ ok: false, message: 'Missing roleId or permissionId' });
        }

        // Ensure role and permission exist
        const role = await db.tables.Roles.findByPk(roleId);
        const permission = await db.tables.Permissions.findByPk(permissionId);
        if (!role || !permission) {
        return res.status(404).json({ ok: false, message: 'Role or permission not found' });
        }

        await db.tables.Role_Permissions.findOrCreate({
            where: { roleId, permissionId }
        });

        res.json({ ok: true, message: 'Permission added to role' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function removePermissionFromRole(req, res, db) {
    try {
        const { roleId, permissionId } = req.params;
        if (!roleId || !permissionId) {
            return res.status(400).json({ ok: false, message: 'Missing roleId or permissionId' });
        }
    
        const deleted = await db.tables.Role_Permissions.destroy({
          where: { roleId, permissionId }
        });
    
        if (!deleted) {
          return res.status(404).json({ ok: false, message: 'Permission not assigned to this role' });
        }
    
        res.json({ ok: true, message: 'Permission removed from role' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}



async function getRolesForUser(req, res, db) {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ ok: false, message: 'Missing userId or permissionId' });
        }
        
        const userRoles = await db.tables.User_Roles.findAll({
            where: { userId },
            include: [{ model: db.tables.Roles }]
        });

        const roles = userRoles.map(ur => ({ 
            id: ur.role.id,
            roleName: ur.role.roleName,
        }));

        res.json({ 
            ok: true,
            message: 'Successfully retrieved roles for user',
            roles,
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function addRoleToUser(req, res, db) {
    try {
        const { userId, roleId } = req.query;
    
        if (!userId || !roleId) {
          return res.status(400).json({ ok: false, message: 'Missing userId or roleId' });
        }
    
        // Ensure user and role exist
        const user = await db.tables.Users.findByPk(userId);
        const role = await db.tables.Roles.findByPk(roleId);
        if (!user || !role) {
          return res.status(404).json({ ok: false, message: 'User or role not found' });
        }
    
        // Assign role to user
        await db.tables.User_Roles.findOrCreate({
          where: { userId, roleId }
        });
    
        res.json({ ok: true, message: 'Role assigned to user' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function removeRoleFromUser(req, res, db) {
    try {
        const { userId, roleId } = req.query;
    
        if (!userId || !roleId) {
          return res.status(400).json({ ok: false, message: 'Missing userId or roleId' });
        }
    
        const deleted = await db.tables.User_Roles.destroy({
          where: { userId, roleId }
        });
    
        if (!deleted) {
          return res.status(404).json({ ok: false, message: 'Role not assigned to this user' });
        }
    
        res.json({ ok: true, message: 'Role removed from user' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
      }
}


// This just returns permission overrides for the user, no role-based permissions
async function getPermissionsForUser(req, res, db) {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ ok: false, message: 'Missing userId or permissionId' });
        }

        const userPermissions = await db.tables.User_Permissions.findAll({
            where: { userId },
            include: [{ model: db.tables.Permissions }]
        });

        const permissions = userPermissions.map(up => ({
            id: up.permission.id,
            permissionKey: up.permission.permissionKey,
            permissionName: up.permission.permissionName
        }));
    
        res.json({ 
            ok: true,
            message: 'Successfully retrieved roles for user',
            permissions,
         });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function addPermissionToUser(req, res, db) {
    try {
        const { userId, permissionId } = req.params;
        if (!userId || !permissionId) {
            return res.status(400).json({ ok: false, message: 'Missing userId or permissionId' });
        }
    
        // Ensure user and permission exist
        const user = await db.tables.Users.findByPk(userId);
        const permission = await db.tables.Permissions.findByPk(permissionId);
        if (!user || !permission) {
          return res.status(404).json({ ok: false, message: 'User or permission not found' });
        }
    
        // Assign permission to user
        await db.tables.User_Permissions.findOrCreate({
          where: { userId, permissionId }
        });
    
        res.json({ ok: true, message: 'Permission granted to user' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function removePermissionFromUser(req, res, db) {
    try {
        const { userId, permissionId } = req.params;
        if (!userId || !permissionId) {
            return res.status(400).json({ ok: false, message: 'Missing userId or permissionId' });
        }
    
        const deleted = await db.tables.User_Permissions.destroy({
          where: { userId, permissionId }
        });
    
        if (!deleted) {
          return res.status(404).json({ ok: false, message: 'Permission not assigned to this user' });
        }
    
        res.json({ ok: true, message: 'Permission removed from user' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function getAllPermissions(req, res, db) {
    try {
        const permissions = await db.tables.Permissions.findAll();
    
        res.json({ ok: true, message: 'Got all permissions', permissions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function getAllRoles(req, res, db) {
    try {
        const roles = await db.tables.Roles.findAll();
    
        res.json({ ok: true, message: 'Got all roles', roles });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}



module.exports = { 
    checkPermission,

    getRolesForUser,
    addRoleToUser,
    removeRoleFromUser,

    getPermissionsForRole,
    addPermissionToRole,
    removePermissionFromRole,

    getPermissionsForUser,
    addPermissionToUser,
    removePermissionFromUser,

    getAllPermissions,
    getAllRoles,
    // createRole
    // deleteRole
}