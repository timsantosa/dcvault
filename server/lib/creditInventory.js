'use strict';

// Credit inventory rules from docs/CREDIT_INVENTORY.md. Pure functions only:
// callers persist grants and allocations. Pass `today` / `now` in; nothing here
// reads the clock or the database.

const SEASONS = ['winter', 'spring', 'summer', 'fall'];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SEASON_START_MONTH = {
  spring: 2,
  summer: 5,
  fall: 8,
  winter: 11,
};

function seasonOf(date) {
  assertDate(date, 'date');
  const month = date.getMonth() + 1;
  if (month === 12 || month === 1 || month === 2) {
    return 'winter';
  }
  if (month >= 3 && month <= 5) {
    return 'spring';
  }
  if (month >= 6 && month <= 8) {
    return 'summer';
  }
  return 'fall';
}

// This could change once we make the season window dynamic.
function resolveSeasonWindow(season, today) {
  if (SEASONS.indexOf(season) === -1) {
    throw new Error('season must be fall, winter, spring, or summer');
  }
  assertDate(today, 'today');

  const year = today.getFullYear();
  const candidates = [year - 1, year, year + 1].map((startYear) => windowStarting(season, startYear));
  const containing = candidates.find((window) => today >= window.startsAt && today < window.expiresAt);
  if (containing) {
    return containing;
  }

  const upcoming = candidates
    .filter((window) => window.startsAt > today)
    .sort((a, b) => a.startsAt - b.startsAt);
  if (!upcoming.length) {
    throw new Error('no season window for ' + season);
  }
  return upcoming[0];
}

function windowStarting(season, startYear) {
  const month = SEASON_START_MONTH[season];
  return {
    startsAt: new Date(startYear, month, 1),
    expiresAt: new Date(startYear, month + 3, 1),
  };
}

function buildStaffAddGrant(input) {
  return buildStaffGrant('staff_add', input, 1);
}

function buildStaffRemoveGrant(input) {
  return buildStaffGrant('staff_remove', input, -1);
}

function buildStaffGrant(source, input, sign) {
  assertPositiveInteger(input.quantity, 'quantity');
  if (!input.label) {
    throw new Error('label is required');
  }
  if (input.athleteId == null) {
    throw new Error('athleteId is required');
  }
  const startsAt = copyDate(input.startsAt, 'startsAt');
  const expiresAt = copyDate(input.expiresAt, 'expiresAt');
  return {
    athleteId: input.athleteId,
    classPackageId: null,
    purchaseId: null,
    source: source,
    label: input.label,
    quantity: sign * input.quantity,
    startsAt: startsAt,
    expiresAt: expiresAt,
    originalExpiresAt: expiresAt == null ? null : new Date(expiresAt.getTime()),
    createdByUserId: input.createdByUserId == null ? null : input.createdByUserId,
  };
}

function buildWebsitePurchaseGrant(input) {
  if (input.purchaseId == null) {
    throw new Error('purchaseId is required');
  }
  const existingGrants = input.existingGrants || [];
  const existing = existingGrants.find((grant) => grant.purchaseId === input.purchaseId);
  if (existing) {
    return { created: false, grant: existing };
  }
  if (!input.classPackage || !input.classPackage.name) {
    throw new Error('classPackage name is required');
  }
  if (input.athleteId == null) {
    throw new Error('athleteId is required');
  }
  const creditCount = input.classPackage.creditCount;
  if (creditCount !== null && !isPositiveInteger(creditCount)) {
    throw new Error('creditCount must be null (unlimited) or an integer of 1 or more');
  }

  const window = resolveSeasonWindow(input.season, input.today);
  return {
    created: true,
    grant: {
      athleteId: input.athleteId,
      classPackageId: input.classPackage.id,
      purchaseId: input.purchaseId,
      source: 'website_purchase',
      label: input.classPackage.name,
      quantity: creditCount,
      startsAt: window.startsAt,
      expiresAt: window.expiresAt,
      originalExpiresAt: new Date(window.expiresAt.getTime()),
      createdByUserId: null,
    },
  };
}

