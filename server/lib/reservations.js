'use strict';

// Reservation rules. Callers load rows and write them. Dates on a class are
// YYYY-MM-DD. classStart and now are Date instants.

const { expandClassOccurrences } = require('./classSchedule');
const { day } = require('./dates');
const { allocateForReservation } = require('./creditInventory');

const NOTE_LIMIT = 500;

// Whether this member may take the spot. Input: session (the expanded class on
// that date), alreadyReserved, spotsTaken, note, and Date instants now and
// classStart. Returns { ok:false, status, message } or { ok:true, note,
// creditCost, paymentStatus }. The caller locks rows and writes them.
// Hidden classes are a 404 so they match a missing class. Already reserved is
// checked before the full-class check. creditCost is a whole number; 0 means
// the signup has no credit hold. paymentStatus is 'external' when the class
// also has a dollar price, because this path does not charge it.
function decideReserve(input) {
  const session = input.session;
  if (isOff(session.visible)) {
    return reject(404, 'Class not found.');
  }
  if (session.status === 'canceled') {
    return reject(409, 'Canceled');
  }
  if (isOff(session.isReservable)) {
    return reject(409, 'View only');
  }
  if (input.alreadyReserved) {
    return reject(409, 'Already reserved.');
  }
  const cutoffMinutes = Number(session.reservationCutoffMinutes);
  if (input.now.getTime() >= input.classStart.getTime() - cutoffMinutes * 60 * 1000) {
    return reject(409, closedMessage('Reservations closed', cutoffMinutes));
  }
  if (Number(input.spotsTaken) >= Number(session.capacity)) {
    return reject(409, 'Class is full');
  }
  const note = readNote(input.note);
  if (!note.ok) {
    return note;
  }
  const dollarCost = session.dollarCost == null || session.dollarCost === ''
    ? 0
    : Number(session.dollarCost);
  return {
    ok: true,
    note: note.value,
    creditCost: wholeCost(session.creditCost),
    paymentStatus: dollarCost > 0 ? 'external' : null,
  };
}

// Whether the member may cancel. Input: reservation (null when they have
// none), cancellationCutoffMinutes, and Date instants now and classStart.
// Returns { ok:true } or { ok:false, status, message }. After the cutoff the
// reservation stays and the credit stays spent; the caller deletes both only
// when this returns ok. The same cutoff applies while a class-cancel hold is
// paused.
function decideMemberCancel(input) {
  if (!input.reservation) {
    return reject(404, 'Reservation not found.');
  }
  const cutoffMinutes = Number(input.cancellationCutoffMinutes);
  if (input.now.getTime() >= input.classStart.getTime() - cutoffMinutes * 60 * 1000) {
    return reject(409, closedMessage('Cancellation closed', cutoffMinutes));
  }
  return { ok: true };
}

