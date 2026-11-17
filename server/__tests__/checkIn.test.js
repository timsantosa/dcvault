'use strict';

const {
  decideCheckIn,
  decideWalkIn,
  presentCheckIn,
  walkInCreditOffer,
  walkInGrantWindow,
} = require('../lib/checkIn');

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

  it('rejects a group or age mismatch before the full-class check', () => {
    const elite = { id: 4, key: 'elite', label: 'Elite Development' };
    const allAges = { id: 3, key: 'allages', label: 'Open / All Ages' };
    const athlete = { firstName: 'Emma', dob: '2014-01-01', trainingGroups: [] };
    const blocked = walkIn({
      session: session({ trainingGroupIds: [4] }),
      athlete: athlete,
      trainingGroups: [allAges, elite],
      spotsTaken: 18,
    });
    expect(blocked.status).toBe(409);
    expect(blocked.message).toBe('Emma is in Open / All Ages. This class is Elite Development.');
    expect(walkIn({
      session: session({ minAge: 16 }),
      athlete: athlete,
      trainingGroups: [allAges, elite],
    }).message).toBe('Emma is 12. This class is for age 16 or older.');
    expect(walkIn({
      session: session({ trainingGroupIds: [3] }),
      athlete: athlete,
      trainingGroups: [allAges, elite],
    }).ok).toBe(true);
  });

  it('does not recheck eligibility when marking an existing signup present', () => {
    expect(checkIn({ session: session({ trainingGroupIds: [4], minAge: 99 }) }).ok).toBe(true);
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
        profileImage: 'https://example.com/emma.jpg',
        walkIn: 0,
        checkedInAt: EARLIER,
      },
    ]);

    expect(listed.reservedCount).toBe(2);
    expect(listed.walkInCount).toBe(1);
    expect(listed.presentCount).toBe(2);
    expect(listed.athletes.map((athlete) => athlete.lastName)).toEqual(['Dunne', 'Lee', 'Ruiz']);
    expect(listed.athletes[0]).toMatchObject({
      present: true,
      walkIn: false,
      checkedInAt: EARLIER,
      profileImage: 'https://example.com/emma.jpg',
    });
    expect(listed.athletes[1]).toMatchObject({
      present: false,
      walkIn: false,
      checkedInAt: null,
      profileImage: null,
    });
    expect(listed.athletes[2]).toMatchObject({
      present: true,
      walkIn: true,
      reservationId: 1,
      checkedInAt: checkedIn,
    });
  });

  it('copies training groups and still counts that person once', () => {
    const groups = [
      { id: 1, key: 'fly-kids', label: 'Fly Kids' },
      { id: 4, key: 'elite', label: 'Elite Development' },
    ];
    const listed = presentCheckIn([
      {
        id: 2,
        athleteProfileId: 5,
        firstName: 'Emma',
        lastName: 'Dunne',
        walkIn: false,
        checkedInAt: null,
        trainingGroups: groups,
      },
    ]);

    expect(listed.reservedCount).toBe(1);
    expect(listed.walkInCount).toBe(0);
    expect(listed.athletes).toHaveLength(1);
    expect(listed.athletes[0].trainingGroups).toEqual(groups);
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

const CLASS_START = new Date(2026, 7, 25, 16, 0, 0);

function coveringGrant(overrides) {
  return Object.assign({
    id: 1,
    quantity: 4,
    startsAt: new Date(2026, 5, 1),
    expiresAt: new Date(2026, 8, 1),
  }, overrides);
}

function creditOffer(overrides) {
  return walkInCreditOffer(Object.assign({
    athleteId: 9,
    alreadyReserved: false,
    creditCost: 1,
    classStart: CLASS_START,
    grants: [coveringGrant()],
    allocations: [],
  }, overrides));
}

describe('walkInCreditOffer', () => {
  it('reports the usable count after credits already held', () => {
    expect(creditOffer({
      allocations: [{ reservationId: 3, creditGrantId: 1, amount: 1, holding: true }],
    })).toMatchObject({
      linked: true,
      unlimited: false,
      usable: 3,
      shortfall: 0,
    });
  });

  it('ignores a paused hold', () => {
    expect(creditOffer({
      allocations: [{ reservationId: 3, creditGrantId: 1, amount: 3, holding: false }],
    }).usable).toBe(4);
  });

  it('asks for the gap when the finite total is short or negative', () => {
    expect(creditOffer({
      creditCost: 2,
      grants: [coveringGrant({ quantity: 1 })],
    })).toMatchObject({ usable: 1, shortfall: 1, unlimited: false });

    expect(creditOffer({
      grants: [coveringGrant({ id: 2, quantity: -2 })],
    })).toMatchObject({ usable: 0, shortfall: 3, unlimited: false });
  });

  it('does not add credits when an unlimited grant covers the class', () => {
    expect(creditOffer({
      creditCost: 2,
      grants: [coveringGrant({ id: 8, quantity: null })],
    })).toMatchObject({
      unlimited: true,
      usable: null,
      shortfall: 0,
    });

    expect(creditOffer({
      grants: [
        coveringGrant({ quantity: 5 }),
        coveringGrant({ id: 8, quantity: null }),
      ],
    })).toMatchObject({
      unlimited: false,
      usable: 5,
      shortfall: 0,
    });
  });

  it('ignores a grant that does not cover the class', () => {
    expect(creditOffer({
      grants: [coveringGrant({ startsAt: new Date(2026, 8, 1) })],
    })).toMatchObject({ usable: 0, shortfall: 1 });
  });

  it('does not ask for credits on a free class', () => {
    expect(creditOffer({
      creditCost: 0,
      grants: [],
    })).toMatchObject({
      linked: true,
      unlimited: false,
      usable: 0,
      shortfall: 0,
    });
  });

  it('reports an unlinked profile and keeps an existing signup', () => {
    expect(creditOffer({
      athleteId: null,
      alreadyReserved: true,
      grants: [],
    })).toEqual({
      linked: false,
      alreadyReserved: true,
      unlimited: false,
      usable: 0,
      shortfall: 0,
    });
  });
});

describe('walkInGrantWindow', () => {
  it('uses the season that contains the class date, including the previous season', () => {
    expect(walkInGrantWindow('2026-08-25')).toEqual({
      startsOn: '2026-06-01',
      endsOn: '2026-08-31',
    });
    expect(walkInGrantWindow('2026-11-10')).toEqual({
      startsOn: '2026-09-01',
      endsOn: '2026-11-30',
    });
    expect(walkInGrantWindow('2026-01-15')).toEqual({
      startsOn: '2025-12-01',
      endsOn: '2026-02-28',
    });
  });
});
