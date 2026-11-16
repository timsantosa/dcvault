'use strict';

const { grantBalance, allocateForReservation, seasonOf, resolveSeasonWindow } = require('./creditInventory');

// Check-in rules. Callers load rows and write them. Dates on a class are
// YYYY-MM-DD in America/New_York. Marking present does not move a credit.
// A walk-in is a new signup, and the caller spends credits for that signup.

// Whether staff may mark this signup present or clear it. Input: session (the
// expanded class on that date), reservation (null when this profile has none),
// today (YYYY-MM-DD), present (boolean), and now. Returns { ok:true,
// checkedInAt } or { ok:false, status, message }. checkedInAt stays the
// existing timestamp when they were already present, becomes now when this
// call marks them, and is null on undo. A future date and a canceled session
// are rejected. View-only and hidden do not matter once a signup exists.
function decideCheckIn(input) {
  const session = input.session;
  if (session.status === 'canceled') {
    return reject(409, 'Canceled');
  }
  if (session.occursOn > input.today) {
    return reject(409, 'Check-in is not open yet');
  }
  if (!input.reservation) {
    return reject(404, 'Reservation not found.');
  }
  if (input.present !== true && input.present !== false) {
    return reject(400, 'present must be true or false');
  }
  if (!input.present) {
    return { ok: true, checkedInAt: null };
  }
  if (input.reservation.checkedInAt) {
    return { ok: true, checkedInAt: input.reservation.checkedInAt };
  }
  return { ok: true, checkedInAt: input.now };
}

// Whether staff may add a walk-in. Input: session, today (YYYY-MM-DD),
// alreadyReserved, and spotsTaken. Returns { ok:true, creditCost,
// paymentStatus } or { ok:false, status, message }. Hidden classes are
// allowed. The reservation cutoff is not applied. A full class, a view-only
// class, a canceled class, a future date, and an existing signup are rejected.
// creditCost is a whole number; 0 means the signup has no credit hold.
// paymentStatus is 'external' when the class also has a dollar price, because
// this path does not charge it. The caller allocates and inserts the row.
function decideWalkIn(input) {
  const session = input.session;
  if (session.status === 'canceled') {
    return reject(409, 'Canceled');
  }
  if (isOff(session.isReservable)) {
    return reject(409, 'View only');
  }
  if (session.occursOn > input.today) {
    return reject(409, 'Check-in is not open yet');
  }
  if (input.alreadyReserved) {
    return reject(409, 'Already reserved.');
  }
  if (Number(input.spotsTaken) >= Number(session.capacity)) {
    return reject(409, 'Class is full');
  }
  const dollarCost = session.dollarCost == null || session.dollarCost === ''
    ? 0
    : Number(session.dollarCost);
  return {
    ok: true,
    creditCost: wholeCost(session.creditCost),
    paymentStatus: dollarCost > 0 ? 'external' : null,
  };
}

// List counts for one session. reservations carry id, athleteProfileId,
// firstName, lastName, profileImage, walkIn, and checkedInAt. reservedCount
// leaves walk-ins out. presentCount includes a walk-in who is checked in.
// Athletes are the reserved people first, then walk-ins, by last name, first
// name, and id.
function presentCheckIn(reservations) {
  const athletes = (reservations || []).map(toAthlete);
  athletes.sort(byListOrder);
  let reservedCount = 0;
  let walkInCount = 0;
  let presentCount = 0;
  athletes.forEach((athlete) => {
    if (athlete.walkIn) {
      walkInCount += 1;
    } else {
      reservedCount += 1;
    }
    if (athlete.present) {
      presentCount += 1;
    }
  });
  return {
    reservedCount: reservedCount,
    walkInCount: walkInCount,
    presentCount: presentCount,
    athletes: athletes,
  };
}

function toAthlete(row) {
  const checkedInAt = row.checkedInAt == null ? null : row.checkedInAt;
  return {
    reservationId: row.id,
    athleteProfileId: row.athleteProfileId,
    firstName: row.firstName || '',
    lastName: row.lastName || '',
    profileImage: row.profileImage || null,
    walkIn: isOn(row.walkIn),
    present: checkedInAt != null,
    checkedInAt: checkedInAt,
  };
}

