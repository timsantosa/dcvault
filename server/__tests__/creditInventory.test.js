'use strict';

const { getCurrentQuarter } = require('../lib/helpers');
const {
  seasonOf,
  resolveSeasonWindow,
  buildStaffAddGrant,
  buildStaffRemoveGrant,
  buildWebsitePurchaseGrant,
  endGrant,
  grantBalance,
  allocateForReservation,
  releaseReservation,
  summarizeCredits,
  formatCreditChip,
  formatHistoryLine,
} = require('../lib/creditInventory');

function expectLocalMidnight(actual, year, monthIndex, day) {
  expect(actual.getFullYear()).toBe(year);
  expect(actual.getMonth()).toBe(monthIndex);
  expect(actual.getDate()).toBe(day);
  expect(actual.getHours()).toBe(0);
  expect(actual.getMinutes()).toBe(0);
  expect(actual.getSeconds()).toBe(0);
  expect(actual.getMilliseconds()).toBe(0);
}

function grant(overrides) {
  return Object.assign({
    id: 1,
    athleteId: 10,
    quantity: 8,
    startsAt: null,
    expiresAt: null,
    originalExpiresAt: null,
  }, overrides);
}

describe('seasonOf', () => {
  it('uses the same month groups as getCurrentQuarter', () => {
    const months = {
      winter: [11, 0, 1],
      spring: [2, 3, 4],
      summer: [5, 6, 7],
      fall: [8, 9, 10],
    };
    Object.keys(months).forEach((season) => {
      months[season].forEach((monthIndex) => {
        expect(seasonOf(new Date(2026, monthIndex, 15))).toBe(season);
      });
    });
    expect(seasonOf(new Date())).toBe(getCurrentQuarter());
  });
});

describe('resolveSeasonWindow', () => {
  const table = [
    {
      today: new Date(2026, 8, 27),
      fall: [2026, 8, 1, 2026, 11, 1],
      winter: [2026, 11, 1, 2027, 2, 1],
      spring: [2027, 2, 1, 2027, 5, 1],
      summer: [2027, 5, 1, 2027, 8, 1],
    },
    {
      today: new Date(2027, 0, 15),
      fall: [2027, 8, 1, 2027, 11, 1],
      winter: [2026, 11, 1, 2027, 2, 1],
      spring: [2027, 2, 1, 2027, 5, 1],
      summer: [2027, 5, 1, 2027, 8, 1],
    },
  ];

  table.forEach((row) => {
    const label = row.today.getFullYear() + '-' + (row.today.getMonth() + 1) + '-' + row.today.getDate();
    ['fall', 'winter', 'spring', 'summer'].forEach((season) => {
      it(label + ' ' + season + ' matches the credit inventory window', () => {
        const bounds = row[season];
        const window = resolveSeasonWindow(season, row.today);
        expectLocalMidnight(window.startsAt, bounds[0], bounds[1], bounds[2]);
        expectLocalMidnight(window.expiresAt, bounds[3], bounds[4], bounds[5]);
      });
    });
  });

  it('treats the start instant as inside and the end instant as the next season', () => {
    const fallStart = resolveSeasonWindow('fall', new Date(2026, 8, 1));
    expectLocalMidnight(fallStart.startsAt, 2026, 8, 1);

    const winterStart = resolveSeasonWindow('winter', new Date(2026, 11, 1));
    expectLocalMidnight(winterStart.startsAt, 2026, 11, 1);

    const fallEnded = resolveSeasonWindow('fall', new Date(2026, 11, 1));
    expectLocalMidnight(fallEnded.startsAt, 2027, 8, 1);
  });

  it('rejects an unknown season', () => {
    expect(() => resolveSeasonWindow('quarterly', new Date(2026, 8, 27))).toThrow(/season/);
  });
});

describe('buildStaffAddGrant', () => {
  it('copies the expiration onto originalExpiresAt and does not share the caller date', () => {
    const expiresAt = new Date(2026, 11, 1);
    const startsAt = new Date(2026, 8, 1);
    const created = buildStaffAddGrant({
      athleteId: 4,
      quantity: 1,
      label: 'Makeup credit',
      startsAt: startsAt,
      expiresAt: expiresAt,
      createdByUserId: 9,
    });

    expect(created).toMatchObject({
      athleteId: 4,
      classPackageId: null,
      purchaseId: null,
      source: 'staff_add',
      label: 'Makeup credit',
      quantity: 1,
      createdByUserId: 9,
    });
    expect(created.expiresAt.getTime()).toBe(expiresAt.getTime());
    expect(created.originalExpiresAt.getTime()).toBe(expiresAt.getTime());
    expect(created.startsAt.getTime()).toBe(startsAt.getTime());
    created.expiresAt.setFullYear(1999);
    expect(expiresAt.getFullYear()).toBe(2026);
  });

  it('rejects null, zero, negative, and fractional amounts', () => {
    [null, 0, -1, 1.5].forEach((quantity) => {
      expect(() => buildStaffAddGrant({
        athleteId: 4,
        quantity: quantity,
        label: 'Makeup credit',
      })).toThrow(/quantity/);
    });
  });
});

