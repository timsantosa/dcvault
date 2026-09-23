'use strict';

const {
  PERMISSIONS,
  CLASS_RESERVATION_PERMISSION_KEYS,
  ADMIN_PERMISSION_KEYS,
  BASE_PERMISSION_KEYS,
  COACH_DEFAULT_PERMISSION_KEYS,
  shouldAssignCoachDefaultPermissions,
} = require('../db/seedPermissions');

describe('seedPermissions catalog', () => {
  it('includes all six class-reservation permission keys', () => {
    const catalogKeys = PERMISSIONS.map((p) => p.permissionKey);
    expect(catalogKeys).toEqual(expect.arrayContaining(CLASS_RESERVATION_PERMISSION_KEYS));
    expect(CLASS_RESERVATION_PERMISSION_KEYS).toEqual([
      'reserve_classes',
      'manage_classes',
      'manage_credits',
      'manage_attendance',
      'view_class_roster',
      'edit_training_group',
    ]);
  });

  it('assigns every catalog key to Admin', () => {
    expect(ADMIN_PERMISSION_KEYS).toEqual(PERMISSIONS.map((p) => p.permissionKey));
    expect(ADMIN_PERMISSION_KEYS).toEqual(
      expect.arrayContaining(CLASS_RESERVATION_PERMISSION_KEYS)
    );
  });

  it('adds view_class_roster to Base and keeps reserve_classes off Base', () => {
    expect(BASE_PERMISSION_KEYS).toEqual(expect.arrayContaining([
      'view_profiles',
      'access_mobile_app',
      'create_athlete_profiles',
      'view_class_roster',
    ]));
    expect(BASE_PERMISSION_KEYS).not.toContain('reserve_classes');
  });

  it('assigns only manage_attendance as Coach defaults', () => {
    expect(COACH_DEFAULT_PERMISSION_KEYS).toEqual(['manage_attendance']);
    expect(COACH_DEFAULT_PERMISSION_KEYS).not.toContain('view_class_roster');
  });
});

describe('shouldAssignCoachDefaultPermissions', () => {
  it('is true only when the Coach role was just created', () => {
    expect(shouldAssignCoachDefaultPermissions(true)).toBe(true);
    expect(shouldAssignCoachDefaultPermissions(false)).toBe(false);
    expect(shouldAssignCoachDefaultPermissions(undefined)).toBe(false);
  });
});
