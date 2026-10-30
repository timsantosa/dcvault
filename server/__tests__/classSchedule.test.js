'use strict';

const {
  expandClassOccurrences,
  assertValidClassSeries,
  isBlankOccurrence,
  prepareClassCreate,
  prepareClassUpdate,
  prepareClassCancel,
  prepareClassDelete,
  parseScheduleRange,
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

  it('rejects a fractional credit cost', () => {
    expect(() => assertValidClassSeries(validRepeating({
      series: series({ creditCost: 0.5 }),
    }))).toThrow(/creditCost/);
    expect(() => assertValidClassSeries(validRepeating({
      series: series({ creditCost: 1.5 }),
    }))).toThrow(/creditCost/);
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

  it('rejects a negative credit cost', () => {
    expect(() => assertValidClassSeries(validRepeating({
      series: series({ creditCost: -1 }),
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

const KNOWN = { knownCoachIds: [], knownTrainingGroupIds: [] };
const NOW = '2026-08-01T15:00:00.000Z';

function classInput(overrides) {
  return Object.assign({
    title: 'Open Vault',
    description: null,
    location: 'DC Vault',
    startsOn: '2026-08-25',
    repeats: true,
    endsOn: null,
    startTime: null,
    endTime: null,
    slots: tuesdaySlot(),
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
    coachIds: [],
    trainingGroupIds: [],
  }, overrides);
}

function seriesInput(overrides) {
  return classInput(Object.assign({ scope: 'series', notify: false }, overrides));
}

function occurrenceInput(overrides) {
  return classInput(Object.assign({
    scope: 'occurrence',
    notify: false,
    occursOn: '2026-08-25',
    startTime: '18:00:00',
    endTime: '20:00:00',
  }, overrides));
}

function oneOffInput(overrides) {
  return classInput(Object.assign({
    repeats: false,
    startTime: '16:00:00',
    endTime: '18:00:00',
    slots: [],
  }, overrides));
}

function repeatingCurrent(seriesOverrides, occurrences) {
  return {
    series: series(seriesOverrides),
    slots: tuesdaySlot(),
    occurrences: occurrences || [],
  };
}

function currentOf(prepared) {
  return {
    series: Object.assign({}, series(), prepared.value.series, {
      coachIds: prepared.value.coachIds,
      trainingGroupIds: prepared.value.trainingGroupIds,
    }),
    slots: prepared.value.slots,
    occurrences: prepared.value.occurrences,
  };
}

function expandPrepared(prepared, rangeEnd) {
  return expandClassOccurrences({
    series: Object.assign({ id: 4 }, prepared.value.series, {
      coachIds: prepared.value.coachIds,
      trainingGroupIds: prepared.value.trainingGroupIds,
    }),
    slots: prepared.value.slots,
    occurrences: prepared.value.occurrences,
    rangeStart: '2026-08-25',
    rangeEnd: rangeEnd || '2026-09-01',
  });
}

describe('prepareClassCreate', () => {
  it('accepts a repeating series and a one-off', () => {
    const repeating = prepareClassCreate(classInput({
      creditCost: 2,
      slots: MIXED_SLOTS,
      endsOn: '2026-08-30',
    }), KNOWN);
    expect(repeating.ok).toBe(true);
    expect(repeating.value.series.repeats).toBe(true);
    expect(repeating.value.series.creditCost).toBe(2);
    expect(repeating.value.series.endsOn).toBe('2026-08-30');
    expect(repeating.value.slots.map((slot) => slot.weekday)).toEqual([0, 2, 4]);
    expect(repeating.value.occurrences).toEqual([]);
    expect(repeating.value.notifyRequested).toBeUndefined();

    const single = prepareClassCreate(oneOffInput(), KNOWN);
    expect(single.ok).toBe(true);
    expect(single.value.series.repeats).toBe(false);
    expect(single.value.series.startsOn).toBe('2026-08-25');
    expect(single.value.series.startTime).toBe('16:00:00');
    expect(single.value.slots).toEqual([]);
  });

  it('rejects a missing title, an unknown coach, and a duplicate coach', () => {
    expect(prepareClassCreate(classInput({ title: '  ' }), KNOWN).message).toBe('title is required');
    expect(prepareClassCreate(classInput({ creditCost: -1 }), KNOWN).message).toMatch(/creditCost/);
    expect(prepareClassCreate(classInput({ coachIds: [4] }), {
      knownCoachIds: [1],
      knownTrainingGroupIds: [],
    }).message).toBe('Unknown coach.');
    expect(prepareClassCreate(classInput({ coachIds: [1, 1] }), {
      knownCoachIds: [1],
      knownTrainingGroupIds: [],
    }).message).toBe('Duplicate coach.');
  });
});

describe('prepareClassUpdate', () => {
  it('clears only the overrides for fields the series edit changed', () => {
    const prepared = prepareClassUpdate(repeatingCurrent(null, [
      occurrence({
        occursOn: '2026-08-25',
        overrides: { title: 'Special', capacity: 10 },
      }),
    ]), seriesInput({ title: 'Vault Night', notify: true }), KNOWN);

    expect(prepared.ok).toBe(true);
    expect(prepared.value.notifyRequested).toBe(true);
    expect(prepared.value.series.title).toBe('Vault Night');
    expect(prepared.value.occurrences).toEqual([
      occurrence({
        occursOn: '2026-08-25',
        overrides: { capacity: 10 },
      }),
    ]);
    expect(expandPrepared(prepared).every((session) => session.title === 'Vault Night')).toBe(true);
  });

  it('drops a date whose only difference was a field the series edit changed', () => {
    const prepared = prepareClassUpdate(repeatingCurrent(null, [
      occurrence({ occursOn: '2026-08-25', overrides: { title: 'Special' } }),
    ]), seriesInput({ title: 'Vault Night' }), KNOWN);

    expect(prepared.ok).toBe(true);
    expect(prepared.value.occurrences).toEqual([]);
  });

  it('keeps a moved date and a time override when the slots stay', () => {
    const prepared = prepareClassUpdate(repeatingCurrent(null, [
      occurrence({
        occursOn: '2026-08-26',
        rescheduledFrom: '2026-08-25',
        overrides: { startTime: '17:00:00', endTime: '19:00:00' },
      }),
    ]), seriesInput({ title: 'Vault Night' }), KNOWN);

    expect(prepared.ok).toBe(true);
    expect(prepared.value.occurrences[0].occursOn).toBe('2026-08-26');
    expect(prepared.value.occurrences[0].rescheduledFrom).toBe('2026-08-25');
    expect(prepared.value.occurrences[0].overrides).toEqual({
      startTime: '17:00:00',
      endTime: '19:00:00',
    });
  });

  it('clears per-date times when the slots change, and keeps an unchanged note', () => {
    const prepared = prepareClassUpdate(repeatingCurrent(null, [
      occurrence({
        occursOn: '2026-08-25',
        overrides: { startTime: '17:00:00', endTime: '19:00:00', note: 'Bring poles' },
      }),
    ]), seriesInput({
      slots: [{ weekday: 2, startTime: '18:30:00', endTime: '20:30:00' }],
    }), KNOWN);

    expect(prepared.ok).toBe(true);
    expect(prepared.value.occurrences[0].overrides).toEqual({ note: 'Bring poles' });
    expect(prepared.value.slots[0].startTime).toBe('18:30:00');
  });

  it('clears per-date coaches and groups when those lists change', () => {
    const prepared = prepareClassUpdate(repeatingCurrent({
      coachIds: [1],
      trainingGroupIds: [7],
    }, [
      occurrence({
        occursOn: '2026-08-25',
        overrideCoaches: true,
        coachIds: [2],
        overrideGroups: true,
        trainingGroupIds: [9],
        overrides: { note: 'Keep' },
      }),
    ]), seriesInput({
      coachIds: [3, 1],
      trainingGroupIds: [8],
    }), {
      knownCoachIds: [1, 3],
      knownTrainingGroupIds: [8],
    });

    expect(prepared.ok).toBe(true);
    expect(prepared.value.coachIds).toEqual([1, 3]);
    expect(prepared.value.trainingGroupIds).toEqual([8]);
    expect(prepared.value.occurrences[0].overrideCoaches).toBe(false);
    expect(prepared.value.occurrences[0].overrideGroups).toBe(false);
    expect(prepared.value.occurrences[0].coachIds).toEqual([]);
    expect(prepared.value.occurrences[0].overrides).toEqual({ note: 'Keep' });
  });

  it('stores only the fields that differ on one date', () => {
    const prepared = prepareClassUpdate(
      repeatingCurrent(),
      occurrenceInput({ title: 'Meet day', notify: false }),
      KNOWN
    );

    expect(prepared.ok).toBe(true);
    expect(prepared.value.occurrences).toHaveLength(1);
    expect(prepared.value.occurrences[0].occursOn).toBe('2026-08-25');
    expect(prepared.value.occurrences[0].overrides).toEqual({ title: 'Meet day' });
    expect(prepared.value.occurrences[0].rescheduledFrom).toBeNull();
    const sessions = expandPrepared(prepared);
    expect(sessions[0].title).toBe('Meet day');
    expect(sessions[1].title).toBe('Open Vault');
    expect(sessions[1].occursOn).toBe('2026-09-01');
  });

  it('rejects a move onto a date that already has a session', () => {
    const prepared = prepareClassUpdate(repeatingCurrent(null, [
      occurrence({ occursOn: '2026-08-26', rescheduledFrom: '2026-08-25' }),
    ]), occurrenceInput({
      occursOn: '2026-09-01',
      moveTo: '2026-08-26',
    }), KNOWN);

    expect(prepared.ok).toBe(false);
    expect(prepared.message).toMatch(/share a date/);
  });

  it('rejects turning off repeat while a per-date change still exists', () => {
    const blocked = prepareClassUpdate(repeatingCurrent(null, [
      occurrence({ occursOn: '2026-08-25', overrides: { title: 'Special' } }),
    ]), seriesInput({
      repeats: false,
      startTime: '16:00:00',
      endTime: '18:00:00',
      slots: [],
    }), KNOWN);
    expect(blocked.ok).toBe(false);
    expect(blocked.message).toBe('a one-off series cannot keep per-date changes');

    const cleared = prepareClassUpdate(repeatingCurrent(), seriesInput({
      repeats: false,
      startTime: '16:00:00',
      endTime: '18:00:00',
      slots: [],
    }), KNOWN);
    expect(cleared.ok).toBe(true);
    expect(cleared.value.series.repeats).toBe(false);
    expect(cleared.value.occurrences).toEqual([]);
    expect(cleared.value.series.startTime).toBe('16:00:00');
  });

  it('moves one date, and a second move keeps the original slot date', () => {
    const first = prepareClassUpdate(
      repeatingCurrent(),
      occurrenceInput({ moveTo: '2026-08-26' }),
      KNOWN
    );
    expect(first.ok).toBe(true);
    expect(first.value.occurrences[0].occursOn).toBe('2026-08-26');
    expect(first.value.occurrences[0].rescheduledFrom).toBe('2026-08-25');

    const second = prepareClassUpdate(
      currentOf(first),
      occurrenceInput({ occursOn: '2026-08-26', moveTo: '2026-08-28' }),
      KNOWN
    );
    expect(second.ok).toBe(true);
    expect(second.value.occurrences[0].occursOn).toBe('2026-08-28');
    expect(second.value.occurrences[0].rescheduledFrom).toBe('2026-08-25');
    expect(datesOf(expandPrepared(second, '2026-09-01'))).toEqual([
      '2026-08-28',
      '2026-09-01',
    ]);
  });

  it('moves a one-off by changing startsOn for either scope', () => {
    const current = { series: oneOff(), slots: [], occurrences: [] };
    const bySeries = prepareClassUpdate(current, oneOffInput({
      scope: 'series',
      notify: false,
      startsOn: '2026-08-26',
    }), KNOWN);
    expect(bySeries.ok).toBe(true);
    expect(bySeries.value.series.startsOn).toBe('2026-08-26');
    expect(bySeries.value.occurrences).toEqual([]);

    const byDate = prepareClassUpdate(current, oneOffInput({
      scope: 'occurrence',
      notify: true,
      occursOn: '2026-08-25',
      moveTo: '2026-08-27',
    }), KNOWN);
    expect(byDate.ok).toBe(true);
    expect(byDate.value.series.startsOn).toBe('2026-08-27');
    expect(byDate.value.notifyRequested).toBe(true);
    expect(byDate.value.slots).toEqual([]);

    const missing = prepareClassUpdate(current, oneOffInput({
      scope: 'occurrence',
      notify: false,
      occursOn: '2026-08-26',
    }), KNOWN);
    expect(missing.ok).toBe(false);
    expect(missing.message).toBe('That date is not on this series.');
  });

  it('requires notify on an edit', () => {
    const prepared = prepareClassUpdate(repeatingCurrent(), seriesInput({ notify: undefined }), KNOWN);
    expect(prepared.ok).toBe(false);
    expect(prepared.message).toBe('notify must be true or false');
  });
});

describe('prepareClassCancel', () => {
  it('cancels one date, then the series, and keeps that date canceled after restore', () => {
    let current = repeatingCurrent();
    let step = prepareClassCancel(current, {
      scope: 'occurrence',
      occursOn: '2026-08-25',
      notify: false,
      canceled: true,
    }, NOW);
    expect(step.ok).toBe(true);
    expect(step.value.series.canceledAt).toBeNull();
    expect(step.value.occurrences[0].status).toBe('canceled');

    current = currentOf(step);
    step = prepareClassCancel(current, {
      scope: 'series',
      notify: false,
      canceled: true,
    }, NOW);
    expect(step.value.series.canceledAt).toBe(NOW);
    expect(step.value.occurrences[0].status).toBe('canceled');

    current = currentOf(step);
    step = prepareClassCancel(current, {
      scope: 'series',
      notify: true,
      canceled: false,
    }, NOW);
    expect(step.value.notifyRequested).toBe(true);
    expect(step.value.series.canceledAt).toBeNull();
    expect(step.value.occurrences[0].occursOn).toBe('2026-08-25');
    expect(step.value.occurrences[0].status).toBe('canceled');
  });

  it('leaves an explicit active date active when the series is canceled', () => {
    const prepared = prepareClassCancel(repeatingCurrent(null, [
      occurrence({ occursOn: '2026-09-01', status: 'active' }),
    ]), {
      scope: 'series',
      notify: false,
      canceled: true,
    }, NOW);

    expect(prepared.ok).toBe(true);
    const sessions = expandPrepared(prepared, '2026-09-08');
    expect(sessions.map((session) => [session.occursOn, session.status])).toEqual([
      ['2026-08-25', 'canceled'],
      ['2026-09-01', 'active'],
      ['2026-09-08', 'canceled'],
    ]);
  });

  it('marks one date active again when the series itself is canceled', () => {
    const prepared = prepareClassCancel(repeatingCurrent({
      canceledAt: '2026-08-01T00:00:00.000Z',
    }), {
      scope: 'occurrence',
      occursOn: '2026-08-25',
      notify: false,
      canceled: false,
    }, NOW);

    expect(prepared.ok).toBe(true);
    expect(prepared.value.series.canceledAt).toBe('2026-08-01T00:00:00.000Z');
    expect(prepared.value.occurrences[0].status).toBe('active');
  });

  it('drops a one-date cancel on an active series when that date is restored', () => {
    const canceled = prepareClassCancel(repeatingCurrent(), {
      scope: 'occurrence',
      occursOn: '2026-08-25',
      notify: false,
      canceled: true,
    }, NOW);
    const restored = prepareClassCancel(currentOf(canceled), {
      scope: 'occurrence',
      occursOn: '2026-08-25',
      notify: false,
      canceled: false,
    }, NOW);

    expect(restored.ok).toBe(true);
    expect(restored.value.occurrences).toEqual([]);
  });

  it('cancels a one-off on the series row', () => {
    const current = { series: oneOff(), slots: [], occurrences: [] };
    const prepared = prepareClassCancel(current, {
      scope: 'occurrence',
      occursOn: '2026-08-25',
      notify: false,
      canceled: true,
    }, NOW);

    expect(prepared.ok).toBe(true);
    expect(prepared.value.series.canceledAt).toBe(NOW);
    expect(prepared.value.occurrences).toEqual([]);
  });
});

describe('prepareClassDelete', () => {
  it('removes one date, and removes the whole series', () => {
    const oneDate = prepareClassDelete(repeatingCurrent(), {
      scope: 'occurrence',
      occursOn: '2026-08-25',
      notify: false,
    }, NOW);
    expect(oneDate.ok).toBe(true);
    expect(oneDate.value.series.deletedAt).toBeNull();
    expect(oneDate.value.occurrences[0].deletedAt).toBe(NOW);
    expect(datesOf(expandPrepared(oneDate))).toEqual(['2026-09-01']);

    const entire = prepareClassDelete(repeatingCurrent(), {
      scope: 'series',
      notify: true,
    }, NOW);
    expect(entire.ok).toBe(true);
    expect(entire.value.notifyRequested).toBe(true);
    expect(entire.value.series.deletedAt).toBe(NOW);
    expect(expandPrepared(entire)).toEqual([]);
  });

  it('keeps a moved date\'s row so the original weekday stays off the calendar', () => {
    const prepared = prepareClassDelete(repeatingCurrent(null, [
      occurrence({ occursOn: '2026-08-26', rescheduledFrom: '2026-08-25' }),
    ]), {
      scope: 'occurrence',
      occursOn: '2026-08-26',
      notify: false,
    }, NOW);

    expect(prepared.ok).toBe(true);
    expect(prepared.value.occurrences[0].rescheduledFrom).toBe('2026-08-25');
    expect(prepared.value.occurrences[0].deletedAt).toBe(NOW);
    expect(datesOf(expandPrepared(prepared))).toEqual(['2026-09-01']);
  });

  it('requires notify', () => {
    const prepared = prepareClassDelete(repeatingCurrent(), {
      scope: 'series',
      notify: 'yes',
    }, NOW);
    expect(prepared.ok).toBe(false);
    expect(prepared.message).toBe('notify must be true or false');
  });
});

describe('parseScheduleRange', () => {
  it('accepts 92 days and rejects a longer window', () => {
    expect(parseScheduleRange('2026-08-01', '2026-11-01')).toEqual({
      ok: true,
      value: { from: '2026-08-01', to: '2026-11-01' },
    });
    const tooLong = parseScheduleRange('2026-08-01', '2026-11-02');
    expect(tooLong.ok).toBe(false);
    expect(tooLong.message).toBe('date window must be 92 days or less');
    expect(parseScheduleRange('2026-08-02', '2026-08-01').message).toBe('from must be on or before to');
  });
});