describe('buildStaffRemoveGrant', () => {
  it('stores a new negative grant and leaves the original grant alone', () => {
    const original = grant({ id: 3, quantity: 8 });
    const removal = buildStaffRemoveGrant({
      athleteId: 4,
      quantity: 1,
      label: 'Credit removed',
      startsAt: new Date(2026, 8, 1),
      expiresAt: new Date(2026, 11, 1),
      createdByUserId: 9,
    });

    expect(original.quantity).toBe(8);
    expect(removal.source).toBe('staff_remove');
    expect(removal.quantity).toBe(-1);
    expect(removal.classPackageId).toBeNull();
    expect(removal.originalExpiresAt.getTime()).toBe(removal.expiresAt.getTime());
  });
});

describe('buildWebsitePurchaseGrant', () => {
  const classPackage = { id: 5, name: '8 Classes', creditCount: 8 };
  const today = new Date(2026, 8, 27);

  it('builds one grant for the picked season, including a null unlimited count', () => {
    const finite = buildWebsitePurchaseGrant({
      athleteId: 4,
      classPackage: classPackage,
      purchaseId: 20,
      season: 'fall',
      today: today,
      existingGrants: [],
    });
    expect(finite.created).toBe(true);
    expect(finite.grant).toMatchObject({
      athleteId: 4,
      classPackageId: 5,
      purchaseId: 20,
      source: 'website_purchase',
      label: '8 Classes',
      quantity: 8,
      createdByUserId: null,
    });
    expectLocalMidnight(finite.grant.startsAt, 2026, 8, 1);
    expectLocalMidnight(finite.grant.expiresAt, 2026, 11, 1);
    expect(finite.grant.originalExpiresAt.getTime()).toBe(finite.grant.expiresAt.getTime());

    const unlimited = buildWebsitePurchaseGrant({
      athleteId: 4,
      classPackage: { id: 6, name: 'Unlimited Classes', creditCount: null },
      purchaseId: 21,
      season: 'fall',
      today: today,
      existingGrants: [],
    });
    expect(unlimited.grant.quantity).toBeNull();
  });

  it('returns the existing grant when the purchase was already granted', () => {
    const first = buildWebsitePurchaseGrant({
      athleteId: 4,
      classPackage: classPackage,
      purchaseId: 20,
      season: 'fall',
      today: today,
      existingGrants: [],
    });
    const second = buildWebsitePurchaseGrant({
      athleteId: 4,
      classPackage: { id: 99, name: 'Other', creditCount: 2 },
      purchaseId: 20,
      season: 'winter',
      today: today,
      existingGrants: [first.grant],
    });

    expect(second.created).toBe(false);
    expect(second.grant).toBe(first.grant);
    expect(first.grant.quantity).toBe(8);
  });

  it('rejects a zero credit count so a blank package cannot become unlimited', () => {
    expect(() => buildWebsitePurchaseGrant({
      athleteId: 4,
      classPackage: { id: 5, name: '8 Classes', creditCount: 0 },
      purchaseId: 20,
      season: 'fall',
      today: today,
      existingGrants: [],
    })).toThrow(/creditCount/);
  });
});

