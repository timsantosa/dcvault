'use strict';

const { allocateForReservation } = require('../../lib/creditInventory');
const { presentMemberSchedule, classStartInstant } = require('../../lib/memberSchedule');
const { decideReserve, decideMemberCancel, sessionOnDate } = require('../../lib/reservations');
const { loadClassGraph } = require('./classesController');

async function reserveClass(req, res, db) {
  try {
    const parsed = readTarget(req.body, true);
    if (!parsed.ok) {
      return res.status(400).json({ ok: false, message: parsed.message });
    }
    const userId = callerId(req);
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const profile = await db.tables.AthleteProfiles.findOne({
      where: { id: parsed.athleteProfileId, userId: userId },
    });
    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    const created = await db.tables.schema.transaction(async (transaction) => {
      const session = await lockedSession(db, parsed.seriesId, parsed.occursOn, transaction);
      const existing = await db.tables.ClassReservations.findAll({
        where: { classSeriesId: parsed.seriesId, occursOn: parsed.occursOn },
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const decision = decideReserve({
        now: new Date(),
        classStart: classStartInstant(session.occursOn, session.startTime),
        session: session,
        spotsTaken: existing.length,
        alreadyReserved: existing.some((row) => row.athleteProfileId === profile.id),
        note: parsed.note,
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
        note: decision.note,
        paymentStatus: decision.paymentStatus,
      }, { transaction: transaction });

      for (let i = 0; i < allocated.length; i += 1) {
        await db.tables.CreditAllocations.create({
          reservationId: reservation.id,
          creditGrantId: allocated[i].creditGrantId,
          amount: allocated[i].amount,
          holding: true,
        }, { transaction: transaction });
      }

      return {
        id: reservation.id,
        athleteProfileId: reservation.athleteProfileId,
        seriesId: reservation.classSeriesId,
        occursOn: parsed.occursOn,
        note: reservation.note,
        paymentStatus: reservation.paymentStatus,
      };
    });

    res.status(201).json({ ok: true, reservation: created });
  } catch (error) {
    sendError(res, error, 'Error in reserveClass:');
  }
}

async function cancelReservation(req, res, db) {
  try {
    const parsed = readTarget(req.body, false);
    if (!parsed.ok) {
      return res.status(400).json({ ok: false, message: parsed.message });
    }
    const userId = callerId(req);
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const profile = await db.tables.AthleteProfiles.findOne({
      where: { id: parsed.athleteProfileId, userId: userId },
    });
    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    await db.tables.schema.transaction(async (transaction) => {
      const session = await lockedSession(db, parsed.seriesId, parsed.occursOn, transaction);
      const reservation = await db.tables.ClassReservations.findOne({
        where: {
          athleteProfileId: profile.id,
          classSeriesId: parsed.seriesId,
          occursOn: parsed.occursOn,
        },
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const decision = decideMemberCancel({
        now: new Date(),
        classStart: classStartInstant(session.occursOn, session.startTime),
        cancellationCutoffMinutes: session.cancellationCutoffMinutes,
        reservation: reservation,
      });
      if (!decision.ok) {
        throw coded(decision.status, decision.message);
      }
      await db.tables.CreditAllocations.destroy({
        where: { reservationId: reservation.id },
        transaction: transaction,
      });
      await reservation.destroy({ transaction: transaction });
    });

    res.json({ ok: true });
  } catch (error) {
    sendError(res, error, 'Error in cancelReservation:');
  }
}

// Lock the series. (seriesId, occursOn 'YYYY-MM-DD') -> session, or throws 404.
async function lockedSession(db, seriesId, occursOn, transaction) {
  const locked = await db.tables.ClassSeries.findByPk(seriesId, {
    transaction: transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!locked || locked.deletedAt) {
    throw coded(404, 'Class not found.');
  }
  const graph = await loadClassGraph(db, seriesId, transaction);
  const session = graph && sessionOnDate(graph, occursOn);
  if (!session) {
    throw coded(404, 'Class not found.');
  }
  return session;
}

// Lock grants and allocate. (profile, session, creditCost) -> [{ reservationId, creditGrantId, amount }], or throws.
async function takeCredits(db, profile, session, creditCost, transaction) {
  if (!profile.athleteId) {
    throw coded(409, 'Register to reserve');
  }
  const grantRows = await db.tables.CreditGrants.findAll({
    where: { athleteId: profile.athleteId },
    transaction: transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const grantIds = grantRows.map((row) => row.id);
  const allocationRows = grantIds.length
    ? await db.tables.CreditAllocations.findAll({
      where: { creditGrantId: grantIds },
      transaction: transaction,
    })
    : [];
  const grants = grantRows.map(toGrant);
  const allocations = allocationRows.filter(isHolding).map(toAllocation);
  const classStart = classStartInstant(session.occursOn, session.startTime);
  const allocated = allocateForReservation({
    grants: grants,
    allocations: allocations,
    classStart: classStart,
    creditCost: creditCost,
    reservationId: 0,
  });
  if (!allocated.ok) {
    throw coded(409, creditMessage(session, grants, allocations));
  }
  return allocated.allocations;
}

// (session, grants, allocations) -> block-reason string.
function creditMessage(session, grants, allocations) {
  const presented = presentMemberSchedule({
    now: new Date(),
    grants: grants,
    allocations: allocations,
    sessions: [session],
  });
  const reason = presented.sessions[0] && presented.sessions[0].blockReason;
  return reason || 'Register to reserve';
}

// (body, withNote) -> { ok, athleteProfileId, seriesId, occursOn, note } or { ok: false, message }.
function readTarget(body, withNote) {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'athleteProfileId is required' };
  }
  const athleteProfileId = parseInt(body.athleteProfileId, 10);
  const seriesId = parseInt(body.seriesId, 10);
  const occursOn = typeof body.occursOn === 'string' ? body.occursOn.slice(0, 10) : '';
  if (!Number.isInteger(athleteProfileId) || athleteProfileId < 1) {
    return { ok: false, message: 'athleteProfileId is required' };
  }
  if (!Number.isInteger(seriesId) || seriesId < 1) {
    return { ok: false, message: 'seriesId is required' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occursOn)) {
    return { ok: false, message: 'occursOn is required' };
  }
  return {
    ok: true,
    athleteProfileId: athleteProfileId,
    seriesId: seriesId,
    occursOn: occursOn,
    note: withNote ? body.note : null,
  };
}

// Grant row -> { id, athleteId, quantity, startsAt, expiresAt }.
function toGrant(row) {
  return {
    id: row.id,
    athleteId: row.athleteId,
    quantity: row.quantity == null ? null : Number(row.quantity),
    startsAt: row.startsAt == null ? null : new Date(row.startsAt),
    expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
  };
}

// Allocation row -> { reservationId, creditGrantId, amount, holding }.
function toAllocation(row) {
  return {
    reservationId: row.reservationId,
    creditGrantId: row.creditGrantId,
    amount: Number(row.amount),
    holding: row.holding,
  };
}

// A paused hold has holding false.
function isHolding(row) {
  return row.holding !== false && row.holding !== 0;
}

// Error the catch block sends as that HTTP status.
function coded(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Signed-in user id, or null.
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

// Coded errors keep their status. Anything else is a 500.
function sendError(res, error, label) {
  if (error.status) {
    res.status(error.status).json({ ok: false, message: error.message });
    return;
  }
  console.error(label, error);
  res.status(500).json({ ok: false, message: 'Internal server error.' });
}

module.exports = {
  reserveClass,
  cancelReservation,
};
