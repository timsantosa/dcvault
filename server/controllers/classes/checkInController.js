'use strict';

const {
  decideCheckIn,
  decideWalkIn,
  presentCheckIn,
  walkInCreditOffer,
  walkInGrantWindow,
} = require('../../lib/checkIn');
const { memberScheduleRange, classStartInstant } = require('../../lib/memberSchedule');
const { sessionOnDate } = require('../../lib/reservations');
const { loadClassGraph } = require('./classesController');
const { lockedSession, takeCredits } = require('./reservationsController');
const { trainingGroupsByProfileId } = require('../../lib/athleteTrainingGroups');

async function listCheckIn(req, res, db) {
  try {
    if (!callerId(req)) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const parsed = readSession(req.query);
    if (!parsed.ok) {
      return res.status(400).json({ ok: false, message: parsed.message });
    }
    const session = await openSession(db, parsed.seriesId, parsed.occursOn);
    const rows = await db.tables.ClassReservations.findAll({
      where: { classSeriesId: parsed.seriesId, occursOn: parsed.occursOn },
      include: [{
        model: db.tables.AthleteProfiles,
        as: 'athleteProfile',
        attributes: ['firstName', 'lastName', 'profileImage'],
      }],
    });
    const groupsByProfile = await trainingGroupsByProfileId(db, rows.map((row) => row.athleteProfileId));
    const listed = presentCheckIn(rows.map((row) => toListed(row, groupsByProfile)));
    res.json({
      ok: true,
      seriesId: parsed.seriesId,
      occursOn: parsed.occursOn,
      title: session.title,
      startTime: session.startTime,
      endTime: session.endTime,
      reservedCount: listed.reservedCount,
      walkInCount: listed.walkInCount,
      presentCount: listed.presentCount,
      athletes: listed.athletes,
    });
  } catch (error) {
    sendError(res, error, 'Error in listCheckIn:');
  }
}

