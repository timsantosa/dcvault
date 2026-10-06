'use strict';

const {
  isCatalogFlagOn,
  visibleClassPackages,
  inviteOnlyPackages,
  parseCatalogMembership,
  resolveCatalogPurchase,
} = require('../lib/registrationCatalog');

function pkg(overrides) {
  return Object.assign({
    id: 1,
    name: '8 Classes',
    audience: 'adult',
    creditCount: 8,
    inviteLevel: null,
    active: true,
    sortOrder: 1,
    price: '100.00',
  }, overrides);
}

const catalog = [
  pkg({ id: 1, audience: 'allages', name: '8 Classes', sortOrder: 2 }),
  pkg({ id: 2, audience: 'fly-kids', name: '2 Classes', creditCount: 2, sortOrder: 1 }),
  pkg({ id: 3, audience: 'adult', name: '8 Classes', sortOrder: 2 }),
  pkg({ id: 4, audience: 'adult', name: '2 Classes', creditCount: 2, sortOrder: 1 }),
  pkg({ id: 5, audience: 'elite', name: 'Elite Block', inviteLevel: 4, sortOrder: 1 }),
  pkg({ id: 6, audience: 'dropin', name: 'Drop In', inviteLevel: 1, sortOrder: 1 }),
  pkg({ id: 7, audience: 'zebra', name: 'Zebra', inviteLevel: null, sortOrder: 1 }),
  pkg({ id: 8, audience: 'allages', name: 'Unlimited Classes', creditCount: null, sortOrder: 4, active: false }),
  pkg({ id: 9, audience: 'adult', name: 'Hidden Adult', inviteLevel: 3, sortOrder: 3 }),
];

describe('isCatalogFlagOn', () => {
  it('treats a missing row and an off flag as off', () => {
    expect(isCatalogFlagOn(null)).toBe(false);
    expect(isCatalogFlagOn({ useClassPackageCatalog: false })).toBe(false);
    expect(isCatalogFlagOn({ useClassPackageCatalog: 0 })).toBe(false);
  });

  it('treats true and 1 as on', () => {
    expect(isCatalogFlagOn({ useClassPackageCatalog: true })).toBe(true);
    expect(isCatalogFlagOn({ useClassPackageCatalog: 1 })).toBe(true);
  });
});

describe('visibleClassPackages', () => {
  it('lists active public packages and a matching invite level, in section order', () => {
    const visible = visibleClassPackages(catalog, '4');
    expect(visible.map((row) => row.id)).toEqual([2, 4, 3, 1, 5, 7]);
  });

  it('hides invite-only packages when no code is applied', () => {
    const visible = visibleClassPackages(catalog, null);
    expect(visible.map((row) => row.id)).toEqual([2, 4, 3, 1, 7]);
  });

  it('returns only the packages a code reveals', () => {
    expect(inviteOnlyPackages(catalog, 1).map((row) => row.id)).toEqual([6]);
    expect(inviteOnlyPackages(catalog, 2)).toEqual([]);
    expect(inviteOnlyPackages(catalog, null)).toEqual([]);
  });
});

describe('parseCatalogMembership', () => {
  it('reads a package id and rejects other membership values', () => {
    expect(parseCatalogMembership('pkg:12')).toBe(12);
    expect(parseCatalogMembership(' pkg:3 ')).toBe(3);
    expect(parseCatalogMembership('8classes')).toBeNull();
    expect(parseCatalogMembership('pkg:0')).toBeNull();
    expect(parseCatalogMembership('pkg:01')).toBeNull();
    expect(parseCatalogMembership(null)).toBeNull();
  });
});

describe('resolveCatalogPurchase', () => {
  const purchase = {
    useClassPackageCatalog: true,
    membership: 'pkg:3',
    packages: catalog,
    inviteLevel: null,
    season: 'fall',
  };

  it('does not grant when the catalog flag is off', () => {
    const resolved = resolveCatalogPurchase(Object.assign({}, purchase, {
      useClassPackageCatalog: false,
      membership: 'pkg:5',
    }));
    expect(resolved).toEqual({ ok: true, grant: false });
  });

  it('maps a public package to the audience, membership, and grant fields', () => {
    const resolved = resolveCatalogPurchase(purchase);
    expect(resolved).toEqual({
      ok: true,
      grant: true,
      classPackage: { id: 3, name: '8 Classes', creditCount: 8 },
      membership: 'pkg:3',
      group: 'adult',
      season: 'fall',
    });
  });

  it('grants an invite package only for the matching level, including unlimited', () => {
    const invite = resolveCatalogPurchase(Object.assign({}, purchase, {
      membership: 'pkg:5',
      inviteLevel: 4,
    }));
    expect(invite.ok).toBe(true);
    expect(invite.group).toBe('elite');
    expect(invite.classPackage).toEqual({ id: 5, name: 'Elite Block', creditCount: 8 });

    const unlimited = resolveCatalogPurchase(Object.assign({}, purchase, {
      membership: 'pkg:10',
      packages: catalog.concat([
        pkg({ id: 10, audience: 'allages', name: 'Unlimited Classes', creditCount: null, sortOrder: 4 }),
      ]),
    }));
    expect(unlimited.classPackage.creditCount).toBeNull();
  });

  it('rejects a missing, inactive, unknown, or invite-mismatched package', () => {
    expect(resolveCatalogPurchase(Object.assign({}, purchase, { membership: '8classes' })).message)
      .toBe('Choose a class package.');
    expect(resolveCatalogPurchase(Object.assign({}, purchase, { membership: 'pkg:8' })).message)
      .toBe('That package is not available.');
    expect(resolveCatalogPurchase(Object.assign({}, purchase, { membership: 'pkg:99' })).message)
      .toBe('That package is not available.');
    expect(resolveCatalogPurchase(Object.assign({}, purchase, { membership: 'pkg:5' })).message)
      .toBe('That package is not available.');
    expect(resolveCatalogPurchase(Object.assign({}, purchase, { membership: 'pkg:9', inviteLevel: 4 })).message)
      .toBe('That package is not available.');
  });

  it('rejects a zero credit count and a season the window resolver does not know', () => {
    const zero = resolveCatalogPurchase(Object.assign({}, purchase, {
      packages: [pkg({ id: 3, creditCount: 0 })],
    }));
    expect(zero.ok).toBe(false);

    const season = resolveCatalogPurchase(Object.assign({}, purchase, { season: 'autumn' }));
    expect(season).toEqual({ ok: false, message: 'Choose a training session.' });
  });
});
