'use strict';

const { parseId } = require('../lib/ids');

describe('parseId', () => {
  it('accepts positive integers and digit strings', () => {
    expect(parseId(12)).toBe(12);
    expect(parseId('12')).toBe(12);
  });

  it('rejects zero and negatives', () => {
    expect(parseId(0)).toBeNull();
    expect(parseId('0')).toBeNull();
    expect(parseId(-3)).toBeNull();
    expect(parseId('-3')).toBeNull();
  });

  it('rejects partial, decimal, and empty strings', () => {
    expect(parseId('12abc')).toBeNull();
    expect(parseId('1.5')).toBeNull();
    expect(parseId(1.5)).toBeNull();
    expect(parseId('')).toBeNull();
    expect(parseId(' 12')).toBeNull();
  });

  it('rejects other types and unsafe numbers', () => {
    expect(parseId(null)).toBeNull();
    expect(parseId(undefined)).toBeNull();
    expect(parseId(NaN)).toBeNull();
    expect(parseId(['1'])).toBeNull();
    expect(parseId('99999999999999999999')).toBeNull();
  });
});