async function markPresent(req, res, db) {
  try {
    if (!callerId(req)) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const parsed = readMark(req.body);
    if (!parsed.ok) {
      return res.status(400).json({ ok: false, message: parsed.message });
    }
    const profile = await db.tables.AthleteProfiles.findByPk(parsed.athleteProfileId);
    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    const now = new Date();
    const today = memberScheduleRange(now).today;
    const saved = await db.tables.schema.transaction(async (transaction) => {
      // Read the class without locking it. The lock below is only this
      // athlete's signup, so other check-ins on the same session can proceed.
      const session = await openSession(db, parsed.seriesId, parsed.occursOn, transaction);
      const reservation = await db.tables.ClassReservations.findOne({
        where: {
          athleteProfileId: profile.id,
          classSeriesId: parsed.seriesId,
          occursOn: parsed.occursOn,
        },
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const decision = decideCheckIn({
        session: session,
        reservation: reservation,
        today: today,
        present: parsed.present,
        now: now,
      });
      if (!decision.ok) {
        throw coded(decision.status, decision.message);
      }
      if (reservation && !sameInstant(reservation.checkedInAt, decision.checkedInAt)) {
        await reservation.update({ checkedInAt: decision.checkedInAt }, { transaction: transaction });
      }
      return reservationPayload(reservation, parsed.occursOn);
    });

    res.json({ ok: true, reservation: saved });
  } catch (error) {
    sendError(res, error, 'Error in markPresent:');
  }
}

async function addWalkIn(req, res, db) {
  try {
    if (!callerId(req)) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const parsed = readWalkIn(req.body);
    if (!parsed.ok) {
      return res.status(400).json({ ok: false, message: parsed.message });
    }
    const profile = await db.tables.AthleteProfiles.findByPk(parsed.athleteProfileId);
    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    const now = new Date();
    const today = memberScheduleRange(now).today;
    const created = await db.tables.schema.transaction(async (transaction) => {
      const session = await lockedSession(db, parsed.seriesId, parsed.occursOn, transaction);
      const existing = await db.tables.ClassReservations.findAll({
        where: { classSeriesId: parsed.seriesId, occursOn: parsed.occursOn },
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const decision = decideWalkIn({
        session: session,
        today: today,
        alreadyReserved: existing.some((row) => row.athleteProfileId === profile.id),
        spotsTaken: existing.length,
      });
      if (!decision.ok) {
        throw coded(decision.status, decision.message);
      }

      let allocated = [];
      if (decision.creditCost > 0) {
        allocated = await takeCredits(db, profile, session, decision.creditCost, transaction);
      }

      const reservation = await db.tables.ClassReservations.create({
        athleteProfileId: profile.id,
        classSeriesId: parsed.seriesId,
        occursOn: parsed.occursOn,
        note: null,
        paymentStatus: decision.paymentStatus,
        walkIn: true,
        checkedInAt: now,
      }, { transaction: transaction });

      for (let i = 0; i < allocated.length; i += 1) {
        await db.tables.CreditAllocations.create({
          reservationId: reservation.id,
          creditGrantId: allocated[i].creditGrantId,
          amount: allocated[i].amount,
          holding: true,
        }, { transaction: transaction });
      }

      return reservationPayload(reservation, parsed.occursOn);
    });

    res.status(201).json({ ok: true, reservation: created });
  } catch (error) {
    sendError(res, error, 'Error in addWalkIn:');
  }
}

// Read the session without locking the series. (seriesId, occursOn) -> session, or throws 404.
async function openSession(db, seriesId, occursOn, transaction) {
  const graph = await loadClassGraph(db, seriesId, transaction);
  if (!graph || graph.series.deletedAt) {
    throw coded(404, 'Class not found.');
  }
  const session = sessionOnDate(graph, occursOn);
  if (!session) {
    throw coded(404, 'Class not found.');
  }
  return session;
}

// Signup row -> the fields presentCheckIn counts.
function toListed(row, groupsByProfile) {
  const profile = row.athleteProfile || {};
  const groups = groupsByProfile && groupsByProfile[row.athleteProfileId];
  return {
    id: row.id,
    athleteProfileId: row.athleteProfileId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    profileImage: profile.profileImage,
    walkIn: row.walkIn,
    checkedInAt: row.checkedInAt,
    trainingGroups: groups || [],
  };
}

// Reservation row -> response body. occursOn is the requested YYYY-MM-DD.
function reservationPayload(row, occursOn) {
  const checkedInAt = row.checkedInAt || null;
  return {
    id: row.id,
    athleteProfileId: row.athleteProfileId,
    seriesId: row.classSeriesId,
    occursOn: occursOn,
    walkIn: row.walkIn === true || row.walkIn === 1,
    present: checkedInAt != null,
    checkedInAt: checkedInAt,
    paymentStatus: row.paymentStatus == null ? null : row.paymentStatus,
  };
}

function sameInstant(current, next) {
  if (current == null && next == null) {
    return true;
  }
  if (current == null || next == null) {
    return false;
  }
  return new Date(current).getTime() === new Date(next).getTime();
}

// (query or body) -> { ok, seriesId, occursOn } or { ok:false, message }.
function readSession(source) {
  if (!source || typeof source !== 'object') {
    return { ok: false, message: 'seriesId is required' };
  }
  const seriesId = parseInt(source.seriesId, 10);
  const occursOn = typeof source.occursOn === 'string' ? source.occursOn.slice(0, 10) : '';
  if (!Number.isInteger(seriesId) || seriesId < 1) {
    return { ok: false, message: 'seriesId is required' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occursOn)) {
    return { ok: false, message: 'occursOn is required' };
  }
  return { ok: true, seriesId: seriesId, occursOn: occursOn };
}

// (body) -> session target plus athleteProfileId and present.
function readMark(body) {
  const session = readSession(body);
  if (!session.ok) {
    return session;
  }
  const athlete = readProfile(body);
  if (!athlete.ok) {
    return athlete;
  }
  if (!body || (body.present !== true && body.present !== false)) {
    return { ok: false, message: 'present must be true or false' };
  }
  return {
    ok: true,
    seriesId: session.seriesId,
    occursOn: session.occursOn,
    athleteProfileId: athlete.athleteProfileId,
    present: body.present,
  };
}

// (body) -> session target plus athleteProfileId.
function readWalkIn(body) {
  const session = readSession(body);
  if (!session.ok) {
    return session;
  }
  const athlete = readProfile(body);
  if (!athlete.ok) {
    return athlete;
  }
  return {
    ok: true,
    seriesId: session.seriesId,
    occursOn: session.occursOn,
    athleteProfileId: athlete.athleteProfileId,
  };
}

function readProfile(body) {
  const athleteProfileId = parseInt(body && body.athleteProfileId, 10);
  if (!Number.isInteger(athleteProfileId) || athleteProfileId < 1) {
    return { ok: false, message: 'athleteProfileId is required' };
  }
  return { ok: true, athleteProfileId: athleteProfileId };
}

// (query) -> { ok:true, active:false }, { ok:true, active:true, seriesId, occursOn },
// or { ok:false, message }. No class params means the profile search is unchanged.
function parseWalkInSearch(query) {
  const source = query || {};
  const hasSeries = source.seriesId != null && String(source.seriesId) !== '';
  const hasDate = source.occursOn != null && String(source.occursOn) !== '';
  if (!hasSeries && !hasDate) {
    return { ok: true, active: false };
  }
  const session = readSession(source);
  if (!session.ok) {
    return session;
  }
  return {
    ok: true,
    active: true,
    seriesId: session.seriesId,
    occursOn: session.occursOn,
  };
}

// Profiles from the name search. Returns { offers, checkInGrant }. offers is
// keyed by profile id. Throws 404 when the class does not exist.
async function loadWalkInOffers(db, profiles, seriesId, occursOn) {
  const session = await openSession(db, seriesId, occursOn);
  const signups = await db.tables.ClassReservations.findAll({
    where: { classSeriesId: seriesId, occursOn: occursOn },
    attributes: ['athleteProfileId'],
  });
  const reserved = {};
  signups.forEach((row) => {
    reserved[row.athleteProfileId] = true;
  });

  const athleteIds = [];
  (profiles || []).forEach((profile) => {
    if (profile.athleteId != null && athleteIds.indexOf(profile.athleteId) === -1) {
      athleteIds.push(profile.athleteId);
    }
  });
  const Op = db.tables.schema.Sequelize.Op;
  const grantRows = athleteIds.length
    ? await db.tables.CreditGrants.findAll({
      where: { athleteId: { [Op.in]: athleteIds } },
    })
    : [];
  const grants = grantRows.map(toOfferGrant);
  const grantIds = grants.map((grant) => grant.id);
  const allocationRows = grantIds.length
    ? await db.tables.CreditAllocations.findAll({
      where: { creditGrantId: { [Op.in]: grantIds } },
    })
    : [];
  const allocations = allocationRows.map(toOfferAllocation);
  const grantsByAthlete = {};
  grants.forEach((grant) => {
    if (!grantsByAthlete[grant.athleteId]) {
      grantsByAthlete[grant.athleteId] = [];
    }
    grantsByAthlete[grant.athleteId].push(grant);
  });

  const classStart = classStartInstant(session.occursOn, session.startTime);
  const offers = {};
  (profiles || []).forEach((profile) => {
    const athleteGrants = profile.athleteId == null ? [] : (grantsByAthlete[profile.athleteId] || []);
    const ids = {};
    athleteGrants.forEach((grant) => {
      ids[grant.id] = true;
    });
    offers[profile.id] = walkInCreditOffer({
      athleteId: profile.athleteId == null ? null : profile.athleteId,
      alreadyReserved: reserved[profile.id] === true,
      creditCost: session.creditCost,
      classStart: classStart,
      grants: athleteGrants,
      allocations: allocations.filter((row) => ids[row.creditGrantId] === true),
    });
  });
  return {
    offers: offers,
    checkInGrant: walkInGrantWindow(session.occursOn),
  };
}

function toOfferGrant(row) {
  return {
    id: row.id,
    athleteId: row.athleteId,
    quantity: row.quantity == null ? null : Number(row.quantity),
    startsAt: row.startsAt == null ? null : new Date(row.startsAt),
    expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
  };
}

function toOfferAllocation(row) {
  return {
    reservationId: row.reservationId,
    creditGrantId: row.creditGrantId,
    amount: Number(row.amount),
    holding: row.holding,
  };
}

function coded(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function callerId(req) {
  const id = req.user && req.user.id;
  if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
    return id;
  }
  if (typeof id === 'string' && /^\d+$/.test(id)) {
    return Number(id);
  }
  return null;
}

function sendError(res, error, label) {
  if (error.status) {
    res.status(error.status).json({ ok: false, message: error.message });
    return;
  }
  console.error(label, error);
  res.status(500).json({ ok: false, message: 'Internal server error.' });
}

module.exports = {
  listCheckIn,
  markPresent,
  addWalkIn,
  parseWalkInSearch,
  loadWalkInOffers,
};
