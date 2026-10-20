'use strict';

const {
  expandClassOccurrences,
  assertValidClassSeries,
  isBlankOccurrence,
} = require('../lib/classSchedule');

const MIXED_SLOTS = [
  { weekday: 0, startTime: '11:30:00', endTime: '13:00:00' },
  { weekday: 2, startTime: '18:00:00', endTime: '20:00:00' },
  { weekday: 4, startTime: '19:00:00', endTime: '20:30:00' },
];

const CAMP_SLOTS = [
  { weekday: 1, startTime: '09:00:00', endTime: '12:00:00' },
  { weekday: 2, startTime: '09:30:00', endTime: '12:30:00' },
  { weekday: 3, startTime: '10:00:00', endTime: '13:00:00' },
  { weekday: 4, startTime: '10:30:00', endTime: '13:30:00' },
  { weekday: 5, startTime: '11:00:00', endTime: '14:00:00' },
];

function series(overrides) {
  return Object.assign({
    id: 4,
    title: 'Open Vault',
    description: null,
    location: 'DC Vault',
    startsOn: '2026-08-25',
    repeats: true,
    endsOn: null,
    startTime: null,
    endTime: null,
    visible: true,
    isReservable: true,
    capacity: 18,
    creditCost: 1,
    dollarCost: null,
    minAge: null,
    maxAge: null,
    reservationCutoffMinutes: 1440,
    cancellationCutoffMinutes: 1440,
    color: null,
    note: null,
    notifyCoachOnReserve: false,
    canceledAt: null,
    deletedAt: null,
    coachIds: [],
    trainingGroupIds: [],
  }, overrides);
}

function oneOff(overrides) {
  return series(Object.assign({
    repeats: false,
    startsOn: '2026-08-25',
    startTime: '16:00:00',
    endTime: '18:00:00',
  }, overrides));
}

function tuesdaySlot() {
  return [{ weekday: 2, startTime: '18:00:00', endTime: '20:00:00' }];
}

function occurrence(overrides) {
  return Object.assign({
    occursOn: '2026-08-25',
    rescheduledFrom: null,
    status: null,
    deletedAt: null,
    overrides: null,
    overrideCoaches: false,
    overrideGroups: false,
    coachIds: [],
    trainingGroupIds: [],
  }, overrides);
}

function expand(overrides) {
  return expandClassOccurrences(Object.assign({
    series: series(),
    slots: MIXED_SLOTS,
    occurrences: [],
    rangeStart: '2026-08-23',
    rangeEnd: '2026-08-27',
  }, overrides));
}

function datesOf(sessions) {
  return sessions.map((session) => session.occursOn);
}

