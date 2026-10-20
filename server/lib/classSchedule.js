'use strict';

// Class series expansion. Pure functions only: callers load series, slots, and
// occurrence rows and persist whatever they change. Pass dates in; nothing here
// reads the clock or the database.
//
// Dates are YYYY-MM-DD. Times are HH:MM:SS wall-clock strings. Weekday 0 is Sunday.

const OVERRIDE_FIELDS = [
  'title',
  'description',
  'location',
  'startTime',
  'endTime',
  'visible',
  'isReservable',
  'capacity',
  'creditCost',
  'dollarCost',
  'minAge',
  'maxAge',
  'reservationCutoffMinutes',
  'cancellationCutoffMinutes',
  'color',
  'note',
  'notifyCoachOnReserve',
];

const SESSION_FIELDS = [
  'title',
  'description',
  'location',
  'visible',
  'isReservable',
  'capacity',
  'creditCost',
  'dollarCost',
  'minAge',
  'maxAge',
  'reservationCutoffMinutes',
  'cancellationCutoffMinutes',
  'color',
  'note',
  'notifyCoachOnReserve',
];

function expandClassOccurrences(input) {
  const series = input.series;
  if (series.deletedAt != null) {
    return [];
  }

  const rangeStart = asIsoDate(input.rangeStart, 'rangeStart');
  const rangeEnd = asIsoDate(input.rangeEnd, 'rangeEnd');
  if (rangeStart > rangeEnd) {
    return [];
  }

  const slots = input.slots || [];
  const occurrences = input.occurrences || [];
  const slotsByWeekday = indexSlots(slots);
  const byOccursOn = {};
  const movedFrom = {};
  occurrences.forEach((occurrence) => {
    const occursOn = asIsoDate(occurrence.occursOn, 'occursOn');
    byOccursOn[occursOn] = occurrence;
    if (occurrence.rescheduledFrom != null) {
      movedFrom[asIsoDate(occurrence.rescheduledFrom, 'rescheduledFrom')] = occurrence;
    }
  });

  const sessions = [];
  if (!series.repeats) {
    const occursOn = asIsoDate(series.startsOn, 'startsOn');
    if (occursOn >= rangeStart && occursOn <= rangeEnd) {
      pushUnlessDeleted(sessions, series, occursOn, series.startTime, series.endTime, byOccursOn[occursOn]);
    }
  } else {
    const startsOn = asIsoDate(series.startsOn, 'startsOn');
    const endsOn = series.endsOn == null ? null : asIsoDate(series.endsOn, 'endsOn');
    let day = rangeStart;
    while (day <= rangeEnd) {
      const inSeries = day >= startsOn && (endsOn == null || day <= endsOn);
      const slot = slotsByWeekday[weekdayOf(day)];
      if (inSeries && slot && !movedFrom[day] && !landsOnMovedSession(day, occurrences)) {
        pushUnlessDeleted(sessions, series, day, slot.startTime, slot.endTime, byOccursOn[day]);
      }
      day = addDays(day, 1);
    }

    occurrences.forEach((occurrence) => {
      if (occurrence.rescheduledFrom == null || occurrence.deletedAt != null) {
        return;
      }
      const occursOn = asIsoDate(occurrence.occursOn, 'occursOn');
      if (occursOn < rangeStart || occursOn > rangeEnd) {
        return;
      }
      const origin = asIsoDate(occurrence.rescheduledFrom, 'rescheduledFrom');
      const originSlot = slotsByWeekday[weekdayOf(origin)];
      const startTime = originSlot ? originSlot.startTime : series.startTime;
      const endTime = originSlot ? originSlot.endTime : series.endTime;
      sessions.push(buildSession(series, occursOn, startTime, endTime, occurrence));
    });
  }

  sessions.sort(compareSessions);
  return sessions;
}