function byListOrder(a, b) {
  if (a.walkIn !== b.walkIn) {
    return a.walkIn ? 1 : -1;
  }
  const last = compareText(a.lastName, b.lastName);
  if (last !== 0) {
    return last;
  }
  const first = compareText(a.firstName, b.firstName);
  if (first !== 0) {
    return first;
  }
  return a.reservationId - b.reservationId;
}

function compareText(left, right) {
  const a = String(left || '').toLowerCase();
  const b = String(right || '').toLowerCase();
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

// Credits this athlete can spend on this class. athleteId is null when the
// profile is not linked. grants are that athlete's grants. allocations may
// include paused holds; those do not reduce the balance. classStart is the
// class instant. Returns { linked, alreadyReserved, unlimited, usable,
// shortfall }. usable is null when an unlimited grant covers the class.
// shortfall is how many credits to add so the walk-in can succeed, including
// enough to offset a negative removal grant. 0 when they already cover it.
function walkInCreditOffer(input) {
  const alreadyReserved = input.alreadyReserved === true;
  if (input.athleteId == null) {
    return {
      linked: false,
      alreadyReserved: alreadyReserved,
      unlimited: false,
      usable: 0,
      shortfall: 0,
    };
  }
  const cost = wholeCost(input.creditCost);
  const grants = input.grants || [];
  const allocations = input.allocations || [];
  const finiteTotal = coveringFiniteTotal(grants, allocations, input.classStart);
  const usable = Math.max(0, finiteTotal);
  if (cost === 0) {
    return {
      linked: true,
      alreadyReserved: alreadyReserved,
      unlimited: false,
      usable: usable,
      shortfall: 0,
    };
  }
  const allocated = allocateForReservation({
    grants: grants,
    allocations: allocations,
    classStart: input.classStart,
    creditCost: cost,
    reservationId: 0,
  });
  if (allocated.ok && spentUnlimited(grants, allocated.allocations)) {
    return {
      linked: true,
      alreadyReserved: alreadyReserved,
      unlimited: true,
      usable: null,
      shortfall: 0,
    };
  }
  if (allocated.ok) {
    return {
      linked: true,
      alreadyReserved: alreadyReserved,
      unlimited: false,
      usable: usable,
      shortfall: 0,
    };
  }
  return {
    linked: true,
    alreadyReserved: alreadyReserved,
    unlimited: false,
    usable: usable,
    shortfall: cost - finiteTotal,
  };
}

// Inclusive season window that contains this class date. startsOn and endsOn
// are the dates the credits add already accepts. The class date is the day
// that has to be inside the window, including a session from the previous season.
function walkInGrantWindow(occursOn) {
  if (typeof occursOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(occursOn)) {
    throw new Error('occursOn must be YYYY-MM-DD');
  }
  const parts = occursOn.split('-').map(Number);
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  const window = resolveSeasonWindow(seasonOf(date), date);
  const end = new Date(window.expiresAt.getFullYear(), window.expiresAt.getMonth(), window.expiresAt.getDate() - 1);
  return {
    startsOn: isoDate(window.startsAt),
    endsOn: isoDate(end),
  };
}

function coveringFiniteTotal(grants, allocations, classStart) {
  return grants.reduce((sum, grant) => {
    if (grant.quantity == null || !grantCovers(grant, classStart)) {
      return sum;
    }
    return sum + grantBalance(grant, allocations);
  }, 0);
}

function grantCovers(grant, instant) {
  if (instant == null) {
    return false;
  }
  if (grant.startsAt != null && instant < grant.startsAt) {
    return false;
  }
  if (grant.expiresAt != null && instant >= grant.expiresAt) {
    return false;
  }
  return true;
}

function spentUnlimited(grants, allocations) {
  return allocations.some((allocation) => {
    const grant = grants.find((row) => row.id === allocation.creditGrantId);
    return grant != null && grant.quantity == null;
  });
}

function isoDate(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return date.getFullYear() + '-'
    + (month < 10 ? '0' : '') + month + '-'
    + (day < 10 ? '0' : '') + day;
}

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

function isOn(value) {
  return value === true || value === 1;
}

module.exports = {
  decideCheckIn,
  decideWalkIn,
  presentCheckIn,
  walkInCreditOffer,
  walkInGrantWindow,
};
