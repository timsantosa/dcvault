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
        { permissionKey: 'access_mobile_app', permissionName: 'Access mobile app', description: 'Allows access to the mobile app.' },
        { permissionKey: 'view_profiles', permissionName: 'View Athlete Profiles', description: 'Allows viewing of athlete profiles.' },
        { permissionKey: 'edit_others_profiles', permissionName: "Edit Other's Profiles", description: 'Allows editing of Athlete Profiles other than your own.' },
        { permissionKey: 'view_others_jumps', permissionName: 'View Jumps of Other Athletes', description: "Allows viewing of other athlete's jumps." },
        { permissionKey: 'edit_others_jumps', permissionName: 'Edit Jumps of Other Athletes', description: "Allows editing of other athlete's jumps." },
        { permissionKey: 'verify_jumps', permissionName: 'Verify Jumps', description: "Allows verifying of any athlete's jumps." },
        { permissionKey: 'manage_roles', permissionName: 'Manage Roles', description: 'Allows assigning roles and permissions to users.' },
        { permissionKey: 'verify_images', permissionName: 'Verify Images', description: "Allows user to verify other users' images" },
      ];
  
      for (const perm of permissions) {
        await db.tables.Permissions.findOrCreate({
          where: { permissionKey: perm.permissionKey },
          defaults: perm
        });
      }
  
      // Assign Permissions to Roles
      const adminPermissions = await db.tables.Permissions.findAll({
        where: { permissionKey: permissions.map(p => p.permissionKey) }
      });
  
      const basePermissions = await db.tables.Permissions.findAll({
        where: { permissionKey: ['view_profiles', 'access_mobile_app'] }
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