describe('endGrant', () => {
  const originalExpiresAt = new Date(2026, 11, 1);
  const now = new Date(2026, 8, 27, 15, 0, 0);

  it('moves a future or open expiration to now and leaves quantity and the original date', () => {
    const open = grant({ quantity: null, expiresAt: null, originalExpiresAt: null });
    const endedOpen = endGrant(open, now);
    expect(endedOpen.changed).toBe(true);
    expect(endedOpen.grant.expiresAt.getTime()).toBe(now.getTime());
    expect(endedOpen.grant.originalExpiresAt).toBeNull();
    expect(open.expiresAt).toBeNull();

    const future = grant({
      quantity: 8,
      expiresAt: new Date(originalExpiresAt.getTime()),
      originalExpiresAt: new Date(originalExpiresAt.getTime()),
    });
    const ended = endGrant(future, now);
    expect(ended.changed).toBe(true);
    expect(ended.grant.expiresAt.getTime()).toBe(now.getTime());
    expect(ended.grant.originalExpiresAt.getTime()).toBe(originalExpiresAt.getTime());
    expect(ended.grant.quantity).toBe(8);
    expect(future.expiresAt.getTime()).toBe(originalExpiresAt.getTime());
  });

  it('does nothing when the original end has passed or the grant was already ended', () => {
    const pastOriginal = grant({
      expiresAt: new Date(2026, 11, 1),
      originalExpiresAt: new Date(2026, 8, 1),
    });
    const afterOriginal = endGrant(pastOriginal, new Date(2026, 8, 15));
    expect(afterOriginal.changed).toBe(false);
    expect(afterOriginal.grant).toBe(pastOriginal);

    const alreadyEnded = grant({
      expiresAt: new Date(2026, 8, 1),
      originalExpiresAt: new Date(2026, 11, 1),
    });
    const again = endGrant(alreadyEnded, now);
    expect(again.changed).toBe(false);
    expect(alreadyEnded.expiresAt.getTime()).toBe(new Date(2026, 8, 1).getTime());
  });
});

describe('allocateForReservation', () => {
  const classStart = new Date(2026, 8, 29, 16, 0, 0);

  function spend(grants, extra) {
    return allocateForReservation(Object.assign({
      grants: grants,
      allocations: [],
      classStart: classStart,
      creditCost: 1,
      reservationId: 50,
    }, extra));
  }

  it('spends soonest-expiring finite grants first, null expirations last, then oldest id', () => {
    const soon = grant({ id: 2, quantity: 1, expiresAt: new Date(2026, 9, 1) });
    const later = grant({ id: 3, quantity: 5, expiresAt: new Date(2026, 11, 1) });
    const open = grant({ id: 4, quantity: 5, expiresAt: null });
    const sameDayHighId = grant({ id: 8, quantity: 1, expiresAt: new Date(2026, 9, 1) });
    const sameDayLowId = grant({ id: 7, quantity: 1, expiresAt: new Date(2026, 9, 1) });

    const split = spend([later, open, soon], { creditCost: 3 });
    expect(split.ok).toBe(true);
    expect(split.allocations).toEqual([
      { reservationId: 50, creditGrantId: 2, amount: 1 },
      { reservationId: 50, creditGrantId: 3, amount: 2 },
    ]);

    const withOpen = spend([open, later], { creditCost: 6 });
    expect(withOpen.allocations).toEqual([
      { reservationId: 50, creditGrantId: 3, amount: 5 },
      { reservationId: 50, creditGrantId: 4, amount: 1 },
    ]);

    const tie = spend([sameDayHighId, sameDayLowId], { creditCost: 1 });
    expect(tie.allocations).toEqual([
      { reservationId: 50, creditGrantId: 7, amount: 1 },
    ]);
  });

  it('respects an inclusive start and an exclusive end', () => {
    const startsAt = new Date(2026, 9, 1);
    const expiresAt = new Date(2026, 11, 1);
    const windowed = grant({ id: 1, quantity: 4, startsAt: startsAt, expiresAt: expiresAt });

    expect(spend([windowed], { classStart: new Date(startsAt.getTime() - 1) }).ok).toBe(false);
    expect(spend([windowed], { classStart: startsAt }).ok).toBe(true);
    expect(spend([windowed], { classStart: new Date(expiresAt.getTime() - 1) }).ok).toBe(true);
    expect(spend([windowed], { classStart: expiresAt }).reason).toBe('no_credits');
  });

  it('counts a negative removal in the finite total', () => {
    const pack = grant({ id: 1, quantity: 5, expiresAt: new Date(2026, 11, 1) });
    const removal = grant({
      id: 2,
      quantity: -3,
      source: 'staff_remove',
      expiresAt: new Date(2026, 11, 1),
    });

    expect(spend([pack, removal], { creditCost: 3 }).reason).toBe('no_credits');
    expect(spend([pack, removal], { creditCost: 2 }).allocations).toEqual([
      { reservationId: 50, creditGrantId: 1, amount: 2 },
    ]);
  });

  it('leaves finite credits in place when a shortfall spends one unlimited grant', () => {
    const finite = grant({ id: 1, quantity: 2, expiresAt: new Date(2026, 9, 1) });
    const soonerUnlimited = grant({ id: 3, quantity: null, expiresAt: new Date(2026, 11, 1) });
    const laterUnlimited = grant({ id: 2, quantity: null, expiresAt: new Date(2027, 2, 1) });
    const openUnlimited = grant({ id: 4, quantity: null, expiresAt: null });
    const existing = [];

    const covered = spend([finite, soonerUnlimited], { creditCost: 1 });
    expect(covered.allocations).toEqual([
      { reservationId: 50, creditGrantId: 1, amount: 1 },
    ]);

    const shortfall = spend(
      [finite, laterUnlimited, openUnlimited, soonerUnlimited],
      { creditCost: 3, allocations: existing }
    );
    expect(shortfall.allocations).toEqual([
      { reservationId: 50, creditGrantId: 3, amount: 3 },
    ]);
    expect(existing).toEqual([]);
    expect(grantBalance(finite, existing)).toBe(2);
    expect(finite.quantity).toBe(2);
  });

  it('does not allocate for a free or dollar class', () => {
    expect(spend([], { creditCost: 0 })).toEqual({ ok: true, allocations: [] });
  });
});

