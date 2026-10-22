'use strict';

// Class series expansion and edit preparation. Pure functions only: callers load
// series, slots, and occurrence rows and persist whatever they change. Pass
// dates in; nothing here reads the clock or the database.
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

// --- write preparation -----------------------------------------------------
// These return the rows to save. They do not send the notify flag anywhere.

const MAX_SCHEDULE_DAYS = 92;

const SERIES_COLUMNS = [
  'title',
  'description',
  'location',
  'startsOn',
  'repeats',
  'endsOn',
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
  'canceledAt',
  'deletedAt',
];

function fail(message) {
  return { ok: false, message: message };
}

function prepareClassCreate(input, known) {
  const body = requireObject(input);
  if (body) {
    return body;
  }
  const read = readSeriesInput(input, knownLists(known));
  if (!read.ok) {
    return read;
  }
  read.series.canceledAt = null;
  read.series.deletedAt = null;
  return finish(read.series, read.slots, [], null);
}

function prepareClassUpdate(current, input, known) {
  const body = requireObject(input);
  if (body) {
    return body;
  }
  const loaded = readCurrent(current);
  if (!loaded.ok) {
    return loaded;
  }
  const scope = readScope(input);
  if (!scope.ok) {
    return scope;
  }
  const notify = readNotify(input);
  if (!notify.ok) {
    return notify;
  }
  if (scope.scope === 'occurrence' && loaded.series.repeats) {
    return prepareOccurrenceEdit(loaded, input, knownLists(known), notify.notify);
  }
  return prepareSeriesEdit(loaded, input, knownLists(known), scope.scope, notify.notify);
}

function prepareClassCancel(current, input, now) {
  const body = requireObject(input);
  if (body) {
    return body;
  }
  const loaded = readCurrent(current);
  if (!loaded.ok) {
    return loaded;
  }
  const scope = readScope(input);
  if (!scope.ok) {
    return scope;
  }
  const notify = readNotify(input);
  if (!notify.ok) {
    return notify;
  }
  if (typeof input.canceled !== 'boolean') {
    return fail('canceled must be true or false');
  }
  if (scope.scope === 'occurrence' && loaded.series.repeats) {
    return prepareOccurrenceCancel(loaded, input, notify.notify);
  }
  return prepareSeriesCancel(loaded, input, scope.scope, notify.notify, now);
}

function prepareClassDelete(current, input, now) {
  const body = requireObject(input);
  if (body) {
    return body;
  }
  const loaded = readCurrent(current);
  if (!loaded.ok) {
    return loaded;
  }
  const scope = readScope(input);
  if (!scope.ok) {
    return scope;
  }
  const notify = readNotify(input);
  if (!notify.ok) {
    return notify;
  }
  if (scope.scope === 'occurrence' && loaded.series.repeats) {
    return prepareOccurrenceDelete(loaded, input, notify.notify, now);
  }
  return prepareSeriesDelete(loaded, input, scope.scope, notify.notify, now);
}

function parseScheduleRange(from, to) {
  let start;
  let end;
  try {
    start = asIsoDate(from, 'from');
    end = asIsoDate(to, 'to');
  } catch (error) {
    return fail(error.message);
  }
  if (start > end) {
    return fail('from must be on or before to');
  }
  const span = Math.round((parseUtc(end) - parseUtc(start)) / 86400000);
  if (span > MAX_SCHEDULE_DAYS) {
    return fail('date window must be 92 days or less');
  }
  return { ok: true, value: { from: start, to: end } };
}