function endGrant(grant, now) {
  assertDate(now, 'now');
  if (grant.originalExpiresAt != null && now >= grant.originalExpiresAt) {
    return { changed: false, grant: grant };
  }
  if (grant.expiresAt != null && grant.expiresAt <= now) {
    return { changed: false, grant: grant };
  }
  return {
    changed: true,
    grant: Object.assign({}, grant, { expiresAt: new Date(now.getTime()) }),
  };
}

function grantBalance(grant, allocations) {
  if (grant.quantity == null) {
    return null;
  }
  return grant.quantity - heldAmount(grant.id, allocations);
}

function allocateForReservation(input) {
  if (!Number.isInteger(input.creditCost) || input.creditCost < 0) {
    throw new Error('creditCost must be an integer of 0 or more');
  }
  if (input.creditCost === 0) {
    return { ok: true, allocations: [] };
  }
  assertDate(input.classStart, 'classStart');
  if (input.reservationId == null) {
    throw new Error('reservationId is required');
  }

  const allocations = input.allocations || [];
  const covering = (input.grants || []).filter((grant) => grantCovers(grant, input.classStart));
  const finiteTotal = covering.reduce((sum, grant) => {
    if (grant.quantity == null) {
      return sum;
    }
    return sum + grantBalance(grant, allocations);
  }, 0);

  if (finiteTotal >= input.creditCost) {
    const pool = covering
      .filter((grant) => grant.quantity != null && grantBalance(grant, allocations) > 0)
      .sort(compareExpiryThenId);
    const created = [];
    let remaining = input.creditCost;
    pool.forEach((grant) => {
      if (remaining === 0) {
        return;
      }
      const take = Math.min(grantBalance(grant, allocations), remaining);
      created.push({
        reservationId: input.reservationId,
        creditGrantId: grant.id,
        amount: take,
      });
      remaining -= take;
    });
    return { ok: true, allocations: created };
  }

  const unlimited = covering.filter((grant) => grant.quantity == null).sort(compareExpiryThenId);
  if (unlimited.length) {
    return {
      ok: true,
      allocations: [{
        reservationId: input.reservationId,
        creditGrantId: unlimited[0].id,
        amount: input.creditCost,
      }],
    };
  }

  return { ok: false, reason: 'no_credits' };
}

function releaseReservation(allocations, reservationId) {
  return (allocations || []).filter((allocation) => allocation.reservationId !== reservationId);
}

function summarizeCredits(input) {
  assertDate(input.now, 'now');
  const grants = input.grants || [];
  const allocations = input.allocations || [];
  const classStartByReservationId = input.classStartByReservationId || {};
  const reservedIds = {};

  allocations.forEach((allocation) => {
    const classStart = classStartByReservationId[allocation.reservationId];
    if (classStart != null && classStart > input.now) {
      reservedIds[allocation.reservationId] = true;
    }
  });

  const reserved = Object.keys(reservedIds).length;
  const covering = grants.filter((grant) => grantCovers(grant, input.now));
  const unlimited = covering.filter((grant) => grant.quantity == null).sort(compareExpiryThenId);

  if (unlimited.length) {
    return {
      unlimited: true,
      remaining: null,
      reserved: reserved,
      expiringCount: null,
      expiringOn: null,
      through: lastInclusiveDay(unlimited[0].expiresAt),
    };
  }

  let finiteTotal = 0;
  const positive = [];
  covering.forEach((grant) => {
    if (grant.quantity == null) {
      return;
    }
    const balance = grantBalance(grant, allocations);
    finiteTotal += balance;
    if (balance > 0) {
      positive.push({ grant: grant, balance: balance });
    }
  });

  const dated = positive.filter((entry) => entry.grant.expiresAt != null).sort((a, b) => {
    return compareExpiryThenId(a.grant, b.grant);
  });

  const remaining = Math.max(0, finiteTotal);
  let expiringCount = null;
  let expiringOn = null;
  if (remaining > 0 && dated.length) {
    const soonest = dated[0].grant.expiresAt.getTime();
    expiringCount = dated.reduce((sum, entry) => {
      if (entry.grant.expiresAt.getTime() !== soonest) {
        return sum;
      }
      return sum + entry.balance;
    }, 0);
    expiringOn = lastInclusiveDay(dated[0].grant.expiresAt);
  }

  return {
    unlimited: false,
    remaining: remaining,
    reserved: reserved,
    expiringCount: expiringCount,
    expiringOn: expiringOn,
    through: null,
  };
}

