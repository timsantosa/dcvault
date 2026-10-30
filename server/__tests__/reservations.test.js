'use strict';

const {
  decideReserve,
  decideMemberCancel,
  reservationEffects,
  reallocatePaused,
} = require('../lib/reservations');

const START = new Date('2026-08-25T22:00:00.000Z');
const DAY_BEFORE = new Date('2026-08-24T21:00:00.000Z');
const HOUR_BEFORE = new Date('2026-08-25T21:00:00.000Z');

function session(overrides) {
  return Object.assign({
    visible: true,
    isReservable: true,
    status: 'active',
    capacity: 18,
    creditCost: 1,
    dollarCost: null,
    reservationCutoffMinutes: 1440,
    cancellationCutoffMinutes: 1440,
  }, overrides);
}

function openReserve(overrides) {
  return decideReserve(Object.assign({
    now: DAY_BEFORE,
    classStart: START,
    session: session(),
    spotsTaken: 6,
    alreadyReserved: false,
    note: null,
  }, overrides));
}

function series(overrides) {
  return Object.assign({
    id: 4,
    title: 'Open Vault',
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
    reservationCutoffMinutes: 1440,
    cancellationCutoffMinutes: 1440,
    canceledAt: null,
    deletedAt: null,
  }, overrides);
}

function graph(seriesRow, slots, occurrences) {
  return {
    series: seriesRow,
    slots: slots || [{ weekday: 2, startTime: '18:00:00', endTime: '20:00:00' }],
    occurrences: occurrences || [],
  };
}

function oneOff(overrides) {
  return series(Object.assign({
    repeats: false,
    startsOn: '2026-08-25',
    startTime: '16:00:00',
    endTime: '18:00:00',
  }, overrides));
}

describe('decideReserve', () => {
  it('accepts an open class and stores a dollar class as external without a credit hold decision', () => {
    const reserved = openReserve({ note: '  14\'7" 180  ' });
    expect(reserved).toEqual({
      ok: true,
      note: '14\'7" 180',
      creditCost: 1,
      paymentStatus: null,
    });

    const lesson = openReserve({
      session: session({ creditCost: 0, dollarCost: 40 }),
    });
    expect(lesson.ok).toBe(true);
    expect(lesson.creditCost).toBe(0);
    expect(lesson.paymentStatus).toBe('external');

    const both = openReserve({
      session: session({ creditCost: 1, dollarCost: 10 }),
    });
    expect(both.creditCost).toBe(1);
    expect(both.paymentStatus).toBe('external');
  });

  it('rejects a hidden, canceled, view-only, duplicate, late, or full class', () => {
    expect(openReserve({ session: session({ visible: false }) }).status).toBe(404);
    expect(openReserve({ session: session({ status: 'canceled' }) }).message).toBe('Canceled');
    expect(openReserve({ session: session({ isReservable: false }) }).message).toBe('View only');
    expect(openReserve({ alreadyReserved: true }).message).toBe('Already reserved.');
    expect(openReserve({ now: HOUR_BEFORE }).message).toBe('Reservations closed 24 hours before start');
    expect(openReserve({ spotsTaken: 18 }).message).toBe('Class is full');
    expect(openReserve({ note: 'x'.repeat(501) }).status).toBe(400);
  });

  it('still says already reserved when the class is also full', () => {
    expect(openReserve({ alreadyReserved: true, spotsTaken: 18 }).message).toBe('Already reserved.');
  });
});

describe('decideMemberCancel', () => {
  it('allows a cancel before the cutoff and rejects one after it', () => {
    expect(decideMemberCancel({
      now: DAY_BEFORE,
      classStart: START,
      cancellationCutoffMinutes: 1440,
      reservation: { id: 1 },
    })).toEqual({ ok: true });

    const late = decideMemberCancel({
      now: HOUR_BEFORE,
      classStart: START,
      cancellationCutoffMinutes: 1440,
      reservation: { id: 1 },
    });
    expect(late.ok).toBe(false);
    expect(late.status).toBe(409);
    expect(late.message).toBe('Cancellation closed 24 hours before start');
  });

  it('uses the same cutoff when the hold is already paused', () => {
    const late = decideMemberCancel({
      now: HOUR_BEFORE,
      classStart: START,
      cancellationCutoffMinutes: 1440,
      reservation: { id: 1 },
    });
    expect(late.ok).toBe(false);
  });
});

