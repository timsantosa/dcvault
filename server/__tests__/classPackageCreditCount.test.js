'use strict';

const { isValidPackageCreditCount } = require('../db/classPackageCreditCount');

describe('isValidPackageCreditCount', () => {
  it('accepts null as unlimited and integers of 1 or more', () => {
    expect(isValidPackageCreditCount(null)).toBe(true);
    expect(isValidPackageCreditCount(undefined)).toBe(true);
    expect(isValidPackageCreditCount(1)).toBe(true);
    expect(isValidPackageCreditCount(15)).toBe(true);
  });

  it('rejects zero, negatives, and non-integers', () => {
    expect(isValidPackageCreditCount(0)).toBe(false);
    expect(isValidPackageCreditCount(-1)).toBe(false);
    expect(isValidPackageCreditCount(1.5)).toBe(false);
  });
});
