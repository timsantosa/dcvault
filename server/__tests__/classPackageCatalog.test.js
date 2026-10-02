'use strict';

const {
  normalizeClassPackageInput,
  sortOrdersForSection,
  toClassPackageJson,
} = require('../lib/classPackageCatalog');

const existing = [
  { id: 1, audience: 'allages', name: '8 Classes' },
  { id: 2, audience: 'adult', name: '8 Classes' },
];

function normalize(input, currentId) {
  return normalizeClassPackageInput(input, { packages: existing, currentId: currentId });
}

describe('normalizeClassPackageInput', () => {
  const valid = {
    name: '  4 Classes  ',
    price: '250',
    audience: 'allages',
    creditCount: 4,
    unlimited: false,
    inviteLevel: null,
    active: true,
  };

  it('trims the name and stores price with two decimals', () => {
    const result = normalize(valid);
    expect(result.ok).toBe(true);
    expect(result.value).toEqual({
      name: '4 Classes',
      price: '250.00',
      audience: 'allages',
      creditCount: 4,
      inviteLevel: null,
      active: true,
    });
  });

  it('stores null credits only when unlimited is chosen', () => {
    const result = normalize({
      name: 'Unlimited Classes',
      price: 825,
      audience: 'AllAges',
      unlimited: true,
      creditCount: null,
      inviteLevel: '',
    });
    expect(result.ok).toBe(true);
    expect(result.value.audience).toBe('allages');
    expect(result.value.creditCount).toBeNull();
    expect(result.value.price).toBe('825.00');
    expect(result.value.inviteLevel).toBeNull();
    expect(result.value.active).toBe(true);
  });

  it('rejects a blank credit count when unlimited is off', () => {
    const result = normalize({ ...valid, creditCount: '', unlimited: false });
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/credit count/i);
  });

  it('rejects unlimited together with a credit count', () => {
    const result = normalize({ ...valid, unlimited: true, creditCount: 8 });
    expect(result.ok).toBe(false);
  });

  it('rejects zero, fractions, and prices with extra decimals', () => {
    expect(normalize({ ...valid, creditCount: 0 }).ok).toBe(false);
    expect(normalize({ ...valid, creditCount: 1.5 }).ok).toBe(false);
    expect(normalize({ ...valid, price: -1 }).ok).toBe(false);
    expect(normalize({ ...valid, price: '10.999' }).ok).toBe(false);
    expect(normalize({ ...valid, price: '' }).ok).toBe(false);
  });

  it('accepts a zero price and an invite level from 1 to 5', () => {
    const result = normalize({ ...valid, price: '0.00', inviteLevel: '3' });
    expect(result.ok).toBe(true);
    expect(result.value.price).toBe('0.00');
    expect(result.value.inviteLevel).toBe(3);
  });

  it('rejects invite levels outside 1 to 5', () => {
    expect(normalize({ ...valid, inviteLevel: 0 }).ok).toBe(false);
    expect(normalize({ ...valid, inviteLevel: 6 }).ok).toBe(false);
    expect(normalize({ ...valid, inviteLevel: 1.5 }).ok).toBe(false);
  });

  it('rejects a group key that is not a slug', () => {
    expect(normalize({ ...valid, audience: 'all ages' }).ok).toBe(false);
    expect(normalize({ ...valid, audience: '' }).ok).toBe(false);
    expect(normalize({ ...valid, audience: 'Elite' }).value.audience).toBe('elite');
  });

  it('rejects a duplicate name in the same group and allows it in another', () => {
    expect(normalize({ ...valid, name: '8 Classes', audience: 'allages' }).ok).toBe(false);
    const otherGroup = normalize({ ...valid, name: '8 Classes', audience: 'fly-kids' });
    expect(otherGroup.ok).toBe(true);
  });

  it('allows a package to keep its own name', () => {
    const result = normalize({ ...valid, name: '8 Classes', audience: 'allages' }, 1);
    expect(result.ok).toBe(true);
  });
});

describe('sortOrdersForSection', () => {
  it('renumbers a section from 1 in the given order', () => {
    const result = sortOrdersForSection([3, 1, 2], [1, 2, 3]);
    expect(result.ok).toBe(true);
    expect(result.updates).toEqual([
      { id: 3, sortOrder: 1 },
      { id: 1, sortOrder: 2 },
      { id: 2, sortOrder: 3 },
    ]);
  });

  it('rejects an empty list, duplicates, an outsider, and a partial list', () => {
    expect(sortOrdersForSection([], [1]).ok).toBe(false);
    expect(sortOrdersForSection([1, 1], [1]).ok).toBe(false);
    expect(sortOrdersForSection([1, 9], [1, 2]).ok).toBe(false);
    expect(sortOrdersForSection([1], [1, 2]).ok).toBe(false);
  });
});

describe('toClassPackageJson', () => {
  it('formats price and keeps a null credit count', () => {
    expect(toClassPackageJson({
      id: 4,
      name: 'Unlimited Classes',
      price: '825.00',
      audience: 'allages',
      creditCount: null,
      inviteLevel: null,
      active: 1,
      sortOrder: 4,
    })).toEqual({
      id: 4,
      name: 'Unlimited Classes',
      price: '825.00',
      audience: 'allages',
      creditCount: null,
      inviteLevel: null,
      active: true,
      sortOrder: 4,
    });
  });
});
