/*
*  syncTables(schema, force).then(() => {
*      seedRolesAndPermissions(db); // Add this line
*  });
*/

const PERMISSIONS = [
  { permissionKey: 'access_mobile_app', permissionName: 'Access mobile app', description: 'Allows access to the mobile app.' },
  { permissionKey: 'view_profiles', permissionName: 'View Athlete Profiles', description: 'Allows viewing of athlete profiles.' },
  { permissionKey: 'edit_others_profiles', permissionName: "Edit Other's Profiles", description: 'Allows editing of Athlete Profiles other than your own.' },
  { permissionKey: 'view_others_jumps', permissionName: 'View Jumps of Other Athletes', description: "Allows viewing of other athlete's jumps." },
  { permissionKey: 'edit_others_jumps', permissionName: 'Edit Jumps of Other Athletes', description: "Allows editing of other athlete's jumps." },
  { permissionKey: 'verify_jumps', permissionName: 'Verify Jumps', description: "Allows verifying of any athlete's jumps." },
  { permissionKey: 'manage_roles', permissionName: 'Manage Roles', description: 'Allows assigning roles and permissions to users.' },
  { permissionKey: 'verify_images', permissionName: 'Verify profile media and log videos', description: "Allows approving or rejecting profile/background images and jump/drill log videos uploaded by other athletes." },
  { permissionKey: 'manage_meet_data', permissionName: 'Manage Meet Data', description: 'Allows managing meet data like record types, championship types, and division types.' },
  { permissionKey: 'manage_drill_types', permissionName: 'Manage Drill Types', description: 'Allows managing drill types.' },
  { permissionKey: 'manage_active_profiles', permissionName: 'Manage Active Profiles', description: "Allows user to set athlete profiles as always active, even if they don't have a currently registered athleteId" },
  { permissionKey: 'manage_conversations', permissionName: 'Manage Conversations', description: 'Allows user to create new conversations or edit existing conversations.' },
  { permissionKey: 'manage_global_conversation_pins', permissionName: 'Manage Global Conversation Pins', description: 'Pin and order conversations for all users’ conversation lists.' },
  { permissionKey: 'create_athlete_profiles', permissionName: 'Create Athlete Profiles', description: 'Allows user to create new Athlete Profiles for their own user account.' },
  { permissionKey: 'manage_vault_associations', permissionName: 'Manage Vault Associations', description: 'Allows user to create, edit, and delete Pole Vault Associations.' },
  { permissionKey: 'jumps_access_override', permissionName: 'Jumps Access Override', description: "Allows any athlete profile under this user to access their own jumps even if they don't have a currently registered athleteId or the alwaysActive flag is off." },
  { permissionKey: 'can_send_announcements', permissionName: 'Can Send Announcements', description: "Allows user to send announcements to all athletes or active athletes." },
  { permissionKey: 'view_contact_info', permissionName: 'View Contact Info', description: "Allows user to view contact info and emrgency contact info for athletes." },
  { permissionKey: 'delete_users', permissionName: 'Delete Users', description: "Allows user to delete other users." },
  { permissionKey: 'refresh_ranking_cache', permissionName: 'Refresh Ranking Cache', description: "Allows user to refresh the athlete profile ranking cache." },
  { permissionKey: 'view_favorite_poles', permissionName: 'View Favorite Poles', description: "Allows user to request pinned jump pole data for athlete profiles." },
  { permissionKey: 'manage_poles', permissionName: 'Manage Poles', description: 'Allows user to create, edit, and delete poles.' },
  { permissionKey: 'reserve_classes', permissionName: 'Reserve Classes', description: 'Allows access to the new Schedule tab and class reservation experience.' },
  { permissionKey: 'manage_classes', permissionName: 'Manage Classes', description: 'Allows creating, editing, canceling, and deleting classes, and canceling reservations on behalf of users.' },
  { permissionKey: 'manage_credits', permissionName: 'Manage Credits', description: 'Allows adding or removing athlete credits as new credit records.' },
  { permissionKey: 'manage_attendance', permissionName: 'Manage Attendance', description: 'Allows checking athletes in to class sessions and adding walk-ins.' },
  { permissionKey: 'view_class_roster', permissionName: 'View Class Roster', description: 'Allows viewing attendee names and photos on class detail.' },
  { permissionKey: 'edit_training_group', permissionName: 'Edit Training Group', description: 'Allows changing an athlete training group on Edit Profile.' },
];

const CLASS_RESERVATION_PERMISSION_KEYS = [
  'reserve_classes',
  'manage_classes',
  'manage_credits',
  'manage_attendance',
  'view_class_roster',
  'edit_training_group',
];

const ADMIN_PERMISSION_KEYS = PERMISSIONS.map(p => p.permissionKey);

const BASE_PERMISSION_KEYS = [
  'view_profiles',
  'access_mobile_app',
  'create_athlete_profiles',
  'view_class_roster',
];

const COACH_DEFAULT_PERMISSION_KEYS = [
  'manage_attendance',
];

function shouldAssignCoachDefaultPermissions(created) {
  return created === true;
}

async function assignPermissionsToRole(db, roleId, permissionKeys) {
  const perms = await db.tables.Permissions.findAll({
    where: { permissionKey: permissionKeys }
  });

  for (const perm of perms) {
    await db.tables.Role_Permissions.findOrCreate({
      where: { roleId, permissionId: perm.id }
    });
  }
}

async function seedRolesAndPermissions(db) {
  try {
    const [adminRole] = await db.tables.Roles.findOrCreate({
      where: { roleName: 'Admin' }
    });

    const [baseRole] = await db.tables.Roles.findOrCreate({
      where: { roleName: 'Base' }
    });

    const [coachRole, coachCreated] = await db.tables.Roles.findOrCreate({
      where: { roleName: 'Coach' }
    });

    for (const perm of PERMISSIONS) {
      // MySQL: INSERT … ON DUPLICATE KEY UPDATE (permissionKey is unique)
      await db.tables.Permissions.upsert(perm);
    }

    await assignPermissionsToRole(db, adminRole.id, ADMIN_PERMISSION_KEYS);
    await assignPermissionsToRole(db, baseRole.id, BASE_PERMISSION_KEYS);

    if (shouldAssignCoachDefaultPermissions(coachCreated)) {
      await assignPermissionsToRole(db, coachRole.id, COACH_DEFAULT_PERMISSION_KEYS);
    }

    console.log('✅ Roles and Permissions seeded successfully.');
  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
  }
}

module.exports = {
  seedRolesAndPermissions,
  PERMISSIONS,
  CLASS_RESERVATION_PERMISSION_KEYS,
  ADMIN_PERMISSION_KEYS,
  BASE_PERMISSION_KEYS,
  COACH_DEFAULT_PERMISSION_KEYS,
  shouldAssignCoachDefaultPermissions,
};
