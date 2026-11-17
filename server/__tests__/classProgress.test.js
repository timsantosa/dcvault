'use strict';

const { presentClassProgress, canViewClassProgress } = require('../lib/classProgress');

const NOW = new Date(2026, 10, 17, 12, 0, 0);
const FALL_START = new Date(2026, 8, 1);
const FALL_END = new Date(2026, 11, 1);

function grant(id, quantity, extra) {
  return Object.assign({ id: id, quantity: quantity, startsAt: FALL_START, expiresAt: FALL_END }, extra || {});
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

describe('canViewClassProgress', () => {
  it('lets manage_credits see any profile', () => {
    expect(canViewClassProgress({ permissions: ['manage_credits'], ownsProfile: false })).toBe(true);
  });

  it('lets reserve_classes see only their own profile', () => {
    expect(canViewClassProgress({ permissions: ['reserve_classes'], ownsProfile: true })).toBe(true);
    expect(canViewClassProgress({ permissions: ['reserve_classes'], ownsProfile: false })).toBe(false);
  });

  it('blocks an owner without reserve_classes', () => {
    expect(canViewClassProgress({ permissions: [], ownsProfile: true })).toBe(false);
    expect(canViewClassProgress({ permissions: undefined, ownsProfile: true })).toBe(false);
  });
});
