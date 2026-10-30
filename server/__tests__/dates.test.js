'use strict';

const { day, clock, timestamp } = require('../lib/dates');

describe('day', () => {
  it('returns the first ten characters of a date string', () => {
    expect(day('2026-08-25')).toBe('2026-08-25');
    expect(day('2026-08-25T22:00:00.000Z')).toBe('2026-08-25');
  });

  it('formats a Date as the local calendar day', () => {
    expect(day(new Date(2026, 7, 5))).toBe('2026-08-05');
  });

  it('returns null for null', () => {
    expect(day(null)).toBeNull();
  });
});

describe('clock', () => {
  it('keeps HH:MM:SS and trims anything after it', () => {
    expect(clock('16:00:00')).toBe('16:00:00');
    expect(clock('16:00:00.000')).toBe('16:00:00');
  });

  it('leaves a shorter value alone and returns null for null', () => {
    expect(clock('16:00')).toBe('16:00');
    expect(clock(null)).toBeNull();
  });
});

describe('timestamp', () => {
  it('turns a Date into an ISO string and leaves other values', () => {
    const value = new Date('2026-08-25T22:00:00.000Z');
    expect(timestamp(value)).toBe('2026-08-25T22:00:00.000Z');
    expect(timestamp('2026-08-25T22:00:00.000Z')).toBe('2026-08-25T22:00:00.000Z');
    expect(timestamp(null)).toBeNull();
  });
});
