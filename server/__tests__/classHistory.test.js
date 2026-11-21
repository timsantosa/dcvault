'use strict';

const {
  presentClassProgress,
  canViewClassHistory,
  historyPeriods,
  parseHistoryRange,
  presentClassHistory,
  historyClass,
} = require('../lib/classHistory');

const NOW = new Date(2026, 10, 17, 12, 0, 0);
const TODAY = '2026-11-17';
const FALL_START = new Date(2026, 8, 1);
const FALL_END = new Date(2026, 11, 1);
const RANGE = { from: '2026-01-01', to: '2026-12-31' };

function grant(id, quantity, extra) {
  return Object.assign({ id: id, quantity: quantity, startsAt: FALL_START, expiresAt: FALL_END }, extra || {});
}

function historyGrant(fields) {
  return Object.assign({
    quantity: 1,
    createdAt: new Date(2026, 7, 1),
    expiresAt: FALL_END,
    originalExpiresAt: FALL_END,
  }, fields);
}

function history(extra) {
  return presentClassHistory(Object.assign({
    now: NOW,
    today: TODAY,
    from: RANGE.from,
    to: RANGE.to,
    grants: [],
    allocations: [],
    reservations: [],
  }, extra));
}

describe('presentClassProgress', () => {
  it('counts staff adds and removals in purchased and leaves out an ended grant', () => {
    const result = presentClassProgress({
      now: NOW,
      grants: [
        grant(1, 16),
        grant(2, 1),
        grant(3, -2),
        grant(4, 8, { expiresAt: new Date(2026, 9, 1) }),
      ],
      allocations: [{ reservationId: 10, creditGrantId: 1, amount: 3, holding: true }],
      reservations: [],
    });
    expect(result.seasonLabel).toBe('Fall quarter');
    expect(result.unlimited).toBe(false);
    expect(result.purchased).toBe(15);
    expect(result.remaining).toBe(12);
    expect(result.summaryText).toBe('12 remaining · 0 reserved · 14 expire Nov 30');
  });

  it('shows unlimited with no purchased count', () => {
    const result = presentClassProgress({
      now: NOW,
      grants: [grant(1, 8), grant(2, null)],
      reservations: [],
    });
    expect(result.unlimited).toBe(true);
    expect(result.purchased).toBeNull();
    expect(result.remaining).toBeNull();
    expect(result.summaryText).toBe('Unlimited · 0 reserved · through Nov 30');
  });

  it('returns zeros when there are no grants', () => {
    const result = presentClassProgress({ now: NOW, grants: [], reservations: [] });
    expect(result.unlimited).toBe(false);
    expect(result.purchased).toBe(0);
    expect(result.remaining).toBe(0);
    expect(result.attended).toBe(0);
  });

  it('leaves out a grant that has not started yet', () => {
    const result = presentClassProgress({
      now: NOW,
      grants: [grant(1, 8, { startsAt: new Date(2026, 11, 1), expiresAt: new Date(2027, 2, 1) })],
      reservations: [],
    });
    expect(result.purchased).toBe(0);
  });

  it('clamps purchased at 0 when active finite grants net negative', () => {
    const result = presentClassProgress({
      now: NOW,
      grants: [grant(1, 2), grant(2, -5)],
      reservations: [],
    });
    expect(result.purchased).toBe(0);
    expect(result.remaining).toBe(0);
  });

  it('counts only check-ins inside the current quarter', () => {
    const checkedIn = new Date(2026, 9, 1);
    const result = presentClassProgress({
      now: NOW,
      grants: [],
      reservations: [
        { occursOn: '2026-09-01', checkedInAt: checkedIn },
        { occursOn: '2026-11-30', checkedInAt: checkedIn },
        { occursOn: '2026-11-10', checkedInAt: null },
        { occursOn: '2026-08-31', checkedInAt: checkedIn },
        { occursOn: '2026-12-01', checkedInAt: checkedIn },
      ],
    });
    expect(result.attended).toBe(2);
  });

  it('does not count a paused hold as reserved', () => {
    const result = presentClassProgress({
      now: NOW,
      grants: [grant(1, 4)],
      reservations: [
        { occursOn: '2026-11-20', checkedInAt: null, classStart: new Date(2026, 10, 20, 16), paused: false },
        { occursOn: '2026-11-21', checkedInAt: null, classStart: new Date(2026, 10, 21, 16), paused: true },
      ],
    });
    expect(result.reserved).toBe(1);
  });
});