function prepareSeriesEdit(loaded, input, known, scope, notify) {
  let body = input;
  if (scope === 'occurrence') {
    const occursOn = readOccursOn(input);
    if (!occursOn.ok) {
      return occursOn;
    }
    if (occursOn.occursOn !== loaded.series.startsOn) {
      return fail('That date is not on this series.');
    }
    const moveTo = readMoveTo(input);
    if (!moveTo.ok) {
      return moveTo;
    }
    body = Object.assign({}, input, {
      repeats: false,
      startsOn: moveTo.moveTo || input.startsOn || loaded.series.startsOn,
      slots: [],
    });
  }
  const read = readSeriesInput(body, known);
  if (!read.ok) {
    return read;
  }
  read.series.canceledAt = loaded.series.canceledAt;
  read.series.deletedAt = loaded.series.deletedAt;
  let occurrences = applySeriesEditToOccurrences(
    loaded.occurrences,
    changedOverrideFields(loaded.series, read.series),
    !sameSlots(loaded.slots, read.slots),
    !sameIds(loaded.series.coachIds, read.series.coachIds),
    !sameIds(loaded.series.trainingGroupIds, read.series.trainingGroupIds)
  );
  if (!read.series.repeats) {
    if (occurrences.some((occurrence) => !isBlankOccurrence(occurrence))) {
      return fail('a one-off series cannot keep per-date changes');
    }
    occurrences = [];
  }
  return finish(read.series, read.slots, occurrences, notify);
}

function prepareOccurrenceEdit(loaded, input, known, notify) {
  const occursOn = readOccursOn(input);
  if (!occursOn.ok) {
    return occursOn;
  }
  const moveTo = readMoveTo(input);
  if (!moveTo.ok) {
    return moveTo;
  }
  const located = locateDate(loaded, occursOn.occursOn);
  if (!located.ok) {
    return located;
  }
  const session = readSessionInput(input, known);
  if (!session.ok) {
    return session;
  }

  const origin = located.origin;
  let nextDate = occursOn.occursOn;
  let rescheduledFrom = located.occurrence && located.occurrence.rescheduledFrom
    ? located.occurrence.rescheduledFrom
    : null;
  if (moveTo.moveTo && moveTo.moveTo !== nextDate) {
    if (moveTo.moveTo === origin) {
      nextDate = origin;
      rescheduledFrom = null;
    } else {
      nextDate = moveTo.moveTo;
      rescheduledFrom = origin;
    }
  }

  const times = templateTimes(loaded, origin);
  const overrides = storedOverrides(buildOverrides(loaded.series, times, session.fields));
  const row = {
    occursOn: nextDate,
    rescheduledFrom: rescheduledFrom,
    status: located.occurrence ? located.occurrence.status : null,
    deletedAt: null,
    overrides: overrides,
    overrideCoaches: !sameIds(session.coachIds, loaded.series.coachIds),
    overrideGroups: !sameIds(session.trainingGroupIds, loaded.series.trainingGroupIds),
    coachIds: [],
    trainingGroupIds: [],
  };
  if (row.overrideCoaches) {
    row.coachIds = session.coachIds;
  }
  if (row.overrideGroups) {
    row.trainingGroupIds = session.trainingGroupIds;
  }

  const occurrences = withoutDate(loaded.occurrences, occursOn.occursOn);
  if (!isBlankOccurrence(row)) {
    occurrences.push(row);
  }
  return finish(loaded.series, loaded.slots, occurrences, notify);
}

function prepareSeriesCancel(loaded, input, scope, notify, now) {
  if (scope === 'occurrence') {
    const occursOn = readOccursOn(input);
    if (!occursOn.ok) {
      return occursOn;
    }
    if (occursOn.occursOn !== loaded.series.startsOn) {
      return fail('That date is not on this series.');
    }
  }
  const series = Object.assign({}, loaded.series);
  if (input.canceled) {
    if (series.canceledAt == null) {
      if (typeof now !== 'string' || !now) {
        return fail('now is required');
      }
      series.canceledAt = now;
    }
  } else {
    series.canceledAt = null;
  }
  return finish(series, loaded.slots, loaded.occurrences, notify);
}

function prepareOccurrenceCancel(loaded, input, notify) {
  const occursOn = readOccursOn(input);
  if (!occursOn.ok) {
    return occursOn;
  }
  const located = locateDate(loaded, occursOn.occursOn);
  if (!located.ok) {
    return located;
  }
  const row = located.occurrence
    ? Object.assign({}, located.occurrence)
    : emptyOccurrence(occursOn.occursOn);
  if (input.canceled) {
    row.status = 'canceled';
  } else if (loaded.series.canceledAt != null) {
    row.status = 'active';
  } else {
    row.status = null;
  }
  const occurrences = withoutDate(loaded.occurrences, occursOn.occursOn);
  if (!isBlankOccurrence(row)) {
    occurrences.push(row);
  }
  return finish(loaded.series, loaded.slots, occurrences, notify);
}