describe('releaseReservation', () => {
  it('returns the held amount to the same grant', () => {
    const pack = grant({ id: 1, quantity: 8, expiresAt: new Date(2026, 11, 1) });
    const allocations = [
      { reservationId: 9, creditGrantId: 1, amount: 1 },
      { reservationId: 10, creditGrantId: 1, amount: 2 },
    ];

    expect(grantBalance(pack, allocations)).toBe(5);
    const released = releaseReservation(allocations, 9);
    expect(released).toEqual([{ reservationId: 10, creditGrantId: 1, amount: 2 }]);
    expect(allocations).toHaveLength(2);
    expect(grantBalance(pack, released)).toBe(6);
  });

  it('puts a returned credit on a grant that is no longer spendable after it was ended', () => {
    const pack = grant({
      id: 1,
      quantity: 8,
      expiresAt: new Date(2026, 11, 1),
      originalExpiresAt: new Date(2026, 11, 1),
    });
    const now = new Date(2026, 8, 27, 15, 0, 0);
    const ended = endGrant(pack, now).grant;
    const held = [{ reservationId: 9, creditGrantId: 1, amount: 1 }];
    const released = releaseReservation(held, 9);

    expect(grantBalance(ended, released)).toBe(8);
    expect(allocateForReservation({
      grants: [ended],
      allocations: released,
      classStart: new Date(2026, 8, 29, 16, 0, 0),
      creditCost: 1,
      reservationId: 11,
    })).toEqual({ ok: false, reason: 'no_credits' });
  });
});