describe('canViewClassHistory', () => {
  it('lets manage_credits see any profile', () => {
    expect(canViewClassHistory({ permissions: ['manage_credits'], ownsProfile: false })).toBe(true);
    expect(canViewClassHistory({ permissions: ['manage_credits'], ownsProfile: true })).toBe(true);
  });

  it('lets reserve_classes see only their own profile', () => {
    expect(canViewClassHistory({ permissions: ['reserve_classes'], ownsProfile: true })).toBe(true);
    expect(canViewClassHistory({ permissions: ['reserve_classes'], ownsProfile: false })).toBe(false);
  });

  it('blocks an owner without reserve_classes', () => {
    expect(canViewClassHistory({ permissions: [], ownsProfile: true })).toBe(false);
    expect(canViewClassHistory({ permissions: undefined, ownsProfile: true })).toBe(false);
  });
});

describe('historyPeriods', () => {
  it('starts at the current quarter and walks back eight more', () => {
    const periods = historyPeriods(NOW);
    expect(periods).toHaveLength(9);
    expect(periods[0]).toEqual({
      label: 'Current Quarter',
      from: '2026-09-01',
      to: '2026-11-30',
      current: true,
    });
    expect(periods[1]).toEqual({
      label: 'Summer 2026',
      from: '2026-06-01',
      to: '2026-08-31',
      current: false,
    });
    expect(periods[3]).toEqual({
      label: 'Winter 2025',
      from: '2025-12-01',
      to: '2026-02-28',
      current: false,
    });
    expect(periods[8].label).toBe('Fall 2024');
    expect(periods[8].from).toBe('2024-09-01');
  });
});

describe('parseHistoryRange', () => {
  it('uses the current quarter when both dates are omitted', () => {
    expect(parseHistoryRange(undefined, undefined, NOW)).toEqual({
      ok: true,
      from: '2026-09-01',
      to: '2026-11-30',
    });
    expect(parseHistoryRange('', '', NOW).ok).toBe(true);
  });

  it('rejects a half range, a bad day, and a reversed range', () => {
    expect(parseHistoryRange('2026-08-01', undefined, NOW)).toEqual({
      ok: false,
      message: 'from and to must both be set',
    });
    expect(parseHistoryRange('2026-02-31', '2026-03-01', NOW)).toEqual({
      ok: false,
      message: 'from and to must be YYYY-MM-DD',
    });
    expect(parseHistoryRange('2026-08-01', '2026-07-01', NOW)).toEqual({
      ok: false,
      message: 'from must be on or before to',
    });
  });
});

describe('historyClass', () => {
  it('uses the session when that date is still on the class', () => {
    expect(historyClass({ title: 'Open Vault', status: 'canceled' }, { title: 'Series', canceledAt: null })).toEqual({
      title: 'Open Vault',
      canceled: true,
    });
  });

  it('keeps the series title when the date is gone, and Class when the series is gone', () => {
    expect(historyClass(null, { title: 'Open Vault', canceledAt: null })).toEqual({
      title: 'Open Vault',
      canceled: false,
    });
    expect(historyClass(null, { title: 'Open Vault', canceledAt: new Date(2026, 7, 1) })).toEqual({
      title: 'Open Vault',
      canceled: true,
    });
    expect(historyClass(null, null)).toEqual({ title: 'Class', canceled: false });
  });
});

