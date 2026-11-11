'use strict';

const { decideCheckIn, decideWalkIn, presentCheckIn } = require('../lib/checkIn');

const NOW = new Date('2026-08-25T20:05:00.000Z');
const EARLIER = new Date('2026-08-25T20:00:00.000Z');

function session(overrides) {
  return Object.assign({
    visible: true,
    isReservable: true,
    status: 'active',
    occursOn: '2026-08-25',
    capacity: 18,
    creditCost: 1,
    dollarCost: null,
    reservationCutoffMinutes: 1440,
  }, overrides);
}

function checkIn(overrides) {
  return decideCheckIn(Object.assign({
    session: session(),
    reservation: { checkedInAt: null },
    today: '2026-08-25',
    present: true,
    now: NOW,
  }, overrides));
}

function walkIn(overrides) {
  return decideWalkIn(Object.assign({
    session: session(),
    today: '2026-08-25',
    alreadyReserved: false,
    spotsTaken: 6,
  }, overrides));
}

describe('decideCheckIn', () => {
  it('marks a signup present and leaves an existing timestamp alone', () => {
    const marked = checkIn();
    expect(marked).toEqual({ ok: true, checkedInAt: NOW });
    expect(marked.allocations).toBeUndefined();

    const again = checkIn({
      reservation: { checkedInAt: EARLIER },
      now: NOW,
    });
    expect(again.checkedInAt).toBe(EARLIER);
  });

  it('clears present and keeps the signup', () => {
    expect(checkIn({
      reservation: { checkedInAt: EARLIER },
      present: false,
    })).toEqual({ ok: true, checkedInAt: null });
  });

  it('rejects a missing signup, a canceled session, and a future date', () => {
    expect(checkIn({ reservation: null }).status).toBe(404);
    expect(checkIn({ reservation: null }).message).toBe('Reservation not found.');
    expect(checkIn({ session: session({ status: 'canceled' }) }).message).toBe('Canceled');
    expect(checkIn({
      session: session({ occursOn: '2026-08-26' }),
      today: '2026-08-25',
    }).message).toBe('Check-in is not open yet');
  });

  it('allows today, a past date, and a view-only or hidden class', () => {
    expect(checkIn({ today: '2026-08-25' }).ok).toBe(true);
    expect(checkIn({
      session: session({ occursOn: '2026-08-24' }),
      today: '2026-08-25',
    }).ok).toBe(true);
    expect(checkIn({
      session: session({ isReservable: false, visible: false }),
    }).ok).toBe(true);
  });

  it('rejects a present value that is not a boolean', () => {
    expect(checkIn({ present: 'true' }).status).toBe(400);
  });
});

describe('decideWalkIn', () => {
  it('returns the same cost as reserve for credit, dollar, and free classes', () => {
    expect(walkIn()).toEqual({
      ok: true,
      creditCost: 1,
      paymentStatus: null,
    });
    expect(walkIn({
      session: session({ creditCost: 0, dollarCost: 40 }),
    })).toEqual({
      ok: true,
      creditCost: 0,
      paymentStatus: 'external',
    });
    expect(walkIn({
      session: session({ creditCost: 1, dollarCost: 10 }),
    })).toMatchObject({
      creditCost: 1,
      paymentStatus: 'external',
    });
    expect(walkIn({
      session: session({ creditCost: 0, dollarCost: null }),
    }).paymentStatus).toBeNull();
  });

  it('allows a hidden class and a session past the reservation cutoff', () => {
    expect(walkIn({
      session: session({ visible: false, reservationCutoffMinutes: 99999 }),
    }).ok).toBe(true);
    expect(walkIn({
      session: session({ occursOn: '2026-08-24' }),
      today: '2026-08-25',
    }).ok).toBe(true);
  });

  it('rejects a full, duplicate, view-only, canceled, or future session', () => {
    expect(walkIn({ spotsTaken: 18 }).message).toBe('Class is full');
    expect(walkIn({ alreadyReserved: true, spotsTaken: 18 }).message).toBe('Already reserved.');
    expect(walkIn({ session: session({ isReservable: false }) }).message).toBe('View only');
    expect(walkIn({ session: session({ status: 'canceled' }) }).message).toBe('Canceled');
    expect(walkIn({
      session: session({ occursOn: '2026-08-26' }),
      today: '2026-08-25',
    }).message).toBe('Check-in is not open yet');
  });
});

describe('presentCheckIn', () => {
  it('counts reserved and present separately and lists walk-ins after reserved athletes', () => {
    const checkedIn = new Date('2026-08-25T20:12:00.000Z');
    const listed = presentCheckIn([
      {
        id: 3,
        athleteProfileId: 9,
        firstName: 'Ben',
        lastName: 'Lee',
        walkIn: false,
        checkedInAt: null,
      },
      {
        id: 1,
        athleteProfileId: 4,
        firstName: 'Chris',
        lastName: 'Ruiz',
        walkIn: 1,
        checkedInAt: checkedIn,
      },
      {
        id: 2,
        athleteProfileId: 5,
        firstName: 'Emma',
        lastName: 'Dunne',
        walkIn: 0,
        checkedInAt: EARLIER,
      },
    ]);

    expect(listed.reservedCount).toBe(2);
    expect(listed.walkInCount).toBe(1);
    expect(listed.presentCount).toBe(2);
    expect(listed.athletes.map((athlete) => athlete.lastName)).toEqual(['Dunne', 'Lee', 'Ruiz']);
    expect(listed.athletes[0]).toMatchObject({ present: true, walkIn: false, checkedInAt: EARLIER });
    expect(listed.athletes[1]).toMatchObject({ present: false, walkIn: false, checkedInAt: null });
    expect(listed.athletes[2]).toMatchObject({
      present: true,
      walkIn: true,
      reservationId: 1,
      checkedInAt: checkedIn,
    });
  });

  it('returns zeros for an empty session', () => {
    expect(presentCheckIn([])).toEqual({
      reservedCount: 0,
      walkInCount: 0,
      presentCount: 0,
      athletes: [],
    });
  });
});
