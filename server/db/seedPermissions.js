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
        { permissionKey: 'manage_meet_data', permissionName: 'Manage Meet Data', description: 'Allows managing meet data like record types, championship types, and division types.' },
        { permissionKey: 'manage_drill_types', permissionName: 'Manage Drill Types', description: 'Allows managing drill types.' },
        { permissionKey: 'manage_active_profiles', permissionName: 'Manage Active Profiles', description: "Allows user to set athlete profiles as always active, even if they don't have a currently registered athleteId" },
        { permissionKey: 'manage_conversations', permissionName: 'Manage Conversations', description: 'Allows user to create new conversations or edit existing conversations.' },
        { permissionKey: 'create_athlete_profiles', permissionName: 'Create Athlete Profiles', description: 'Allows user to create new Athlete Profiles for their own user account.' },
        { permissionKey: 'manage_vault_associations', permissionName: 'Manage Vault Associations', description: 'Allows user to create, edit, and delete Pole Vault Associations.' },
        { permissionKey: 'jumps_access_override', permissionName: 'Jumps Access Override', description: "Allows any athlete profile under this user to access their own jumps even if they don't have a currently registered athleteId or the alwaysActive flag is off." },
        { permissionKey: 'can_send_announcements', permissionName: 'Can Send Announcements', description: "Allows user to send announcements to all athletes or active athletes." },
        { permissionKey: 'view_contact_info', permissionName: 'View Contact Info', description: "Allows user to view contact info and emrgency contact info for athletes." },
        { permissionKey: 'delete_users', permissionName: 'Delete Users', description: "Allows user to delete other users." },
        { permissionKey: 'refresh_ranking_cache', permissionName: 'Refresh Ranking Cache', description: "Allows user to refresh the athlete profile ranking cache." },
        { permissionKey: 'view_favorite_poles', permissionName: 'View Favorite Poles', description: "Allows user to request pinned jump pole data for athlete profiles." },
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
        where: { permissionKey: ['view_profiles', 'access_mobile_app', 'create_athlete_profiles'] }
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