// What a class save does to existing signups. before and after are class
// graphs (series, slots, occurrences). reservationDates are the YYYY-MM-DD
// dates members are signed up for. Returns { moves, removals, pauses, resumes }.
// moves are { from, to }. The other lists are dates.
// Reservations point at a series and a date, not a classOccurrences row,
// because those rows are deleted and recreated on every save. A repeating
// date moves only when an occurrence carries rescheduledFrom. A one-off moves
// only when startsOn changes. Dropping a weekday is a removal, not a guessed
// move. Deleting the series, or a date that no longer exists, is a removal
// (the caller returns the credit and deletes the signup). Becoming canceled
// pauses the hold on the date the class lands on. Leaving canceled resumes it.
function reservationEffects(before, after, reservationDates) {
  const dates = uniqueDates(reservationDates);
  const empty = { moves: [], removals: [], pauses: [], resumes: [] };
  if (!dates.length) {
    return empty;
  }
  if (after.series.deletedAt != null) {
    return { moves: [], removals: dates, pauses: [], resumes: [] };
  }

  const range = effectRange(before, after, dates);
  const beforeByDate = indexByDate(expanded(before, range));
  const afterByOrigin = {};
  expanded(after, range).forEach((session) => {
    afterByOrigin[originOf(after, session.occursOn)] = session;
  });

  const oneOffFrom = before.series.repeats ? null : day(before.series.startsOn);
  const oneOffTo = after.series.repeats ? null : day(after.series.startsOn);
  const oneOffMove = oneOffFrom && oneOffTo && oneOffFrom !== oneOffTo && before.series.deletedAt == null;

  const moves = [];
  const removals = [];
  const pauses = [];
  const resumes = [];

  dates.forEach((date) => {
    let fromSession;
    let toSession;
    let target;
    if (oneOffMove && date === oneOffFrom) {
      fromSession = beforeByDate[date];
      toSession = afterByOrigin[oneOffTo];
      target = oneOffTo;
      if (!toSession) {
        removals.push(date);
        return;
      }
      moves.push({ from: date, to: target });
    } else {
      fromSession = beforeByDate[date];
      if (!fromSession) {
        removals.push(date);
        return;
      }
      toSession = afterByOrigin[originOf(before, date)];
      if (!toSession) {
        removals.push(date);
        return;
      }
      target = toSession.occursOn;
      if (target !== date) {
        moves.push({ from: date, to: target });
      }
    }
    if (fromSession && fromSession.status !== 'canceled' && toSession.status === 'canceled') {
      pauses.push(target);
    }
    if (fromSession && fromSession.status === 'canceled' && toSession.status !== 'canceled') {
      resumes.push(target);
    }
  });

  return {
    moves: uniqueMoves(moves),
    removals: uniqueDates(removals),
    pauses: uniqueDates(pauses),
    resumes: uniqueDates(resumes),
  };
}

// Rebuild credit holds when a canceled class is restored. Input reservations
// are { id, athleteId, classStart, creditCost } for signups whose hold was
// paused. creditCost is the stored amount, not the class price now. grants
// are the athletes' current packages. holdingAllocations are holds already
// counting against those grants, excluding the paused rows being replaced.
// Returns { ok:true, allocations } or { ok:false } with no allocations key.
// One athlete who cannot cover fails the whole restore, so the caller rolls
// the save back. New holds are added to the in-memory list as each athlete is
// processed, oldest reservation id first, so two signups cannot spend the
// same remaining credit. A cost of 0 produces no allocation rows.
function reallocatePaused(input) {
  const created = [];
  const holding = (input.holdingAllocations || []).slice();
  const reservations = (input.reservations || []).slice().sort((a, b) => a.id - b.id);
  for (let i = 0; i < reservations.length; i += 1) {
    const reservation = reservations[i];
    const grants = (input.grants || []).filter((grant) => grant.athleteId === reservation.athleteId);
    const grantIds = {};
    grants.forEach((grant) => {
      grantIds[grant.id] = true;
    });
    const relevant = holding.filter((allocation) => grantIds[allocation.creditGrantId]);
    const result = allocateForReservation({
      grants: grants,
      allocations: relevant,
      classStart: reservation.classStart,
      creditCost: reservation.creditCost,
      reservationId: reservation.id,
    });
    if (!result.ok) {
      return { ok: false };
    }
    result.allocations.forEach((allocation) => {
      created.push(allocation);
      holding.push(allocation);
    });
  }
  return { ok: true, allocations: created };
}

// The expanded session on one YYYY-MM-DD, or null when that date is not on
// the class. Used to load the date a member is reserving, and to confirm a
// restored date still exists before charging it again.
function sessionOnDate(graph, occursOn) {
  const sessions = expandClassOccurrences({
    series: graph.series,
    slots: graph.slots || [],
    occurrences: graph.occurrences || [],
    rangeStart: occursOn,
    rangeEnd: occursOn,
  });
  for (let i = 0; i < sessions.length; i += 1) {
    if (sessions[i].occursOn === occursOn) {
      return sessions[i];
    }
  }
  return null;
}