function prepareSeriesDelete(loaded, input, scope, notify, now) {
  if (scope === 'occurrence') {
    const occursOn = readOccursOn(input);
    if (!occursOn.ok) {
      return occursOn;
    }
    if (occursOn.occursOn !== loaded.series.startsOn) {
      return fail('That date is not on this series.');
    }
  }
  if (typeof now !== 'string' || !now) {
    return fail('now is required');
  }
  const series = Object.assign({}, loaded.series);
  if (series.deletedAt == null) {
    series.deletedAt = now;
  }
  return finish(series, loaded.slots, loaded.occurrences, notify);
}

function prepareOccurrenceDelete(loaded, input, notify, now) {
  const occursOn = readOccursOn(input);
  if (!occursOn.ok) {
    return occursOn;
  }
  const located = locateDate(loaded, occursOn.occursOn);
  if (!located.ok) {
    return located;
  }
  if (typeof now !== 'string' || !now) {
    return fail('now is required');
  }
  const row = located.occurrence
    ? Object.assign({}, located.occurrence)
    : emptyOccurrence(occursOn.occursOn);
  row.deletedAt = now;
  const occurrences = withoutDate(loaded.occurrences, occursOn.occursOn);
  occurrences.push(row);
  return finish(loaded.series, loaded.slots, occurrences, notify);
}

function finish(series, slots, occurrences, notifyRequested) {
  try {
    assertValidClassSeries({ series: series, slots: slots, occurrences: occurrences });
  } catch (error) {
    return fail(error.message);
  }
  const value = {
    series: pickSeries(series),
    slots: slots.map((slot) => ({
      weekday: Number(slot.weekday),
      startTime: slot.startTime,
      endTime: slot.endTime,
    })),
    coachIds: idNumbers(series.coachIds),
    trainingGroupIds: idNumbers(series.trainingGroupIds),
    occurrences: occurrences,
  };
  if (notifyRequested != null) {
    value.notifyRequested = notifyRequested;
  }
  return { ok: true, value: value };
}

function applySeriesEditToOccurrences(occurrences, changedFields, clearTimes, clearCoaches, clearGroups) {
  const clear = {};
  changedFields.forEach((field) => {
    clear[field] = true;
  });
  if (clearTimes) {
    clear.startTime = true;
    clear.endTime = true;
  }
  const next = [];
  occurrences.forEach((occurrence) => {
    const overrides = Object.assign({}, presentOverrides(occurrence.overrides));
    Object.keys(clear).forEach((field) => {
      delete overrides[field];
    });
    const row = {
      occursOn: occurrence.occursOn,
      rescheduledFrom: occurrence.rescheduledFrom,
      status: occurrence.status,
      deletedAt: occurrence.deletedAt,
      overrides: Object.keys(overrides).length ? overrides : null,
      overrideCoaches: clearCoaches ? false : occurrence.overrideCoaches,
      overrideGroups: clearGroups ? false : occurrence.overrideGroups,
      coachIds: clearCoaches ? [] : occurrence.coachIds.slice(),
      trainingGroupIds: clearGroups ? [] : occurrence.trainingGroupIds.slice(),
    };
    if (!isBlankOccurrence(row)) {
      next.push(row);
    }
  });
  return next;
}

function changedOverrideFields(before, after) {
  const changed = [];
  OVERRIDE_FIELDS.forEach((field) => {
    if (!sameField(field, before[field], after[field])) {
      changed.push(field);
    }
  });
  return changed;
}

function buildOverrides(series, times, fields) {
  const overrides = {};
  OVERRIDE_FIELDS.forEach((field) => {
    const template = field === 'startTime' ? times.startTime : field === 'endTime' ? times.endTime : series[field];
    if (!sameField(field, template, fields[field])) {
      overrides[field] = fields[field];
    }
  });
  if (overrides.startTime != null || overrides.endTime != null) {
    overrides.startTime = fields.startTime;
    overrides.endTime = fields.endTime;
  }
  return overrides;
}