function assertValidClassSeries(input) {
  const series = input.series;
  const slots = input.slots || [];
  const occurrences = input.occurrences || [];
  assertValidSeriesRow(series);

  if (series.repeats) {
    if (!slots.length) {
      throw new Error('a repeating series needs at least one slot');
    }
  } else if (slots.length) {
    throw new Error('a one-off series cannot have slots');
  }

  const weekdays = {};
  slots.forEach((slot) => {
    assertValidSlot(slot);
    if (weekdays[slot.weekday]) {
      throw new Error('a series can have only one slot per weekday');
    }
    weekdays[slot.weekday] = true;
  });

  const occursOnSeen = {};
  const rescheduledFromSeen = {};
  const originSeen = {};
  occurrences.forEach((occurrence) => {
    assertValidOccurrence(occurrence);
    const occursOn = asIsoDate(occurrence.occursOn, 'occursOn');
    if (occursOnSeen[occursOn]) {
      throw new Error('two occurrences cannot share a date');
    }
    occursOnSeen[occursOn] = true;

    if (occurrence.rescheduledFrom != null) {
      const rescheduledFrom = asIsoDate(occurrence.rescheduledFrom, 'rescheduledFrom');
      if (rescheduledFromSeen[rescheduledFrom]) {
        throw new Error('two occurrences cannot leave the same date');
      }
      rescheduledFromSeen[rescheduledFrom] = true;
      if (!series.repeats) {
        throw new Error('a one-off series cannot move a single date');
      }
      if (!isSlotDate(series, slots, rescheduledFrom)) {
        throw new Error('rescheduledFrom must be a date on the series');
      }
      const destinationWeekday = weekdayOf(occursOn);
      if (slots.some((slot) => slot.weekday === destinationWeekday)) {
        throw new Error('a session cannot move onto a weekday the series already uses');
      }
    }

    const origin = occurrence.rescheduledFrom == null ? occursOn : asIsoDate(occurrence.rescheduledFrom, 'rescheduledFrom');
    if (originSeen[origin]) {
      throw new Error('a series date can have only one occurrence');
    }
    originSeen[origin] = true;
  });
}

function assertValidSeriesRow(series) {
  if (!series || typeof series.title !== 'string' || !series.title.trim()) {
    throw new Error('title is required');
  }
  if (typeof series.repeats !== 'boolean') {
    throw new Error('repeats must be true or false');
  }
  const startsOn = asIsoDate(series.startsOn, 'startsOn');
  if (series.endsOn != null) {
    if (!series.repeats) {
      throw new Error('endsOn is only for a repeating series');
    }
    const endsOn = asIsoDate(series.endsOn, 'endsOn');
    if (endsOn < startsOn) {
      throw new Error('endsOn must be on or after startsOn');
    }
  }
  if (series.repeats) {
    // Slot rows hold the times.
  } else {
    assertTimeOrder(series.startTime, series.endTime);
  }
  assertBoolean(series.visible, 'visible');
  assertBoolean(series.isReservable, 'isReservable');
  assertBoolean(series.notifyCoachOnReserve, 'notifyCoachOnReserve');
  assertCapacity(series.capacity);
  assertCreditCost(series.creditCost);
  assertDollarCost(series.dollarCost);
  assertAgeLimits(series.minAge, series.maxAge);
  assertCutoff(series.reservationCutoffMinutes, 'reservationCutoffMinutes');
  assertCutoff(series.cancellationCutoffMinutes, 'cancellationCutoffMinutes');
}

function assertValidSlot(slot) {
  if (!slot || !isWholeNumber(slot.weekday) || slot.weekday < 0 || slot.weekday > 6) {
    throw new Error('weekday must be 0 (Sunday) through 6 (Saturday)');
  }
  assertTimeOrder(slot.startTime, slot.endTime);
}

function assertValidOccurrence(occurrence) {
  if (!occurrence) {
    throw new Error('occurrence is required');
  }
  const occursOn = asIsoDate(occurrence.occursOn, 'occursOn');
  if (occurrence.rescheduledFrom != null && asIsoDate(occurrence.rescheduledFrom, 'rescheduledFrom') === occursOn) {
    throw new Error('rescheduledFrom must be a different date');
  }
  if (occurrence.status != null && occurrence.status !== 'active' && occurrence.status !== 'canceled') {
    throw new Error('status must be active, canceled, or empty');
  }
  assertBoolean(occurrence.overrideCoaches, 'overrideCoaches');
  assertBoolean(occurrence.overrideGroups, 'overrideGroups');
  assertOverrides(occurrence.overrides);
}

function isBlankOccurrence(occurrence) {
  if (!occurrence) {
    return false;
  }
  if (occurrence.rescheduledFrom != null) {
    return false;
  }
  if (occurrence.status != null) {
    return false;
  }
  if (occurrence.deletedAt != null) {
    return false;
  }
  if (occurrence.overrideCoaches) {
    return false;
  }
  if (occurrence.overrideGroups) {
    return false;
  }
  return Object.keys(presentOverrides(occurrence.overrides)).length === 0;
}

function pushUnlessDeleted(sessions, series, occursOn, startTime, endTime, occurrence) {
  if (occurrence && occurrence.deletedAt != null) {
    return;
  }
  sessions.push(buildSession(series, occursOn, startTime, endTime, occurrence));
}