function expanded(graph, range) {
  if (graph.series.deletedAt != null) {
    return [];
  }
  return expandClassOccurrences({
    series: graph.series,
    slots: graph.slots || [],
    occurrences: graph.occurrences || [],
    rangeStart: range.from,
    rangeEnd: range.to,
  });
}

// Window passed to the occurrence expander. Includes reservation dates, a
// one-off's startsOn, and each occurrence's occursOn and rescheduledFrom.
// A repeating series' startsOn is left out so an old series start does not
// pull every week into the comparison.
function effectRange(before, after, dates) {
  const all = dates.slice();
  [before, after].forEach((graph) => {
    if (!graph.series.repeats) {
      all.push(day(graph.series.startsOn));
    }
    (graph.occurrences || []).forEach((occurrence) => {
      all.push(day(occurrence.occursOn));
      if (occurrence.rescheduledFrom != null) {
        all.push(day(occurrence.rescheduledFrom));
      }
    });
  });
  const sorted = uniqueDates(all);
  return { from: sorted[0], to: sorted[sorted.length - 1] };
}

function indexByDate(sessions) {
  const indexed = {};
  sessions.forEach((session) => {
    indexed[session.occursOn] = session;
  });
  return indexed;
}

// The date a session came from. A moved occurrence is stored on its new
// occursOn and points back with rescheduledFrom, so a signup on the old date
// can follow the class. Deleted occurrences are ignored. An unmoved date is
// its own origin.
function originOf(graph, occursOn) {
  const occurrences = graph.occurrences || [];
  for (let i = 0; i < occurrences.length; i += 1) {
    const occurrence = occurrences[i];
    if (occurrence.deletedAt != null || occurrence.rescheduledFrom == null) {
      continue;
    }
    if (day(occurrence.occursOn) === occursOn) {
      return day(occurrence.rescheduledFrom);
    }
  }
  return occursOn;
}

function readNote(note) {
  if (note == null || note === '') {
    return { ok: true, value: null };
  }
  if (typeof note !== 'string') {
    return reject(400, 'Note must be text.');
  }
  const trimmed = note.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  if (trimmed.length > NOTE_LIMIT) {
    return reject(400, 'Note must be 500 characters or less.');
  }
  return { ok: true, value: trimmed };
}

function closedMessage(prefix, minutes) {
  if (minutes === 0) {
    return prefix + ' at start';
  }
  return prefix + ' ' + durationLabel(minutes) + ' before start';
}

function durationLabel(minutes) {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? '1 hour' : hours + ' hours';
  }
  return minutes === 1 ? '1 minute' : minutes + ' minutes';
}

// Credit costs are whole numbers. A fractional value is a caller bug, so this
// throws instead of rounding it into a different cost.
function wholeCost(value) {
  const cost = Number(value);
  if (!isFinite(cost) || cost < 0 || Math.floor(cost) !== cost) {
    throw new Error('creditCost must be a whole number of 0 or more');
  }
  return cost;
}

function reject(status, message) {
  return { ok: false, status: status, message: message };
}

function isOff(value) {
  return value === false || value === 0;
}

function uniqueDates(values) {
  const seen = {};
  const dates = [];
  (values || []).forEach((value) => {
    const date = day(value);
    if (!date || seen[date]) {
      return;
    }
    seen[date] = true;
    dates.push(date);
  });
  dates.sort();
  return dates;
}

function uniqueMoves(moves) {
  const seen = {};
  const unique = [];
  moves.forEach((move) => {
    const key = move.from + '|' + move.to;
    if (seen[key]) {
      return;
    }
    seen[key] = true;
    unique.push(move);
  });
  return unique;
}

module.exports = {
  decideReserve,
  decideMemberCancel,
  reservationEffects,
  reallocatePaused,
  sessionOnDate,
};