function sameField(field, left, right) {
  if (field === 'creditCost' || field === 'dollarCost' || field === 'capacity'
    || field === 'minAge' || field === 'maxAge'
    || field === 'reservationCutoffMinutes' || field === 'cancellationCutoffMinutes') {
    if (left == null && right == null) {
      return true;
    }
    if (left == null || right == null) {
      return false;
    }
    return Number(left) === Number(right);
  }
  if (field === 'startTime' || field === 'endTime') {
    if (left == null && right == null) {
      return true;
    }
    if (left == null || right == null) {
      return false;
    }
    return normalizeTime(left, field) === normalizeTime(right, field);
  }
  if (left == null && right == null) {
    return true;
  }
  return left === right;
}

function locateDate(loaded, occursOn) {
  const row = loaded.occurrences.filter((occurrence) => occurrence.occursOn === occursOn)[0];
  if (row && row.deletedAt != null) {
    return fail('That date is not on this series.');
  }
  if (row) {
    return {
      ok: true,
      occurrence: row,
      origin: row.rescheduledFrom == null ? row.occursOn : row.rescheduledFrom,
    };
  }
  if (loaded.occurrences.some((occurrence) => occurrence.rescheduledFrom === occursOn)) {
    return fail('That date is not on this series.');
  }
  if (loaded.series.repeats && isSlotDate(loaded.series, loaded.slots, occursOn)) {
    return { ok: true, occurrence: null, origin: occursOn };
  }
  return fail('That date is not on this series.');
}

function templateTimes(loaded, origin) {
  if (!loaded.series.repeats) {
    return { startTime: loaded.series.startTime, endTime: loaded.series.endTime };
  }
  const weekday = weekdayOf(origin);
  const slot = loaded.slots.filter((item) => item.weekday === weekday)[0];
  if (!slot) {
    return { startTime: loaded.series.startTime, endTime: loaded.series.endTime };
  }
  return { startTime: slot.startTime, endTime: slot.endTime };
}

function withoutDate(occurrences, occursOn) {
  return occurrences.filter((occurrence) => occurrence.occursOn !== occursOn);
}

function emptyOccurrence(occursOn) {
  return {
    occursOn: occursOn,
    rescheduledFrom: null,
    status: null,
    deletedAt: null,
    overrides: null,
    overrideCoaches: false,
    overrideGroups: false,
    coachIds: [],
    trainingGroupIds: [],
  };
}

function readCurrent(current) {
  if (!current || !current.series) {
    return fail('Class details are required.');
  }
  try {
    return {
      ok: true,
      series: normalizeStoredSeries(current.series),
      slots: (current.slots || []).map((slot) => ({
        weekday: Number(slot.weekday),
        startTime: normalizeTime(slot.startTime, 'startTime'),
        endTime: normalizeTime(slot.endTime, 'endTime'),
      })),
      occurrences: (current.occurrences || []).map(cloneOccurrence),
    };
  } catch (error) {
    return fail(error.message);
  }
}

function normalizeStoredSeries(series) {
  return {
    title: series.title,
    description: series.description == null ? null : series.description,
    location: series.location == null ? null : series.location,
    startsOn: asIsoDate(series.startsOn, 'startsOn'),
    repeats: series.repeats,
    endsOn: series.endsOn == null || series.endsOn === '' ? null : asIsoDate(series.endsOn, 'endsOn'),
    startTime: storedTime(series.startTime, 'startTime'),
    endTime: storedTime(series.endTime, 'endTime'),
    visible: series.visible,
    isReservable: series.isReservable,
    capacity: Number(series.capacity),
    creditCost: Number(series.creditCost),
    dollarCost: series.dollarCost == null || series.dollarCost === '' ? null : Number(series.dollarCost),
    minAge: series.minAge == null || series.minAge === '' ? null : Number(series.minAge),
    maxAge: series.maxAge == null || series.maxAge === '' ? null : Number(series.maxAge),
    reservationCutoffMinutes: Number(series.reservationCutoffMinutes),
    cancellationCutoffMinutes: Number(series.cancellationCutoffMinutes),
    color: series.color == null ? null : series.color,
    note: series.note == null ? null : series.note,
    notifyCoachOnReserve: series.notifyCoachOnReserve,
    canceledAt: series.canceledAt == null ? null : series.canceledAt,
    deletedAt: series.deletedAt == null ? null : series.deletedAt,
    coachIds: idNumbers(series.coachIds),
    trainingGroupIds: idNumbers(series.trainingGroupIds),
  };
}