function landsOnMovedSession(day, occurrences) {
  return occurrences.some((occurrence) => {
    return occurrence.rescheduledFrom != null
      && occurrence.deletedAt == null
      && asIsoDate(occurrence.occursOn, 'occursOn') === day;
  });
}

function buildSession(series, occursOn, startTime, endTime, occurrence) {
  const overrides = occurrence ? presentOverrides(occurrence.overrides) : {};
  const session = {
    seriesId: series.id,
    occursOn: occursOn,
    startTime: normalizeTime(overrides.startTime == null ? startTime : overrides.startTime, 'startTime'),
    endTime: normalizeTime(overrides.endTime == null ? endTime : overrides.endTime, 'endTime'),
    status: sessionStatus(series, occurrence),
    coachIds: coachIdsFor(series, occurrence),
    trainingGroupIds: groupIdsFor(series, occurrence),
  };
  SESSION_FIELDS.forEach((field) => {
    if (field === 'startTime' || field === 'endTime') {
      return;
    }
    session[field] = Object.prototype.hasOwnProperty.call(overrides, field) ? overrides[field] : series[field];
  });
  return session;
}

function sessionStatus(series, occurrence) {
  if (occurrence && occurrence.status != null) {
    return occurrence.status;
  }
  if (series.canceledAt != null) {
    return 'canceled';
  }
  return 'active';
}

function coachIdsFor(series, occurrence) {
  if (occurrence && occurrence.overrideCoaches) {
    return copyIds(occurrence.coachIds);
  }
  return copyIds(series.coachIds);
}

function groupIdsFor(series, occurrence) {
  if (occurrence && occurrence.overrideGroups) {
    return copyIds(occurrence.trainingGroupIds);
  }
  return copyIds(series.trainingGroupIds);
}

function copyIds(ids) {
  if (ids == null) {
    return [];
  }
  return ids.slice();
}

function presentOverrides(overrides) {
  if (overrides == null) {
    return {};
  }
  const present = {};
  Object.keys(overrides).forEach((key) => {
    if (overrides[key] != null) {
      present[key] = overrides[key];
    }
  });
  return present;
}

function assertOverrides(overrides) {
  if (overrides == null) {
    return;
  }
  if (typeof overrides !== 'object' || Array.isArray(overrides)) {
    throw new Error('overrides must be an object');
  }
  Object.keys(overrides).forEach((key) => {
    if (OVERRIDE_FIELDS.indexOf(key) === -1) {
      throw new Error('unknown override ' + key);
    }
  });
  const present = presentOverrides(overrides);
  if (present.startTime != null || present.endTime != null) {
    // A single time override is checked against itself only when both are present.
    // The series or slot supplies the other time when the row is expanded.
    if (present.startTime != null && present.endTime != null) {
      assertTimeOrder(present.startTime, present.endTime);
    } else if (present.startTime != null) {
      normalizeTime(present.startTime, 'startTime');
    } else {
      normalizeTime(present.endTime, 'endTime');
    }
  }
  if (present.visible != null) {
    assertBoolean(present.visible, 'visible');
  }
  if (present.isReservable != null) {
    assertBoolean(present.isReservable, 'isReservable');
  }
  if (present.notifyCoachOnReserve != null) {
    assertBoolean(present.notifyCoachOnReserve, 'notifyCoachOnReserve');
  }
  if (present.capacity != null) {
    assertCapacity(present.capacity);
  }
  if (present.creditCost != null) {
    assertCreditCost(present.creditCost);
  }
  if (Object.prototype.hasOwnProperty.call(present, 'dollarCost')) {
    assertDollarCost(present.dollarCost);
  }
  if (present.minAge != null || present.maxAge != null) {
    assertAgeLimits(present.minAge == null ? null : present.minAge, present.maxAge == null ? null : present.maxAge);
  }
  if (present.reservationCutoffMinutes != null) {
    assertCutoff(present.reservationCutoffMinutes, 'reservationCutoffMinutes');
  }
  if (present.cancellationCutoffMinutes != null) {
    assertCutoff(present.cancellationCutoffMinutes, 'cancellationCutoffMinutes');
  }
  if (present.title != null && (typeof present.title !== 'string' || !present.title.trim())) {
    throw new Error('title is required');
  }
}

function isSlotDate(series, slots, iso) {
  if (!series.repeats) {
    return false;
  }
  const startsOn = asIsoDate(series.startsOn, 'startsOn');
  if (iso < startsOn) {
    return false;
  }
  if (series.endsOn != null && iso > asIsoDate(series.endsOn, 'endsOn')) {
    return false;
  }
  return slots.some((slot) => slot.weekday === weekdayOf(iso));
}