describe('expandClassOccurrences', () => {
  it('returns a one-off only when its date is inside the window', () => {
    const inside = expand({
      series: oneOff(),
      slots: [],
      rangeStart: '2026-08-25',
      rangeEnd: '2026-08-25',
    });
    expect(inside).toHaveLength(1);
    expect(inside[0].occursOn).toBe('2026-08-25');
    expect(inside[0].startTime).toBe('16:00:00');
    expect(inside[0].endTime).toBe('18:00:00');
    expect(inside[0].seriesId).toBe(4);

    const outside = expand({
      series: oneOff(),
      slots: [],
      rangeStart: '2026-08-26',
      rangeEnd: '2026-08-27',
    });
    expect(outside).toEqual([]);
  });

  it('moves a one-off by changing startsOn and does not use rescheduledFrom', () => {
    const before = expand({
      series: oneOff({ startsOn: '2026-08-25' }),
      slots: [],
      rangeStart: '2026-08-20',
      rangeEnd: '2026-08-30',
    });
    const after = expand({
      series: oneOff({ startsOn: '2026-08-26' }),
      slots: [],
      rangeStart: '2026-08-20',
      rangeEnd: '2026-08-30',
    });

    expect(datesOf(before)).toEqual(['2026-08-25']);
    expect(datesOf(after)).toEqual(['2026-08-26']);
    expect(after[0].rescheduledFrom).toBeUndefined();
  });

  it('emits each camp day once, with that day\'s times, and stops at endsOn', () => {
    const sessions = expand({
      series: series({ startsOn: '2026-08-10', endsOn: '2026-08-14' }),
      slots: CAMP_SLOTS,
      rangeStart: '2026-08-03',
      rangeEnd: '2026-08-18',
    });

    expect(datesOf(sessions)).toEqual([
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
    ]);
    expect(sessions.map((session) => session.startTime)).toEqual([
      '09:00:00',
      '09:30:00',
      '10:00:00',
      '10:30:00',
      '11:00:00',
    ]);
  });

  it('starts a custom series on its first matching day and skips the previous weekday', () => {
    const sessions = expand({
      rangeStart: '2026-08-23',
      rangeEnd: '2026-08-27',
    });

    expect(datesOf(sessions)).toEqual(['2026-08-25', '2026-08-27']);
    expect(sessions[0].startTime).toBe('18:00:00');
    expect(sessions[1].startTime).toBe('19:00:00');
    expect(sessions[1].endTime).toBe('20:30:00');
  });

  it('includes endsOn and drops the next slot, unless endsOn is empty', () => {
    const bounded = expand({
      series: series({ endsOn: '2026-09-01' }),
      slots: tuesdaySlot(),
      rangeStart: '2026-08-25',
      rangeEnd: '2026-09-15',
    });
    expect(datesOf(bounded)).toEqual(['2026-08-25', '2026-09-01']);

    const open = expand({
      slots: tuesdaySlot(),
      rangeStart: '2026-08-25',
      rangeEnd: '2026-09-15',
    });
    expect(datesOf(open)).toEqual([
      '2026-08-25',
      '2026-09-01',
      '2026-09-08',
      '2026-09-15',
    ]);
  });

  it('marks a canceled series canceled, keeps an explicit active date, and omits a deleted date', () => {
    const sessions = expand({
      series: series({ canceledAt: '2026-08-01T00:00:00.000Z' }),
      slots: tuesdaySlot(),
      occurrences: [
        occurrence({ occursOn: '2026-09-01', status: 'active' }),
        occurrence({ occursOn: '2026-09-08', deletedAt: '2026-09-01T00:00:00.000Z' }),
      ],
      rangeStart: '2026-08-25',
      rangeEnd: '2026-09-08',
    });

    expect(sessions.map((session) => [session.occursOn, session.status])).toEqual([
      ['2026-08-25', 'canceled'],
      ['2026-09-01', 'active'],
    ]);
  });

  it('overrides title and time for one date and leaves the other dates on the template', () => {
    const sessions = expand({
      slots: tuesdaySlot(),
      occurrences: [
        occurrence({
          occursOn: '2026-08-25',
          overrides: { title: 'Open Vault - meet day', startTime: '17:00:00' },
        }),
      ],
      rangeStart: '2026-08-25',
      rangeEnd: '2026-09-01',
    });

    expect(sessions[0].title).toBe('Open Vault - meet day');
    expect(sessions[0].startTime).toBe('17:00:00');
    expect(sessions[0].endTime).toBe('20:00:00');
    expect(sessions[1].title).toBe('Open Vault');
    expect(sessions[1].startTime).toBe('18:00:00');
  });

  it('moves one Tuesday onto Wednesday and leaves the other Tuesdays in place', () => {
    const sessions = expand({
      occurrences: [
        occurrence({ occursOn: '2026-08-26', rescheduledFrom: '2026-08-25' }),
      ],
      rangeStart: '2026-08-23',
      rangeEnd: '2026-09-01',
    });

    expect(datesOf(sessions)).toEqual([
      '2026-08-26',
      '2026-08-27',
      '2026-08-30',
      '2026-09-01',
    ]);
    expect(sessions[0].title).toBe('Open Vault');
    expect(sessions[0].startTime).toBe('18:00:00');
    expect(sessions[0].endTime).toBe('20:00:00');
    expect(sessions[3].occursOn).toBe('2026-09-01');
    expect(sessions[3].startTime).toBe('18:00:00');
  });

  it('shows a Sunday moved to the previous Saturday when the series starts that Sunday', () => {
    const sessions = expand({
      series: series({ startsOn: '2026-08-30' }),
      slots: [{ weekday: 0, startTime: '11:30:00', endTime: '13:00:00' }],
      occurrences: [
        occurrence({ occursOn: '2026-08-29', rescheduledFrom: '2026-08-30' }),
      ],
      rangeStart: '2026-08-29',
      rangeEnd: '2026-09-06',
    });

    expect(datesOf(sessions)).toEqual(['2026-08-29', '2026-09-06']);
    expect(sessions[0].startTime).toBe('11:30:00');
    expect(sessions[1].occursOn).toBe('2026-09-06');
    expect(sessions[1].startTime).toBe('11:30:00');
  });

  it('shows a second move as one row on the newest date', () => {
    const sessions = expand({
      series: series({ startsOn: '2026-08-30' }),
      slots: [{ weekday: 0, startTime: '11:30:00', endTime: '13:00:00' }],
      occurrences: [
        occurrence({ occursOn: '2026-08-28', rescheduledFrom: '2026-08-30' }),
      ],
      rangeStart: '2026-08-28',
      rangeEnd: '2026-09-06',
    });

    expect(datesOf(sessions)).toEqual(['2026-08-28', '2026-09-06']);
    expect(datesOf(sessions)).not.toContain('2026-08-29');
    expect(datesOf(sessions)).not.toContain('2026-08-30');
  });

  it('treats a blank occurrence on a slot date as the template session', () => {
    const range = { rangeStart: '2026-08-25', rangeEnd: '2026-08-25', slots: tuesdaySlot() };
    const plain = expand(range);
    const blank = expand(Object.assign({}, range, {
      occurrences: [occurrence({ occursOn: '2026-08-25', overrides: {} })],
    }));
    expect(blank).toEqual(plain);
  });

  it('replaces coaches and groups only when the occurrence says to', () => {
    const sessions = expand({
      series: series({ coachIds: [1, 2], trainingGroupIds: [7] }),
      slots: tuesdaySlot(),
      occurrences: [
        occurrence({
          occursOn: '2026-08-25',
          overrideCoaches: true,
          coachIds: [3],
          overrideGroups: true,
          trainingGroupIds: [8],
        }),
        occurrence({
          occursOn: '2026-09-01',
          overrideCoaches: false,
          coachIds: [9],
          overrideGroups: false,
          trainingGroupIds: [9],
        }),
      ],
      rangeStart: '2026-08-25',
      rangeEnd: '2026-09-01',
    });

    expect(sessions[0].coachIds).toEqual([3]);
    expect(sessions[0].trainingGroupIds).toEqual([8]);
    expect(sessions[1].coachIds).toEqual([1, 2]);
    expect(sessions[1].trainingGroupIds).toEqual([7]);
  });

  it('returns nothing for a deleted series', () => {
    const sessions = expand({
      series: series({ deletedAt: '2026-08-01T00:00:00.000Z' }),
      rangeStart: '2026-08-23',
      rangeEnd: '2026-08-27',
    });
    expect(sessions).toEqual([]);
  });
});