function cloneOccurrence(occurrence) {
  const overrides = storedOverrides(occurrence.overrides);
  return {
    occursOn: asIsoDate(occurrence.occursOn, 'occursOn'),
    rescheduledFrom: occurrence.rescheduledFrom == null
      ? null
      : asIsoDate(occurrence.rescheduledFrom, 'rescheduledFrom'),
    status: occurrence.status == null ? null : occurrence.status,
    deletedAt: occurrence.deletedAt == null ? null : occurrence.deletedAt,
    overrides: overrides,
    overrideCoaches: !!occurrence.overrideCoaches,
    overrideGroups: !!occurrence.overrideGroups,
    coachIds: idNumbers(occurrence.coachIds),
    trainingGroupIds: idNumbers(occurrence.trainingGroupIds),
  };
}

function storedOverrides(overrides) {
  const present = presentOverrides(overrides);
  return Object.keys(present).length ? present : null;
}

function storedTime(value, name) {
  if (value == null || value === '') {
    return null;
  }
  return normalizeTime(value, name);
}

function readSeriesInput(input, known) {
  if (typeof input.repeats !== 'boolean') {
    return fail('repeats must be true or false');
  }
  let startsOn;
  try {
    startsOn = asIsoDate(input.startsOn, 'startsOn');
  } catch (error) {
    return fail(error.message);
  }
  let endsOn = null;
  if (input.endsOn != null && input.endsOn !== '') {
    try {
      endsOn = asIsoDate(input.endsOn, 'endsOn');
    } catch (error) {
      return fail(error.message);
    }
  }
  const scalars = readScalars(input);
  if (!scalars.ok) {
    return scalars;
  }
  let startTime = null;
  let endTime = null;
  let slots = [];
  if (input.repeats) {
    const parsed = readSlots(input.slots);
    if (!parsed.ok) {
      return parsed;
    }
    slots = parsed.slots;
  } else {
    try {
      startTime = normalizeTime(input.startTime, 'startTime');
      endTime = normalizeTime(input.endTime, 'endTime');
    } catch (error) {
      return fail(error.message);
    }
  }
  const coaches = readIdList(input.coachIds, 'coach', known.knownCoachIds);
  if (!coaches.ok) {
    return coaches;
  }
  const groups = readIdList(input.trainingGroupIds, 'training group', known.knownTrainingGroupIds);
  if (!groups.ok) {
    return groups;
  }
  const series = Object.assign({}, scalars.fields, {
    startsOn: startsOn,
    repeats: input.repeats,
    endsOn: endsOn,
    startTime: startTime,
    endTime: endTime,
    canceledAt: null,
    deletedAt: null,
    coachIds: coaches.ids,
    trainingGroupIds: groups.ids,
  });
  return { ok: true, series: series, slots: slots };
}

function readSessionInput(input, known) {
  const scalars = readScalars(input);
  if (!scalars.ok) {
    return scalars;
  }
  try {
    scalars.fields.startTime = normalizeTime(input.startTime, 'startTime');
    scalars.fields.endTime = normalizeTime(input.endTime, 'endTime');
    assertTimeOrder(scalars.fields.startTime, scalars.fields.endTime);
  } catch (error) {
    return fail(error.message);
  }
  const coaches = readIdList(input.coachIds, 'coach', known.knownCoachIds);
  if (!coaches.ok) {
    return coaches;
  }
  const groups = readIdList(input.trainingGroupIds, 'training group', known.knownTrainingGroupIds);
  if (!groups.ok) {
    return groups;
  }
  return { ok: true, fields: scalars.fields, coachIds: coaches.ids, trainingGroupIds: groups.ids };
}