describe('presentClassHistory', () => {
  const open = { expiresAt: FALL_END, originalExpiresAt: FALL_END };

  it('lists purchases and staff adjustments as their own lines, newest first', () => {
    const result = history({
      grants: [
        historyGrant({ id: 1, label: 'Quarterly package', quantity: 16, createdAt: new Date(2026, 7, 1) }),
        historyGrant({ id: 2, label: 'Makeup credit', quantity: 1, createdAt: new Date(2026, 7, 12) }),
        historyGrant(Object.assign({ id: 3, label: 'Credit removed', quantity: -1, createdAt: new Date(2026, 7, 20) }, open)),
      ],
    });
    expect(result.events.map((event) => event.title)).toEqual([
      'Credit removed',
      'Makeup credit',
      'Quarterly package',
    ]);
    expect(result.events.map((event) => event.detail)).toEqual([
      '\u22121 · exp Nov 30',
      '+1 · exp Nov 30',
      '+16 · exp Nov 30',
    ]);
    expect(result.events[0].dateText).toBe('Aug 20');
  });

  it('shows attended, missed, and leaves out today, the future, and a canceled class', () => {
    const result = history({
      reservations: [
        { id: 1, occursOn: '2026-08-25', title: 'Open Vault', checkedIn: true, canceled: false },
        { id: 2, occursOn: '2026-08-20', title: 'Open Vault', checkedIn: false, canceled: false },
        { id: 3, occursOn: '2026-11-17', title: 'Open Vault', checkedIn: false, canceled: false },
        { id: 4, occursOn: '2026-11-20', title: 'Open Vault', checkedIn: false, canceled: false },
        { id: 5, occursOn: '2026-08-18', title: 'Open Vault', checkedIn: false, canceled: true },
        { id: 6, occursOn: '2026-08-10', title: 'Private', checkedIn: true, canceled: true },
      ],
    });
    expect(result.events.map((event) => [event.date, event.detail])).toEqual([
      ['2026-08-25', 'Attended'],
      ['2026-08-20', 'Missed (reserved, no check-in)'],
      ['2026-08-10', 'Attended'],
    ]);
  });

  it('adds an unused-expired line for leftover credits, including an early end', () => {
    const result = history({
      grants: [
        historyGrant({
          id: 1,
          label: 'Quarterly package',
          quantity: 16,
          createdAt: new Date(2026, 5, 1),
          expiresAt: new Date(2026, 6, 1),
          originalExpiresAt: new Date(2026, 6, 1),
        }),
        historyGrant({
          id: 2,
          label: 'Summer pack',
          quantity: 8,
          createdAt: new Date(2026, 5, 2),
          expiresAt: new Date(2026, 8, 27, 15),
          originalExpiresAt: FALL_END,
        }),
        historyGrant({ id: 3, label: 'Unlimited', quantity: null, createdAt: new Date(2026, 5, 3) }),
      ],
      allocations: [
        { creditGrantId: 1, amount: 14, holding: true },
        { creditGrantId: 2, amount: 6, holding: true },
      ],
    });
    const expired = result.events.filter((event) => event.title === 'Unused credits expired');
    expect(expired.map((event) => [event.date, event.detail])).toEqual([
      ['2026-09-27', '\u22122'],
      ['2026-06-30', '\u22122'],
    ]);
    const ended = result.events.find((event) => event.title === 'Summer pack');
    expect(ended.detail).toBe('+8 · ended Sep 27');
    expect(result.events.find((event) => event.title === 'Unlimited').detail).toBe('Unlimited · through Nov 30');
  });

  it('does not expire a pack that was fully used, or credits still inside their window', () => {
    const result = history({
      grants: [
        historyGrant({ id: 1, label: 'Used up', quantity: 4, createdAt: new Date(2026, 5, 1), expiresAt: new Date(2026, 6, 1), originalExpiresAt: new Date(2026, 6, 1) }),
        historyGrant({ id: 2, label: 'Still open', quantity: 4, createdAt: new Date(2026, 8, 1) }),
      ],
      allocations: [{ creditGrantId: 1, amount: 4, holding: true }],
    });
    expect(result.events.map((event) => event.title)).toEqual(['Still open', 'Used up']);
  });

  it('counts a paused hold as unused when the grant ends', () => {
    const result = history({
      grants: [
        historyGrant({
          id: 1,
          label: 'Summer pack',
          quantity: 4,
          createdAt: new Date(2026, 5, 1),
          expiresAt: new Date(2026, 8, 1),
          originalExpiresAt: new Date(2026, 8, 1),
        }),
      ],
      allocations: [{ creditGrantId: 1, amount: 4, holding: false }],
    });
    expect(result.events.find((event) => event.title === 'Unused credits expired').detail).toBe('\u22124');
  });

  it('keeps classes, then grants, then expirations on the same day', () => {
    const result = history({
      from: '2026-08-12',
      to: '2026-08-12',
      grants: [
        historyGrant({ id: 4, label: 'Makeup credit', quantity: 1, createdAt: new Date(2026, 7, 12) }),
        historyGrant({
          id: 9,
          label: 'Old pack',
          quantity: 3,
          createdAt: new Date(2026, 0, 2),
          expiresAt: new Date(2026, 7, 13),
          originalExpiresAt: new Date(2026, 7, 13),
        }),
      ],
      reservations: [
        { id: 2, occursOn: '2026-08-12', title: 'Open Vault', checkedIn: true, canceled: false },
      ],
    });
    expect(result.events.map((event) => event.title)).toEqual([
      'Open Vault',
      'Makeup credit',
      'Unused credits expired',
    ]);
    expect(result.events.every((event) => event.date === '2026-08-12')).toBe(true);
  });

  it('filters to the inclusive range and adds the year on older dates', () => {
    const result = history({
      from: '2026-08-01',
      to: '2026-08-31',
      grants: [
        historyGrant({
          id: 1,
          label: 'Old pack',
          quantity: 4,
          createdAt: new Date(2025, 5, 1),
          expiresAt: new Date(2025, 6, 1),
          originalExpiresAt: new Date(2025, 6, 1),
        }),
        historyGrant({ id: 2, label: 'Makeup credit', quantity: 1, createdAt: new Date(2026, 7, 12) }),
      ],
    });
    expect(result.events.map((event) => event.title)).toEqual(['Makeup credit']);
    const older = history({
      from: '2025-06-01',
      to: '2025-06-30',
      grants: [
        historyGrant({
          id: 1,
          label: 'Old pack',
          quantity: 4,
          createdAt: new Date(2025, 5, 1),
          expiresAt: new Date(2025, 6, 1),
          originalExpiresAt: new Date(2025, 6, 1),
        }),
      ],
    });
    expect(older.events.find((event) => event.title === 'Old pack').dateText).toBe('Jun 1, 2025');
  });
});