function formatCreditChip(summary) {
  if (summary.unlimited) {
    let line = 'Unlimited · ' + summary.reserved + ' reserved';
    if (summary.through) {
      line += ' · through ' + formatMonthDay(summary.through);
    }
    return line;
  }

  let line = summary.remaining + ' remaining · ' + summary.reserved + ' reserved';
  if (summary.expiringCount != null && summary.expiringOn != null) {
    line += ' · ' + summary.expiringCount + ' expire ' + formatMonthDay(summary.expiringOn);
  }
  return line;
}

function formatHistoryLine(grant) {
  if (wasEndedEarly(grant)) {
    const endedOn = formatMonthDay(lastInclusiveDay(grant.expiresAt));
    if (grant.quantity == null) {
      return 'Unlimited · ended ' + endedOn;
    }
    return signedCount(grant.quantity) + ' · ended ' + endedOn;
  }
  if (grant.quantity == null) {
    if (grant.expiresAt == null) {
      return 'Unlimited';
    }
    return 'Unlimited · through ' + formatMonthDay(lastInclusiveDay(grant.expiresAt));
  }
  if (grant.expiresAt == null) {
    return signedCount(grant.quantity);
  }
  return signedCount(grant.quantity) + ' · exp ' + formatMonthDay(lastInclusiveDay(grant.expiresAt));
}

function wasEndedEarly(grant) {
  return !sameInstant(grant.expiresAt, grant.originalExpiresAt);
}

function signedCount(quantity) {
  if (quantity < 0) {
    return '\u2212' + Math.abs(quantity);
  }
  return '+' + quantity;
}

function lastInclusiveDay(expiresAt) {
  if (expiresAt == null) {
    return null;
  }
  const day = new Date(expiresAt.getFullYear(), expiresAt.getMonth(), expiresAt.getDate());
  const midnight = expiresAt.getHours() === 0
    && expiresAt.getMinutes() === 0
    && expiresAt.getSeconds() === 0
    && expiresAt.getMilliseconds() === 0;
  if (midnight) {
    day.setDate(day.getDate() - 1);
  }
  return day;
}

function formatMonthDay(date) {
  return MONTHS[date.getMonth()] + ' ' + date.getDate();
}

function grantCovers(grant, instant) {
  if (grant.startsAt != null && instant < grant.startsAt) {
    return false;
  }
  if (grant.expiresAt != null && instant >= grant.expiresAt) {
    return false;
  }
  return true;
}

function heldAmount(grantId, allocations) {
  return (allocations || []).reduce((sum, allocation) => {
    if (allocation.creditGrantId !== grantId) {
      return sum;
    }
    return sum + allocation.amount;
  }, 0);
}

function compareExpiryThenId(a, b) {
  if (a.expiresAt == null && b.expiresAt != null) {
    return 1;
  }
  if (a.expiresAt != null && b.expiresAt == null) {
    return -1;
  }
  if (a.expiresAt != null && b.expiresAt != null && a.expiresAt.getTime() !== b.expiresAt.getTime()) {
    return a.expiresAt - b.expiresAt;
  }
  return (a.id || 0) - (b.id || 0);
}

function sameInstant(a, b) {
  if (a == null && b == null) {
    return true;
  }
  if (a == null || b == null) {
    return false;
  }
  return a.getTime() === b.getTime();
}

function copyDate(value, label) {
  if (value == null) {
    return null;
  }
  assertDate(value, label);
  return new Date(value.getTime());
}

function assertDate(value, label) {
  if (!(value instanceof Date) || isNaN(value.getTime())) {
    throw new Error(label + ' must be a valid date');
  }
}

function assertPositiveInteger(value, label) {
  if (!isPositiveInteger(value)) {
    throw new Error(label + ' must be an integer of 1 or more');
  }
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value >= 1;
}

module.exports = {
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
};