function readScalars(input) {
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (!title) {
    return fail('title is required');
  }
  const visible = readBoolean(input.visible, 'visible');
  if (!visible.ok) {
    return visible;
  }
  const isReservable = readBoolean(input.isReservable, 'isReservable');
  if (!isReservable.ok) {
    return isReservable;
  }
  const notifyCoachOnReserve = readBoolean(input.notifyCoachOnReserve, 'notifyCoachOnReserve');
  if (!notifyCoachOnReserve.ok) {
    return notifyCoachOnReserve;
  }
  const capacity = readCapacity(input.capacity);
  if (!capacity.ok) {
    return capacity;
  }
  const creditCost = readCreditCost(input.creditCost);
  if (!creditCost.ok) {
    return creditCost;
  }
  const dollarCost = readDollarCost(input.dollarCost);
  if (!dollarCost.ok) {
    return dollarCost;
  }
  const minAge = readAge(input.minAge, 'minAge');
  if (!minAge.ok) {
    return minAge;
  }
  const maxAge = readAge(input.maxAge, 'maxAge');
  if (!maxAge.ok) {
    return maxAge;
  }
  try {
    assertAgeLimits(minAge.value, maxAge.value);
  } catch (error) {
    return fail(error.message);
  }
  const reservationCutoffMinutes = readCutoff(input.reservationCutoffMinutes, 'reservationCutoffMinutes');
  if (!reservationCutoffMinutes.ok) {
    return reservationCutoffMinutes;
  }
  const cancellationCutoffMinutes = readCutoff(input.cancellationCutoffMinutes, 'cancellationCutoffMinutes');
  if (!cancellationCutoffMinutes.ok) {
    return cancellationCutoffMinutes;
  }
  const description = readOptionalText(input.description, 'description');
  if (!description.ok) {
    return description;
  }
  const location = readOptionalText(input.location, 'location');
  if (!location.ok) {
    return location;
  }
  const color = readOptionalText(input.color, 'color');
  if (!color.ok) {
    return color;
  }
  const note = readOptionalText(input.note, 'note');
  if (!note.ok) {
    return note;
  }
  return {
    ok: true,
    fields: {
      title: title,
      description: description.value,
      location: location.value,
      visible: visible.value,
      isReservable: isReservable.value,
      capacity: capacity.value,
      creditCost: creditCost.value,
      dollarCost: dollarCost.value,
      minAge: minAge.value,
      maxAge: maxAge.value,
      reservationCutoffMinutes: reservationCutoffMinutes.value,
      cancellationCutoffMinutes: cancellationCutoffMinutes.value,
      color: color.value,
      note: note.value,
      notifyCoachOnReserve: notifyCoachOnReserve.value,
    },
  };
}

function readSlots(value) {
  if (!Array.isArray(value) || !value.length) {
    return fail('a repeating series needs at least one slot');
  }
  const slots = [];
  for (let i = 0; i < value.length; i += 1) {
    const slot = value[i];
    try {
      assertValidSlot(slot);
    } catch (error) {
      return fail(error.message);
    }
    slots.push({
      weekday: Number(slot.weekday),
      startTime: normalizeTime(slot.startTime, 'startTime'),
      endTime: normalizeTime(slot.endTime, 'endTime'),
    });
  }
  slots.sort((a, b) => a.weekday - b.weekday);
  return { ok: true, slots: slots };
}

function readIdList(value, label, knownIds) {
  if (!Array.isArray(value)) {
    return fail(label + ' ids must be a list');
  }
  const ids = [];
  const seen = {};
  for (let i = 0; i < value.length; i += 1) {
    if (!isWholeNumber(value[i]) || Number(value[i]) < 1) {
      return fail(label + ' ids must be a list');
    }
    const id = Number(value[i]);
    if (seen[id]) {
      return fail('Duplicate ' + label + '.');
    }
    seen[id] = true;
    if (knownIds.indexOf(id) === -1) {
      return fail('Unknown ' + label + '.');
    }
    ids.push(id);
  }
  ids.sort((a, b) => a - b);
  return { ok: true, ids: ids };
}

