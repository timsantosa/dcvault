'use strict';

// Read-only member schedule. Callers load sessions and grants. Dates on a class
// are wall-clock America/New_York. Grants are Date instants. No database.

const { summarizeCredits, formatCreditChip } = require('./creditInventory');

const TIME_ZONE = 'America/New_York';
const DAYS_BEHIND = 14;
const DAYS_AHEAD = 77;

function memberScheduleRange(now) {
  const today = nyDateString(now);
  return {
    today: today,
    from: addIsoDays(today, -DAYS_BEHIND),
    to: addIsoDays(today, DAYS_AHEAD),
  };
}

function classStartInstant(occursOn, startTime) {
  const date = occursOn.split('-').map(Number);
  const clock = String(startTime || '00:00:00').split(':');
  const utcGuess = Date.UTC(date[0], date[1] - 1, date[2], Number(clock[0]), Number(clock[1]), Number(clock[2] || 0));
  const offset = zoneOffsetMs(utcGuess);
  let instant = utcGuess - offset;
  const offsetAtInstant = zoneOffsetMs(instant);
  if (offsetAtInstant !== offset) {
    instant = utcGuess - offsetAtInstant;
  }
  return new Date(instant);
}

function presentMemberSchedule(input) {
  const now = input.now;
  const grants = input.grants || [];
  const summary = summarizeCredits({
    now: now,
    grants: grants,
    allocations: [],
  });
  const sessions = (input.sessions || [])
    .filter((session) => !isOff(session.visible))
    .map((session) => presentSession(session, grants, now))
    .sort(compareSessions);

  return {
    today: nyDateString(now),
    chipText: formatCreditChip(summary),
    needsRegistration: summary.unlimited !== true && summary.remaining === 0,
    sessions: sessions,
  };
}

function presentSession(session, grants, now) {
  const creditCost = numericCost(session.creditCost);
  return {
    seriesId: session.seriesId,
    occursOn: session.occursOn,
    startTime: session.startTime,
    endTime: session.endTime,
    title: session.title,
    description: session.description == null ? null : session.description,
    location: session.location == null ? null : session.location,
    note: session.note == null ? null : session.note,
    color: session.color == null || session.color === '' ? null : session.color,
    capacity: Number(session.capacity),
    spotsTaken: 0,
    status: session.status,
    isReservable: !isOff(session.isReservable),
    creditCost: creditCost,
    dollarCost: session.dollarCost == null || session.dollarCost === '' ? null : Number(session.dollarCost),
    reservationCutoffMinutes: Number(session.reservationCutoffMinutes),
    cancellationCutoffMinutes: Number(session.cancellationCutoffMinutes),
    blockReason: blockReason(session, grants, now, creditCost),
    cancellationNote: cancellationNote(session),
    reserved: false,
  };
}

function blockReason(session, grants, now, creditCost) {
  if (session.status === 'canceled') {
    return 'Canceled';
  }
  if (isOff(session.isReservable)) {
    return 'View only';
  }
  const start = classStartInstant(session.occursOn, session.startTime);
  const cutoffMs = Number(session.reservationCutoffMinutes) * 60 * 1000;
  if (now.getTime() >= start.getTime() - cutoffMs) {
    return closedReason(Number(session.reservationCutoffMinutes));
  }
  if (creditCost === 0) {
    return null;
  }
  if (canAfford(creditCost, grants, start)) {
    return null;
  }
  const futureStart = soonestFutureStart(grants, start);
  if (futureStart) {
    return 'Credits start ' + nyMonthDay(futureStart);
  }
  if (creditsCoverNow(grants, now)) {
    return 'Credits expire before this class';
  }
  return 'Register to reserve';
}

function cancellationNote(session) {
  if (session.status === 'canceled' || isOff(session.isReservable)) {
    return null;
  }
  const minutes = Number(session.cancellationCutoffMinutes);
  if (minutes === 0) {
    return 'Cancel before start to keep your credit';
  }
  return 'Cancel up to ' + durationLabel(minutes) + ' before start to keep your credit';
}

function closedReason(minutes) {
  if (minutes === 0) {
    return 'Reservations closed at start';
  }
  return 'Reservations closed ' + durationLabel(minutes) + ' before start';
}

function durationLabel(minutes) {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return hours === 1 ? '1 hour' : hours + ' hours';
  }
  return minutes === 1 ? '1 minute' : minutes + ' minutes';
}

function canAfford(creditCost, grants, classStart) {
  const pool = coveredPool(grants, classStart);
  if (pool.finite >= creditCost) {
    return true;
  }
  return pool.unlimited;
}

function creditsCoverNow(grants, now) {
  const pool = coveredPool(grants, now);
  return pool.unlimited || pool.finite > 0;
}

function coveredPool(grants, instant) {
  let finite = 0;
  let unlimited = false;
  grants.forEach((grant) => {
    if (!covers(grant, instant)) {
      return;
    }
    if (grant.quantity == null) {
      unlimited = true;
      return;
    }
    finite += Number(grant.quantity);
  });
  return { finite: finite, unlimited: unlimited };
}

function soonestFutureStart(grants, classStart) {
  let soonest = null;
  grants.forEach((grant) => {
    if (grant.startsAt == null || grant.startsAt <= classStart) {
      return;
    }
    if (grant.expiresAt != null && grant.startsAt >= grant.expiresAt) {
      return;
    }
    if (grant.quantity != null && Number(grant.quantity) <= 0) {
      return;
    }
    if (soonest == null || grant.startsAt < soonest) {
      soonest = grant.startsAt;
    }
  });
  return soonest;
}

function covers(grant, instant) {
  if (grant.startsAt != null && instant < grant.startsAt) {
    return false;
  }
  if (grant.expiresAt != null && instant >= grant.expiresAt) {
    return false;
  }
  return true;
}

function numericCost(value) {
  const cost = Number(value);
  if (!Number.isFinite(cost) || cost < 0) {
    return 0;
  }
  return cost;
}

function isOff(value) {
  return value === false || value === 0;
}

function compareSessions(a, b) {
  if (a.occursOn !== b.occursOn) {
    return a.occursOn < b.occursOn ? -1 : 1;
  }
  if (a.startTime !== b.startTime) {
    return a.startTime < b.startTime ? -1 : 1;
  }
  return a.seriesId - b.seriesId;
}

function nyDateString(date) {
  const parts = zonedParts(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return parts.year + '-' + parts.month + '-' + parts.day;
}

function nyMonthDay(date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function zonedParts(date, options) {
  const parts = {};
  new Intl.DateTimeFormat('en-US', Object.assign({ timeZone: TIME_ZONE }, options))
    .formatToParts(date)
    .forEach((part) => {
      if (part.type !== 'literal') {
        parts[part.type] = part.value;
      }
    });
  return parts;
}

function zoneOffsetMs(utcMs) {
  const parts = zonedParts(new Date(utcMs), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  let hour = Number(parts.hour);
  if (hour === 24) {
    hour = 0;
  }
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    hour,
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - utcMs;
}

function addIsoDays(iso, days) {
  const date = iso.split('-').map(Number);
  const utc = new Date(Date.UTC(date[0], date[1] - 1, date[2]));
  utc.setUTCDate(utc.getUTCDate() + days);
  const month = utc.getUTCMonth() + 1;
  const day = utc.getUTCDate();
  return utc.getUTCFullYear() + '-' + (month < 10 ? '0' : '') + month + '-' + (day < 10 ? '0' : '') + day;
}

module.exports = {
  memberScheduleRange,
  classStartInstant,
  presentMemberSchedule,
};
