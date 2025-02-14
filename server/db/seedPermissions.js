/*
*  syncTables(schema, force).then(() => {
*      seedRolesAndPermissions(db); // Add this line
*  });
*/
async function seedRolesAndPermissions(db) {
    try {
      // Create Roles
      const adminRole = await db.tables.Roles.findOrCreate({
        where: { roleName: 'Admin' }
      });
  
      const baseRole = await db.tables.Roles.findOrCreate({
        where: { roleName: 'Base' }
      });
  
      // Create Permissions
      const permissions = [
        { permissionKey: 'view_profiles', permissionName: 'View Athlete Profiles', description: 'Allows viewing of athlete profiles.' },
        { permissionKey: 'edit_others_profiles', permissionName: "Edit Other's Profiles", description: 'Allows editing of Athlete Profiles other than your own.' },
        { permissionKey: 'manage_roles', permissionName: 'Manage Roles', description: 'Allows assigning roles and permissions to users.' },
      ];
  
      for (const perm of permissions) {
        await db.tables.Permissions.findOrCreate({
          where: { permissionKey: perm.permissionKey },
          defaults: perm
        });
      }
  
      // Assign Permissions to Roles
      const adminPermissions = await db.tables.Permissions.findAll({
        where: { permissionKey: ['view_profiles', 'edit_others_profiles', 'manage_roles'] }
      });
  
      const basePermissions = await db.tables.Permissions.findAll({
        where: { permissionKey: ['view_profiles'] }
      });
  
      // Assign to Admin Role
      for (const perm of adminPermissions) {
        await db.tables.Role_Permissions.findOrCreate({
          where: { roleId: adminRole[0].id, permissionId: perm.id }
        });
      }
  
      // Assign to User Role
      for (const perm of basePermissions) {
        await db.tables.Role_Permissions.findOrCreate({
          where: { roleId: baseRole[0].id, permissionId: perm.id }
        });
      }
  
      console.log('✅ Roles and Permissions seeded successfully.');
    } catch (error) {
      console.error('❌ Error seeding roles and permissions:', error);
    }
  }

  module.exports = { seedRolesAndPermissions, }