function readOptionalText(value, name) {
  if (value == null || value === '') {
    return { ok: true, value: null };
  }
  if (typeof value !== 'string') {
    return fail(name + ' must be text');
  }
  const trimmed = value.trim();
  return { ok: true, value: trimmed ? trimmed : null };
}

function readBoolean(value, name) {
  if (typeof value !== 'boolean') {
    return fail(name + ' must be true or false');
  }
  return { ok: true, value: value };
}

function readCapacity(value) {
  if (!isWholeNumber(value) || Number(value) < 1) {
    return fail('capacity must be an integer of 1 or more');
  }
  return { ok: true, value: Number(value) };
}

function readCreditCost(value) {
  if (!isValidCreditCost(value)) {
    return fail('creditCost must be 0 or more with at most two decimal places');
  }
  return { ok: true, value: Number(Number(value).toFixed(2)) };
}

function readDollarCost(value) {
  if (value == null || value === '') {
    return { ok: true, value: null };
  }
  try {
    assertDollarCost(value);
  } catch (error) {
    return fail(error.message);
  }
  return { ok: true, value: Number(Number(value).toFixed(2)) };
}

function readAge(value, name) {
  if (value == null || value === '') {
    return { ok: true, value: null };
  }
  if (!isWholeNumber(value) || Number(value) < 0) {
    return fail(name + ' must be empty or 0 or more');
  }
  return { ok: true, value: Number(value) };
}

function readCutoff(value, name) {
  if (!isWholeNumber(value) || Number(value) < 0) {
    return fail(name + ' must be 0 or more minutes');
  }
  return { ok: true, value: Number(value) };
}

function readScope(input) {
  if (input.scope !== 'series' && input.scope !== 'occurrence') {
    return fail('scope must be series or occurrence');
  }
  return { ok: true, scope: input.scope };
}

function readNotify(input) {
  if (typeof input.notify !== 'boolean') {
    return fail('notify must be true or false');
  }
  return { ok: true, notify: input.notify };
}

function readOccursOn(input) {
  try {
    return { ok: true, occursOn: asIsoDate(input.occursOn, 'occursOn') };
  } catch (error) {
    return fail(error.message);
  }
}

function readMoveTo(input) {
  if (input.moveTo == null || input.moveTo === '') {
    return { ok: true, moveTo: null };
  }
  try {
    return { ok: true, moveTo: asIsoDate(input.moveTo, 'moveTo') };
  } catch (error) {
    return fail(error.message);
  }
}

function requireObject(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('Class details are required.');
  }
  return null;
}

function knownLists(known) {
  const source = known || {};
  return {
    knownCoachIds: idNumbers(source.knownCoachIds),
    knownTrainingGroupIds: idNumbers(source.knownTrainingGroupIds),
  };
}

function sameIds(left, right) {
  const a = idNumbers(left);
  const b = idNumbers(right);
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

function sameSlots(left, right) {
  if (left.length !== right.length) {
    return false;
  }
  const a = left.slice().sort((x, y) => x.weekday - y.weekday);
  const b = right.slice().sort((x, y) => x.weekday - y.weekday);
  for (let i = 0; i < a.length; i += 1) {
    if (a[i].weekday !== b[i].weekday) {
      return false;
    }
    if (a[i].startTime !== b[i].startTime || a[i].endTime !== b[i].endTime) {
      return false;
    }
  }
  return true;
}

function pickSeries(series) {
  const picked = {};
  SERIES_COLUMNS.forEach((key) => {
    picked[key] = series[key];
  });
  return picked;
}

function idNumbers(ids) {
  if (!Array.isArray(ids)) {
    return [];
  }
  return ids.map(Number).sort((a, b) => a - b);
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
  prepareClassCreate,
  prepareClassUpdate,
  prepareClassCancel,
  prepareClassDelete,
  parseScheduleRange,
};
