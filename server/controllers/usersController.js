async function getAllUsers(req, res, db) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Get total count for pagination
        const total = await db.tables.Users.count();

        // Get paginated users
        const users = await db.tables.Users.findAll({
            attributes: ['id', 'email', 'name'],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json({
            ok: true,
            message: 'Successfully retrieved users',
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function getAllUsersWithRole(req, res, db) {
    try {
        const { roleId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        if (!roleId) {
            return res.status(400).json({ ok: false, message: 'Missing roleId' });
        }

        // First check if role exists
        const role = await db.tables.Roles.findByPk(roleId);
        if (!role) {
            return res.status(404).json({ ok: false, message: 'Role not found' });
        }

        // Get total count for pagination
        const total = await db.tables.User_Roles.count({
            where: { roleId }
        });

        // Get paginated users with their roles
        const userRoles = await db.tables.User_Roles.findAll({
            where: { roleId },
            include: [{
                model: db.tables.Users,
                attributes: ['id', 'email', 'name']
            }],
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        const users = userRoles.map(ur => ur.user);

        res.json({
            ok: true,
            message: 'Successfully retrieved users with role',
            users,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

async function getUserById(req, res, db) {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(400).json({ ok: false, message: 'Missing userId' });
        }

        const user = await db.tables.Users.findOne({
            where: { id: userId },
            attributes: ['id', 'email', 'name']
        });

        if (!user) {
            return res.status(404).json({ ok: false, message: 'User not found' });
        }

        res.json({ 
            ok: true, 
            message: 'Successfully retrieved user',
            user 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Internal server error' });
    }
}

module.exports = {
    getAllUsers,
    getAllUsersWithRole,
    getUserById
};