describe('isBlankOccurrence', () => {
  it('is true only when the row adds nothing of its own', () => {
    expect(isBlankOccurrence(occurrence({ overrides: {} }))).toBe(true);
    expect(isBlankOccurrence(occurrence({ overrides: null }))).toBe(true);
    expect(isBlankOccurrence(occurrence({ rescheduledFrom: '2026-08-24' }))).toBe(false);
    expect(isBlankOccurrence(occurrence({ status: 'canceled' }))).toBe(false);
    expect(isBlankOccurrence(occurrence({ overrides: { title: 'Meet' } }))).toBe(false);
    expect(isBlankOccurrence(occurrence({ overrideCoaches: true }))).toBe(false);
    expect(isBlankOccurrence(occurrence({ overrideGroups: true }))).toBe(false);
  });
});

describe('assertValidClassSeries', () => {
  function validRepeating(overrides) {
    return Object.assign({
      series: series(),
      slots: MIXED_SLOTS,
      occurrences: [],
    }, overrides);
  }

  it('accepts a half-credit cost', () => {
    expect(() => assertValidClassSeries(validRepeating({
      series: series({ creditCost: 0.5 }),
    }))).not.toThrow();
  });

  it('rejects a session moved onto a weekday the series already uses', () => {
    expect(() => assertValidClassSeries(validRepeating({
      occurrences: [
        occurrence({ occursOn: '2026-08-27', rescheduledFrom: '2026-08-25' }),
      ],
    }))).toThrow(/weekday the series already uses/);
  });

  it('rejects two occurrences that share a destination or an origin date', () => {
    expect(() => assertValidClassSeries(validRepeating({
      occurrences: [
        occurrence({ occursOn: '2026-08-26', rescheduledFrom: '2026-08-25' }),
        occurrence({ occursOn: '2026-08-28', rescheduledFrom: '2026-08-25' }),
      ],
    }))).toThrow(/leave the same date/);

    expect(() => assertValidClassSeries(validRepeating({
      occurrences: [
        occurrence({ occursOn: '2026-08-26', rescheduledFrom: '2026-08-25' }),
        occurrence({ occursOn: '2026-08-26', overrides: { title: 'Other' } }),
      ],
    }))).toThrow(/share a date/);
  });

  it('rejects an end time that is not after the start', () => {
    expect(() => assertValidClassSeries(validRepeating({
      slots: [{ weekday: 2, startTime: '18:00:00', endTime: '18:00:00' }],
    }))).toThrow(/end time must be after start time/);
  });

  it('rejects an end date before the start date', () => {
    expect(() => assertValidClassSeries(validRepeating({
      series: series({ endsOn: '2026-08-24' }),
    }))).toThrow(/endsOn must be on or after startsOn/);
  });

  it('rejects two slots on the same weekday', () => {
    expect(() => assertValidClassSeries(validRepeating({
      slots: [
        { weekday: 2, startTime: '18:00:00', endTime: '19:00:00' },
        { weekday: 2, startTime: '19:00:00', endTime: '20:00:00' },
      ],
    }))).toThrow(/one slot per weekday/);
  });

  it('rejects a negative or three-decimal credit cost', () => {
    expect(() => assertValidClassSeries(validRepeating({
      series: series({ creditCost: -1 }),
    }))).toThrow(/creditCost/);
    expect(() => assertValidClassSeries(validRepeating({
      series: series({ creditCost: 1.234 }),
    }))).toThrow(/creditCost/);
  });

  it('rejects a repeating series with no slots', () => {
    expect(() => assertValidClassSeries(validRepeating({ slots: [] }))).toThrow(/at least one slot/);
  });

  it('rejects an unknown override key', () => {
    expect(() => assertValidClassSeries(validRepeating({
      occurrences: [
        occurrence({ overrides: { pole: '14' } }),
      ],
    }))).toThrow(/unknown override pole/);
  });
});
