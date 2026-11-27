'use strict';

// Profile progress and class history (PRD §10, CREDIT_INVENTORY.md §8).
// Pure functions. Callers load grants, allocations, and this profile's reservations.

const {
  seasonOf,
  resolveSeasonWindow,
  quarterSpan,
  creditChip,
  formatHistoryLine,
  grantBalance,
  lastInclusiveDay,
} = require('./creditInventory');
const { day } = require('./dates');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PERIOD_COUNT = 9;

// input: { now, grants, allocations, reservations: [{ occursOn, checkedInAt, classStart, paused }] }
function presentClassProgress(input) {
  const now = input.now;
  const grants = input.grants || [];
  const reservations = input.reservations || [];
  const span = quarterSpan(now);
  const summary = creditChip({
    now: now,
    grants: grants,
    allocations: input.allocations || [],
    reservations: reservations.map((row) => ({
      classStart: row.classStart,
      paused: row.paused,
      occursOn: row.occursOn,
    })),
    from: span.from,
    to: span.to,
  });

  const season = seasonOf(now);
  const attended = reservations.filter((row) => {
    return row.checkedInAt != null && row.occursOn >= span.from && row.occursOn <= span.to;
  }).length;

  const finite = grants.filter((grant) => grant.quantity != null && overlaps(grant, span));
  const purchased = Math.max(0, finite.reduce((sum, grant) => sum + Number(grant.quantity), 0));

  return {
    seasonLabel: season.charAt(0).toUpperCase() + season.slice(1) + ' quarter',
    unlimited: summary.unlimited,
    purchased: summary.unlimited ? null : purchased,
    remaining: summary.remaining,
    reserved: summary.reserved,
    attended: attended,
    summaryText: summary.text,
  };
}

function canViewClassHistory(input) {
  const permissions = Array.isArray(input.permissions) ? input.permissions : [];
  if (permissions.includes('manage_credits')) {
    return true;
  }
  return input.ownsProfile === true && permissions.includes('reserve_classes');
}

// Current quarter, then the eight before it. from/to are inclusive calendar days.
function historyPeriods(today) {
  const periods = [];
  let cursor = today;
  const seen = {};
  while (periods.length < PERIOD_COUNT) {
    const season = seasonOf(cursor);
    const window = resolveSeasonWindow(season, cursor);
    const from = day(window.startsAt);
    const to = day(lastInclusiveDay(window.expiresAt));
    if (!seen[from]) {
      seen[from] = true;
      periods.push({
        label: periods.length === 0 ? 'Current Quarter' : seasonName(season) + ' ' + window.startsAt.getFullYear(),
        from: from,
        to: to,
        current: periods.length === 0,
      });
    }
    cursor = new Date(window.startsAt.getTime() - 1);
  }
  return periods;
}

// Blank from and to means the current quarter. One side, a bad day, or from after to is an error.
function parseHistoryRange(from, to, now) {
  if (isBlank(from) && isBlank(to)) {
    const current = historyPeriods(now)[0];
    return { ok: true, from: current.from, to: current.to };
  }
  if (isBlank(from) || isBlank(to)) {
    return { ok: false, message: 'from and to must both be set' };
  }
  if (!isIsoDay(from) || !isIsoDay(to)) {
    return { ok: false, message: 'from and to must be YYYY-MM-DD' };
  }
  if (from > to) {
    return { ok: false, message: 'from must be on or before to' };
  }
  return { ok: true, from: from, to: to };
}

// input: {
//   now, today: 'YYYY-MM-DD', from, to,
//   grants: [{ id, label, quantity, createdAt, expiresAt, originalExpiresAt }],
//   allocations: [{ creditGrantId, amount, holding }],
//   reservations: [{ id, occursOn, title, checkedIn, canceled }],
// }
function presentClassHistory(input) {
  const now = input.now;
  const today = input.today || day(now);
  const grants = input.grants || [];
  const allocations = input.allocations || [];
  const reservations = input.reservations || [];
  const events = [];

  grants.forEach((grant) => {
    const createdOn = day(grant.createdAt);
    if (createdOn) {
      events.push({
        date: createdOn,
        title: grant.label || 'Credit',
        detail: formatHistoryLine(grant),
        kind: 1,
        id: grant.id || 0,
      });
    }
    if (grant.quantity == null || grant.expiresAt == null || now < grant.expiresAt) {
      return;
    }
    const leftover = grantBalance(grant, allocations);
    if (leftover == null || leftover <= 0) {
      return;
    }
    events.push({
      date: day(lastInclusiveDay(grant.expiresAt)),
      title: 'Unused credits expired',
      detail: '\u2212' + leftover,
      kind: 2,
      id: grant.id || 0,
    });
  });

  reservations.forEach((row) => {
    const occursOn = day(row.occursOn);
    if (!occursOn || !row.title) {
      return;
    }
    let detail = null;
    if (row.checkedIn === true) {
      detail = 'Attended';
    } else if (row.canceled === true || occursOn >= today) {
      detail = null;
    } else {
      detail = 'Missed (reserved, no check-in)';
    }
    if (!detail) {
      return;
    }
    events.push({
      date: occursOn,
      title: row.title,
      detail: detail,
      kind: 0,
      id: row.id || 0,
    });
  });

  const visible = events.filter((event) => event.date >= input.from && event.date <= input.to);
  visible.sort((a, b) => {
    if (a.date !== b.date) {
      return a.date < b.date ? 1 : -1;
    }
    if (a.kind !== b.kind) {
      return a.kind - b.kind;
    }
    return b.id - a.id;
  });

  return {
    from: input.from,
    to: input.to,
    periods: historyPeriods(now),
    events: visible.map((event) => ({
      date: event.date,
      dateText: formatEventDate(event.date, today),
      title: event.title,
      detail: event.detail,
    })),
  };
}

// Keep a reservation in history when that date is no longer on the class.
// Use the series title, or "Class" when the series is gone. Canceled only when we know it.
function historyClass(session, series) {
  if (session && session.title) {
    return {
      title: session.title,
      canceled: session.status === 'canceled',
    };
  }
  return {
    title: series && series.title ? series.title : 'Class',
    canceled: !!(series && series.canceledAt),
  };
}

function overlaps(grant, span) {
  if (grant.startsAt != null && grant.startsAt >= span.expiresAt) {
    return false;
  }
  if (grant.expiresAt != null && grant.expiresAt <= span.startsAt) {
    return false;
  }
  return true;
}

function seasonName(season) {
  return season.charAt(0).toUpperCase() + season.slice(1);
}

function formatEventDate(iso, today) {
  const month = MONTHS[Number(iso.slice(5, 7)) - 1];
  const dayNum = Number(iso.slice(8, 10));
  const year = iso.slice(0, 4);
  if (today && year === today.slice(0, 4)) {
    return month + ' ' + dayNum;
  }
  return month + ' ' + dayNum + ', ' + year;
}

function isBlank(value) {
  return value == null || value === '';
}

function isIsoDay(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parts = value.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  return date.getFullYear() === parts[0]
    && date.getMonth() === parts[1] - 1
    && date.getDate() === parts[2];
}

module.exports = {
  presentClassProgress,
  canViewClassHistory,
  historyPeriods,
  parseHistoryRange,
  presentClassHistory,
  historyClass,
};