function indexSlots(slots) {
  const byWeekday = {};
  slots.forEach((slot) => {
    byWeekday[slot.weekday] = slot;
  });
  return byWeekday;
}

function compareSessions(a, b) {
  if (a.occursOn < b.occursOn) {
    return -1;
  }
  if (a.occursOn > b.occursOn) {
    return 1;
  }
  if (a.startTime < b.startTime) {
    return -1;
  }
  if (a.startTime > b.startTime) {
    return 1;
  }
  return 0;
}

function assertCreditCost(value) {
  if (!isValidCreditCost(value)) {
    throw new Error('creditCost must be 0 or more with at most two decimal places');
  }
}

function isValidCreditCost(value) {
  if (typeof value === 'number') {
    if (!isFinite(value) || value < 0) {
      return false;
    }
    const cents = Math.round(value * 100);
    return Math.abs(value - cents / 100) < 1e-8 && cents <= 999999;
  }
  if (typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value)) {
    return Number(value) <= 9999.99;
  }
  return false;
}

function assertDollarCost(value) {
  if (value == null) {
    return;
  }
  if (typeof value === 'number') {
    if (!isFinite(value) || value < 0) {
      throw new Error('dollarCost must be empty or 0 or more with at most two decimal places');
    }
    const cents = Math.round(value * 100);
    if (Math.abs(value - cents / 100) >= 1e-8) {
      throw new Error('dollarCost must be empty or 0 or more with at most two decimal places');
    }
    return;
  }
  if (typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value)) {
    return;
  }
  throw new Error('dollarCost must be empty or 0 or more with at most two decimal places');
}

function assertCapacity(value) {
  if (!isWholeNumber(value) || value < 1) {
    throw new Error('capacity must be an integer of 1 or more');
  }
}

function assertCutoff(value, name) {
  if (!isWholeNumber(value) || value < 0) {
    throw new Error(name + ' must be 0 or more minutes');
  }
}

function assertAgeLimits(minAge, maxAge) {
  if (minAge != null && (!isWholeNumber(minAge) || minAge < 0)) {
    throw new Error('minAge must be empty or 0 or more');
  }
  if (maxAge != null && (!isWholeNumber(maxAge) || maxAge < 0)) {
    throw new Error('maxAge must be empty or 0 or more');
  }
  if (minAge != null && maxAge != null && Number(minAge) > Number(maxAge)) {
    throw new Error('minAge must be less than or equal to maxAge');
  }
}

function assertBoolean(value, name) {
  if (typeof value !== 'boolean') {
    throw new Error(name + ' must be true or false');
  }
}

function assertTimeOrder(startTime, endTime) {
  const start = normalizeTime(startTime, 'startTime');
  const end = normalizeTime(endTime, 'endTime');
  if (end <= start) {
    throw new Error('end time must be after start time');
  }
}

function isWholeNumber(value) {
  if (typeof value === 'number') {
    return isFinite(value) && Math.floor(value) === value;
  }
  return typeof value === 'string' && /^\d+$/.test(value);
}

function normalizeTime(value, name) {
  if (typeof value !== 'string') {
    throw new Error(name + ' must be HH:MM:SS');
  }
  const match = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(value);
  if (!match) {
    throw new Error(name + ' must be HH:MM:SS');
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] == null ? 0 : Number(match[3]);
  if (hours > 23 || minutes > 59 || seconds > 59) {
    throw new Error(name + ' must be HH:MM:SS');
  }
  return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
}

function asIsoDate(value, name) {
  if (typeof value === 'string') {
    const datePart = value.slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart) || datePart !== formatUtc(parseUtc(datePart))) {
      throw new Error(name + ' must be YYYY-MM-DD');
    }
    return datePart;
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    return formatUtc(new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate())));
  }
  throw new Error(name + ' must be YYYY-MM-DD');
}

function weekdayOf(iso) {
  return parseUtc(iso).getUTCDay();
}

function addDays(iso, days) {
  const utc = parseUtc(iso);
  utc.setUTCDate(utc.getUTCDate() + days);
  return formatUtc(utc);
}

function parseUtc(iso) {
  const parts = iso.split('-');
  return new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])));
}

function formatUtc(utc) {
  return utc.getUTCFullYear() + '-' + pad(utc.getUTCMonth() + 1) + '-' + pad(utc.getUTCDate());
}

function pad(number) {
  return number < 10 ? '0' + number : String(number);
}

module.exports = {
  OVERRIDE_FIELDS,
  expandClassOccurrences,
  assertValidClassSeries,
  assertValidSeriesRow,
  assertValidSlot,
  assertValidOccurrence,
  isBlankOccurrence,
  assertCreditCost,
};