describe('reservationEffects', () => {
  const before = graph(series());

  it('follows one moved date and a one-off startsOn change', () => {
    const moved = reservationEffects(before, graph(series(), null, [{
      occursOn: '2026-08-26',
      rescheduledFrom: '2026-08-25',
      status: null,
      deletedAt: null,
    }]), ['2026-08-25']);
    expect(moved.moves).toEqual([{ from: '2026-08-25', to: '2026-08-26' }]);
    expect(moved.removals).toEqual([]);

    const oneOffBefore = graph(oneOff(), []);
    const oneOffAfter = graph(oneOff({ startsOn: '2026-08-26' }), []);
    const shifted = reservationEffects(oneOffBefore, oneOffAfter, ['2026-08-25']);
    expect(shifted.moves).toEqual([{ from: '2026-08-25', to: '2026-08-26' }]);
  });

  it('pauses on cancel and resumes on restore', () => {
    const canceled = reservationEffects(
      before,
      graph(series({ canceledAt: '2026-08-20T12:00:00.000Z' })),
      ['2026-08-25']
    );
    expect(canceled.pauses).toEqual(['2026-08-25']);
    expect(canceled.moves).toEqual([]);

    const restored = reservationEffects(
      graph(series({ canceledAt: '2026-08-20T12:00:00.000Z' })),
      before,
      ['2026-08-25']
    );
    expect(restored.resumes).toEqual(['2026-08-25']);
  });

  it('removes a deleted date and does not pair a slot change with the new weekday', () => {
    const deleted = reservationEffects(before, graph(series(), null, [{
      occursOn: '2026-08-25',
      rescheduledFrom: null,
      status: null,
      deletedAt: '2026-08-20T12:00:00.000Z',
    }]), ['2026-08-25']);
    expect(deleted.removals).toEqual(['2026-08-25']);

    const wednesday = graph(series(), [{ weekday: 3, startTime: '18:00:00', endTime: '20:00:00' }]);
    const rewritten = reservationEffects(before, wednesday, ['2026-08-25']);
    expect(rewritten.removals).toEqual(['2026-08-25']);
    expect(rewritten.moves).toEqual([]);
  });

  it('removes every reservation when the series is deleted', () => {
    const effects = reservationEffects(
      before,
      graph(series({ deletedAt: '2026-08-20T12:00:00.000Z' })),
      ['2026-08-25', '2026-09-01']
    );
    expect(effects.removals).toEqual(['2026-08-25', '2026-09-01']);
    expect(effects.moves).toEqual([]);
  });
});

describe('reallocatePaused', () => {
  const classStart = new Date('2026-08-25T22:00:00.000Z');

  function grant(id, athleteId, quantity) {
    return {
      id: id,
      athleteId: athleteId,
      quantity: quantity,
      startsAt: null,
      expiresAt: new Date('2026-12-01T04:00:00.000Z'),
    };
  }

  it('rebuilds every paused hold or returns no rows when anyone is short', () => {
    const ready = reallocatePaused({
      reservations: [
        { id: 1, athleteId: 10, classStart: classStart, creditCost: 1 },
        { id: 2, athleteId: 11, classStart: classStart, creditCost: 2 },
      ],
      grants: [grant(5, 10, 2), grant(6, 11, 2)],
      holdingAllocations: [],
    });
    expect(ready.ok).toBe(true);
    expect(ready.allocations).toEqual([
      { reservationId: 1, creditGrantId: 5, amount: 1 },
      { reservationId: 2, creditGrantId: 6, amount: 2 },
    ]);

    const short = reallocatePaused({
      reservations: [
        { id: 1, athleteId: 10, classStart: classStart, creditCost: 1 },
        { id: 2, athleteId: 11, classStart: classStart, creditCost: 1 },
      ],
      grants: [grant(5, 10, 2), grant(6, 11, 0)],
      holdingAllocations: [],
    });
    expect(short).toEqual({ ok: false });
  });
});
