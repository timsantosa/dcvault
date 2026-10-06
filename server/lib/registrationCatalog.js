'use strict';

// Which class packages the website may sell, and how a checkout becomes a grant.
// Callers load rows and write the purchase. Nothing here touches the database.

const AUDIENCE_RANK = {
  'fly-kids': 0,
  adult: 1,
  allages: 2,
};

const SEASONS = ['winter', 'spring', 'summer', 'fall'];

// settings: a registrationSettings row, or null when that row is missing.
// Returns true when useClassPackageCatalog is true or 1. MySQL may return either. A missing row is off.
function isCatalogFlagOn(settings) {
  if (!settings) {
    return false;
  }
  const flag = settings.useClassPackageCatalog;
  return flag === true || flag === 1;
}

// value: invites.level or classPackages.inviteLevel, as a number or a numeric string.
// Returns that integer, or null when the value is missing or not a whole number.
function normalizeInviteLevel(value) {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
    return parseInt(value.trim(), 10);
  }
  return null;
}

// pkg: one classPackages row.
// Returns true when active is true or 1.
function isActivePackage(pkg) {
  return !!pkg && (pkg.active === true || pkg.active === 1);
}

// value: classPackages.creditCount. Null means unlimited.
// Returns null, an integer when the value is a whole number, or the original value when it cannot be parsed.
function normalizeCreditCount(value) {
  if (value == null || value === '') {
    return null;
  }
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
    return parseInt(value.trim(), 10);
  }
  return value;
}

// Sort comparator for the registration form.
// Sections run fly-kids, adult, allages, then any other audience alphabetically. Within a section, sortOrder, then id.
// a, b: package rows. Returns a negative number, zero, or a positive number, like Array#sort.
function compareRegistrationPackages(a, b) {
  const rankA = Object.prototype.hasOwnProperty.call(AUDIENCE_RANK, a.audience) ? AUDIENCE_RANK[a.audience] : 3;
  const rankB = Object.prototype.hasOwnProperty.call(AUDIENCE_RANK, b.audience) ? AUDIENCE_RANK[b.audience] : 3;
  if (rankA !== rankB) {
    return rankA - rankB;
  }
  if (rankA === 3 && a.audience !== b.audience) {
    return String(a.audience).localeCompare(String(b.audience));
  }
  const sortA = a.sortOrder == null ? 0 : a.sortOrder;
  const sortB = b.sortOrder == null ? 0 : b.sortOrder;
  if (sortA !== sortB) {
    return sortA - sortB;
  }
  return Number(a.id) - Number(b.id);
}

// Packages the form may show for the current invite code.
// packages: catalog rows, active or not, public or invite-only.
// inviteLevel: the applied code's level, or null when no code is applied. A number or a numeric string.
// Returns active public packages, plus active packages whose inviteLevel matches, sorted for the form.
function visibleClassPackages(packages, inviteLevel) {
  const level = normalizeInviteLevel(inviteLevel);
  const visible = (packages || []).filter((pkg) => {
    if (!isActivePackage(pkg)) {
      return false;
    }
    const packageLevel = normalizeInviteLevel(pkg.inviteLevel);
    if (packageLevel == null) {
      return true;
    }
    return level != null && packageLevel === level;
  });
  return visible.slice().sort(compareRegistrationPackages);
}

// Packages a valid invite code adds on top of the public list. Public packages are left out so the client can merge the two lists.
// packages: catalog rows. inviteLevel: the code's level. A number or a numeric string.
// Returns the matching active packages, or [] when inviteLevel is missing. Same row shape as visibleClassPackages.
function inviteOnlyPackages(packages, inviteLevel) {
  const level = normalizeInviteLevel(inviteLevel);
  if (level == null) {
    return [];
  }
  return visibleClassPackages(packages, level).filter((pkg) => {
    return normalizeInviteLevel(pkg.inviteLevel) === level;
  });
}

// membership: the form value stored on purchases.membership, such as "pkg:12".
// Returns the package id, or null for any other shape, including the old "8classes" values and "pkg:0".
function parseCatalogMembership(membership) {
  if (typeof membership !== 'string') {
    return null;
  }
  const match = /^pkg:([1-9]\d*)$/.exec(membership.trim());
  if (!match) {
    return null;
  }
  return parseInt(match[1], 10);
}

// Decides whether registration finalize should write a credit grant, before it creates the purchase.
// input: { useClassPackageCatalog, membership, packages, inviteLevel, season }.
// membership is "pkg:<id>" from the catalog form. season is winter, spring, summer, or fall.
// Flag off: { ok: true, grant: false }, even when membership looks like a package.
// Flag on and the package is active and visible for that invite: { ok: true, grant: true, classPackage, membership, group, season }.
// classPackage is { id, name, creditCount }, with creditCount null for unlimited. group is the package audience.
// Otherwise { ok: false, message }, and the caller should not create the purchase.
function resolveCatalogPurchase(input) {
  const source = input || {};
  if (!isCatalogFlagOn({ useClassPackageCatalog: source.useClassPackageCatalog })) {
    return { ok: true, grant: false };
  }

  const packageId = parseCatalogMembership(source.membership);
  if (packageId == null) {
    return { ok: false, message: 'Choose a class package.' };
  }

  const visible = visibleClassPackages(source.packages, source.inviteLevel);
  let selected = null;
  for (let i = 0; i < visible.length; i += 1) {
    if (Number(visible[i].id) === packageId) {
      selected = visible[i];
      break;
    }
  }
  if (!selected || !selected.name) {
    return { ok: false, message: 'That package is not available.' };
  }

  const creditCount = normalizeCreditCount(selected.creditCount);
  if (creditCount !== null && (!Number.isInteger(creditCount) || creditCount < 1)) {
    return { ok: false, message: 'That package is not available.' };
  }

  if (SEASONS.indexOf(source.season) === -1) {
    return { ok: false, message: 'Choose a training session.' };
  }

  return {
    ok: true,
    grant: true,
    classPackage: {
      id: Number(selected.id),
      name: selected.name,
      creditCount: creditCount,
    },
    membership: 'pkg:' + Number(selected.id),
    group: selected.audience,
    season: source.season,
  };
}

module.exports = {
  isCatalogFlagOn,
  visibleClassPackages,
  inviteOnlyPackages,
  parseCatalogMembership,
  resolveCatalogPurchase,
};
