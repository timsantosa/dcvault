'use strict';

const {
  memberScheduleRange,
  classStartInstant,
  presentMemberSchedule,
} = require('../lib/memberSchedule');
const { summarizeCredits, formatCreditChip } = require('../lib/creditInventory');

function session(overrides) {
  return Object.assign({
    seriesId: 1,
    occursOn: '2026-07-20',
    startTime: '16:00:00',
    endTime: '18:00:00',
    title: 'Open Vault',
    description: 'Monday practice',
    location: 'DC Vault',
    note: 'Bring a 14\' pole',
    color: '#336699',
    visible: true,
    isReservable: true,
    capacity: 18,
    creditCost: 1,
    dollarCost: null,
    reservationCutoffMinutes: 1440,
    cancellationCutoffMinutes: 1440,
    status: 'active',
  }, overrides);
}

function grant(overrides) {
  return Object.assign({
    id: 1,
    quantity: 8,
    startsAt: null,
    expiresAt: null,
  }, overrides);
}

describe('classStartInstant', () => {
  it('reads the wall clock as America/New_York, including daylight time', () => {
    expect(classStartInstant('2026-01-15', '16:00:00').toISOString()).toBe('2026-01-15T21:00:00.000Z');
    expect(classStartInstant('2026-07-15', '16:00:00').toISOString()).toBe('2026-07-15T20:00:00.000Z');
  });
});

describe('memberScheduleRange', () => {
  it('starts 14 days before the New York date and runs 77 days ahead', () => {
    const range = memberScheduleRange(new Date('2026-10-23T03:30:00.000Z'));
    expect(range.today).toBe('2026-10-22');
    expect(range.from).toBe('2026-10-08');
    expect(range.to).toBe('2027-01-07');
  });
});

describe('presentMemberSchedule', () => {
  const open = new Date('2026-07-18T12:00:00.000Z');

  it('drops hidden sessions and keeps canceled ones', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [grant()],
      sessions: [
        session({ seriesId: 1, visible: false, title: 'Hidden' }),
        session({ seriesId: 2, status: 'canceled', title: 'Canceled class' }),
      ],
    });
    expect(presented.sessions.map((item) => item.title)).toEqual(['Canceled class']);
    expect(presented.sessions[0].blockReason).toBe('Canceled');
    expect(presented.sessions[0].spotsTaken).toBe(0);
    expect(presented.sessions[0].reserved).toBe(false);
  });

  it('uses the first matching reason', () => {
    const presented = presentMemberSchedule({
      now: new Date('2026-07-20T20:00:00.000Z'),
      grants: [],
      sessions: [
        session({ seriesId: 1, status: 'canceled', isReservable: false }),
        session({ seriesId: 2, occursOn: '2026-07-21', isReservable: false }),
        session({ seriesId: 3, occursOn: '2026-07-15' }),
      ],
    });
    expect(presented.sessions.map((item) => item.blockReason)).toEqual([
      'Reservations closed 24 hours before start',
      'Canceled',
      'View only',
    ]);
  });

  it('leaves a class open when the cutoff has not passed and credits cover it', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [grant()],
      sessions: [session()],
    });
    expect(presented.sessions[0].blockReason).toBeNull();
    expect(presented.sessions[0].cancellationNote).toBe(
      'Cancel up to 24 hours before start to keep your credit'
    );
  });

  it('closes reservations at the class start when the cutoff is zero', () => {
    const presented = presentMemberSchedule({
      now: new Date('2026-07-20T20:00:00.000Z'),
      grants: [grant()],
      sessions: [session({ reservationCutoffMinutes: 0, cancellationCutoffMinutes: 0 })],
    });
    expect(presented.sessions[0].blockReason).toBe('Reservations closed at start');
  });

  it('says when the only credits start after the class', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [grant({ startsAt: new Date('2026-11-01T04:00:00.000Z') })],
      sessions: [session({ occursOn: '2026-10-25' })],
    });
    expect(presented.sessions[0].blockReason).toBe('Credits start Nov 1');
  });

  it('does not ask for credits when the class costs none', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [],
      sessions: [session({ creditCost: 0, dollarCost: 40 })],
    });
    expect(presented.sessions[0].blockReason).toBeNull();
    expect(presented.sessions[0].dollarCost).toBe(40);
  });

  it('accepts a fractional credit cost the member can cover', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [grant({ quantity: 1 })],
      sessions: [session({ creditCost: 0.5 })],
    });
    expect(presented.sessions[0].blockReason).toBeNull();
  });

  it('says when current credits expire before the class', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [grant({ expiresAt: new Date('2026-07-19T04:00:00.000Z') })],
      sessions: [session()],
    });
    expect(presented.sessions[0].blockReason).toBe('Credits expire before this class');
    expect(presented.needsRegistration).toBe(false);
  });

  it('asks the member to register when nothing covers the class', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [],
      sessions: [session()],
    });
    expect(presented.sessions[0].blockReason).toBe('Register to reserve');
    expect(presented.needsRegistration).toBe(true);
    expect(presented.chipText).toBe('0 remaining · 0 reserved');
  });

  it('builds the chip from grants with no reservations', () => {
    const grants = [grant()];
    const now = open;
    const presented = presentMemberSchedule({
      now: now,
      grants: grants,
      sessions: [],
    });
    expect(presented.chipText).toBe(formatCreditChip(summarizeCredits({
      now: now,
      grants: grants,
      allocations: [],
    })));
    expect(presented.chipText).toContain('0 reserved');
    expect(presented.needsRegistration).toBe(false);
  });

  it('shows Unlimited and does not ask the member to register', () => {
    const presented = presentMemberSchedule({
      now: open,
      grants: [grant({ quantity: null })],
      sessions: [session()],
    });
    expect(presented.chipText).toBe('Unlimited · 0 reserved');
    expect(presented.needsRegistration).toBe(false);
    expect(presented.sessions[0].blockReason).toBeNull();
  });
});