describe('summarizeCredits', () => {
  const now = new Date(2026, 8, 27, 12, 0, 0);

  it('sums remaining, counts upcoming reservations, and groups the soonest expiration', () => {
    const soon = grant({
      id: 1,
      quantity: 4,
      expiresAt: new Date(2026, 9, 1),
      originalExpiresAt: new Date(2026, 9, 1),
    });
    const later = grant({
      id: 2,
      quantity: 9,
      expiresAt: new Date(2026, 11, 1),
      originalExpiresAt: new Date(2026, 11, 1),
    });
    const allocations = [
      { reservationId: 1, creditGrantId: 2, amount: 1 },
      { reservationId: 2, creditGrantId: 2, amount: 2 },
      { reservationId: 3, creditGrantId: 2, amount: 1 },
      { reservationId: 4, creditGrantId: 2, amount: 1 },
    ];
    const summary = summarizeCredits({
      grants: [later, soon],
      allocations: allocations,
      classStartByReservationId: {
        1: new Date(2026, 8, 29),
        2: new Date(2026, 9, 2),
        3: new Date(2026, 9, 6),
        4: new Date(2026, 8, 20),
      },
      now: now,
    });

    expect(summary).toMatchObject({
      unlimited: false,
      remaining: 8,
      reserved: 3,
      expiringCount: 4,
      through: null,
    });
    expectLocalMidnight(summary.expiringOn, 2026, 8, 30);
    expect(formatCreditChip(summary)).toBe('8 remaining · 3 reserved · 4 expire Sep 30');
  });

  it('shows Unlimited from the soonest spendable unlimited grant and hides the finite count', () => {
    const finite = grant({ id: 1, quantity: 4, expiresAt: new Date(2026, 9, 1) });
    const sooner = grant({ id: 3, quantity: null, expiresAt: new Date(2026, 11, 1) });
    const later = grant({ id: 2, quantity: null, expiresAt: new Date(2027, 2, 1) });
    const summary = summarizeCredits({
      grants: [finite, later, sooner],
      allocations: [
        { reservationId: 1, creditGrantId: 3, amount: 1 },
        { reservationId: 2, creditGrantId: 3, amount: 1 },
        { reservationId: 3, creditGrantId: 3, amount: 1 },
      ],
      classStartByReservationId: {
        1: new Date(2026, 8, 29),
        2: new Date(2026, 9, 1),
        3: new Date(2026, 9, 2),
      },
      now: now,
    });

    expect(summary.unlimited).toBe(true);
    expect(summary.remaining).toBeNull();
    expect(summary.reserved).toBe(3);
    expectLocalMidnight(summary.through, 2026, 10, 30);
    expect(formatCreditChip(summary)).toBe('Unlimited · 3 reserved · through Nov 30');
  });

  it('omits the through date when unlimited has no expiration', () => {
    const summary = summarizeCredits({
      grants: [grant({ id: 1, quantity: null, expiresAt: null })],
      allocations: [{ reservationId: 1, creditGrantId: 1, amount: 1 }],
      classStartByReservationId: { 1: new Date(2026, 8, 29) },
      now: now,
    });
    expect(formatCreditChip(summary)).toBe('Unlimited · 1 reserved');
  });

  it('omits the expire clause when every remaining credit has no expiration', () => {
    const summary = summarizeCredits({
      grants: [grant({ id: 1, quantity: 8, expiresAt: null, originalExpiresAt: null })],
      allocations: [],
      classStartByReservationId: {},
      now: now,
    });
    expect(formatCreditChip(summary)).toBe('8 remaining · 0 reserved');
  });

  it('floors a negative finite total at zero and ignores a future start', () => {
    const summary = summarizeCredits({
      grants: [
        grant({ id: 1, quantity: 2, expiresAt: new Date(2026, 11, 1) }),
        grant({ id: 2, quantity: -5, expiresAt: new Date(2026, 11, 1) }),
        grant({ id: 3, quantity: 8, startsAt: new Date(2026, 11, 1), expiresAt: new Date(2027, 2, 1) }),
      ],
      allocations: [],
      classStartByReservationId: {},
      now: now,
    });
    expect(summary.remaining).toBe(0);
    expect(summary.expiringCount).toBeNull();
    expect(formatCreditChip(summary)).toBe('0 remaining · 0 reserved');
  });
});

describe('formatHistoryLine', () => {
  it('formats purchase, unlimited, staff add, staff remove, and an early end', () => {
    expect(formatHistoryLine(grant({
      quantity: 8,
      expiresAt: new Date(2026, 9, 1),
      originalExpiresAt: new Date(2026, 9, 1),
    }))).toBe('+8 · exp Sep 30');

    expect(formatHistoryLine(grant({
      quantity: null,
      expiresAt: new Date(2026, 11, 1),
      originalExpiresAt: new Date(2026, 11, 1),
    }))).toBe('Unlimited · through Nov 30');

    expect(formatHistoryLine(grant({
      quantity: 1,
      expiresAt: new Date(2026, 9, 1),
      originalExpiresAt: new Date(2026, 9, 1),
    }))).toBe('+1 · exp Sep 30');

    expect(formatHistoryLine(grant({
      quantity: -1,
      expiresAt: new Date(2026, 9, 1),
      originalExpiresAt: new Date(2026, 9, 1),
    }))).toBe('\u22121 · exp Sep 30');

    expect(formatHistoryLine(grant({
      quantity: null,
      expiresAt: new Date(2026, 8, 27, 15, 0, 0),
      originalExpiresAt: new Date(2026, 11, 1),
    }))).toBe('Unlimited · ended Sep 27');
  });

  it('shows the real last day of February, including leap day', () => {
    expect(formatHistoryLine(grant({
      quantity: null,
      expiresAt: new Date(2027, 2, 1),
      originalExpiresAt: new Date(2027, 2, 1),
    }))).toBe('Unlimited · through Feb 28');

    expect(formatHistoryLine(grant({
      quantity: null,
      expiresAt: new Date(2028, 2, 1),
      originalExpiresAt: new Date(2028, 2, 1),
    }))).toBe('Unlimited · through Feb 29');
  });
});
