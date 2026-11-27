'use strict';

const { day, isoDay, parseIsoDay, clock, timestamp } = require('../lib/dates');

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

describe('isoDay', () => {
  it('reads a calendar day as local midnight', () => {
    const date = isoDay('2026-08-05');
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(7);
    expect(date.getDate()).toBe(5);
    expect(date.getHours()).toBe(0);
    expect(day(date)).toBe('2026-08-05');
  });

  it('uses the first ten characters and returns null for null', () => {
    expect(day(isoDay('2026-08-25T22:00:00.000Z'))).toBe('2026-08-25');
    expect(isoDay(null)).toBeNull();
  });
});

describe('parseIsoDay', () => {
  it('accepts a real calendar day', () => {
    expect(day(parseIsoDay('2026-08-05', 'from'))).toBe('2026-08-05');
  });

  it('rejects a bad shape and a day that does not exist', () => {
    expect(() => parseIsoDay('2026-8-05', 'from')).toThrow('from must be YYYY-MM-DD');
    expect(() => parseIsoDay('2026-02-31', 'to')).toThrow('to must be YYYY-MM-DD');
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
