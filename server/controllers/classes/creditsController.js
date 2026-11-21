'use strict';

const {
  prepareStaffCreditAction,
  prepareEndGrant,
  presentStaffCredits,
  staffPeriods,
} = require('../../lib/creditInventory');
const { creditNotice } = require('../../lib/creditNotices');
const { athleteProfileBelongsToUser } = require('../../middlewares/mobileAuthMiddleware');
const { postAthleteNotice } = require('../../utils/messagesUtils');
const { classStartsFor, isPaused } = require('./memberScheduleController');

async function listStaffCredits(req, res, db) {
  try {
    const profile = await loadProfile(db, req.query && req.query.athleteProfileId);
    if (!profile.ok) {
      return res.status(profile.status).json({ ok: false, message: profile.message });
    }
    const now = new Date();
    const presented = await loadPresented(db, profile.profile, now);
    res.json({
      ok: true,
      athleteId: profile.profile.athleteId,
      summary: presented.summary,
      grants: presented.grants,
      periods: staffPeriods(now),
    });
  } catch (error) {
    sendError(res, error, 'Error in listStaffCredits:');
  }
}

async function adjustStaffCredits(req, res, db) {
  try {
    const body = req.body || {};
    const userId = callerId(req);
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const profile = await loadProfile(db, body.athleteProfileId);
    if (!profile.ok) {
      return res.status(profile.status).json({ ok: false, message: profile.message });
    }
    const now = new Date();
    const prepared = prepareStaffCreditAction({
      action: body.action,
      quantity: body.quantity,
      startsAt: body.startsAt,
      expiresAt: body.expiresAt,
      season: body.season,
      startsOn: body.startsOn,
      endsOn: body.endsOn,
      expiration: body.expiration,
      unlimited: body.unlimited,
      today: now,
      athleteId: profile.profile.athleteId,
      createdByUserId: userId,
    });
    if (!prepared.ok) {
      return res.status(400).json({ ok: false, message: prepared.message });
    }
    const sender = readSender(req);
    if (!sender.ok) {
      return res.status(400).json({ ok: false, message: sender.message });
    }

    const created = await db.tables.CreditGrants.create(prepared.grant);
    const presented = await loadPresented(db, profile.profile, now);
    const grant = presented.grants.find((row) => row.id === created.id);
    const notified = prepared.notifyRequested
      ? await sendCreditNotice(db, profile.profile.id, sender.senderId, {
        kind: body.action,
        quantity: prepared.grant.quantity,
        expiresAt: prepared.grant.expiresAt,
      })
      : 0;
    res.status(201).json({
      ok: true,
      grant: grant,
      summary: presented.summary,
      notifyRequested: prepared.notifyRequested,
      notified: notified,
    });
  } catch (error) {
    sendError(res, error, 'Error in adjustStaffCredits:');
  }
}

async function endStaffGrant(req, res, db) {
  try {
    const grantId = parseInt(req.params.grantId, 10);
    if (!Number.isInteger(grantId) || grantId < 1) {
      return res.status(400).json({ ok: false, message: 'Invalid grant id.' });
    }
    const profile = await loadProfile(db, (req.body || {}).athleteProfileId);
    if (!profile.ok) {
      return res.status(profile.status).json({ ok: false, message: profile.message });
    }
    const sender = readSender(req);
    if (!sender.ok) {
      return res.status(400).json({ ok: false, message: sender.message });
    }
    const now = new Date();
    const result = await db.tables.schema.transaction(async (transaction) => {
      const row = await db.tables.CreditGrants.findByPk(grantId, {
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!row || row.athleteId !== profile.profile.athleteId) {
        throw coded(404, 'Grant not found.');
      }
      const prepared = prepareEndGrant(toGrant(row), now);
      if (prepared.changed) {
        await row.update({ expiresAt: prepared.grant.expiresAt }, { transaction: transaction });
      }
      const allocationRows = await db.tables.CreditAllocations.findAll({
        where: { creditGrantId: row.id },
        transaction: transaction,
      });
      const presented = presentStaffCredits({
        grants: [toGrant(row)],
        allocations: allocationRows.map(toAllocation),
        now: now,
      });
      return {
        grant: presented.grants[0],
        changed: prepared.changed,
        notifyRequested: prepared.notifyRequested,
      };
    });
    const notified = result.notifyRequested
      ? await sendCreditNotice(db, profile.profile.id, sender.senderId, {
        kind: 'end',
        quantity: result.grant.quantity,
        expiresAt: result.grant.expiresAt,
      })
      : 0;
    res.json({
      ok: true,
      grant: result.grant,
      changed: result.changed,
      notifyRequested: result.notifyRequested,
      notified: notified,
    });
  } catch (error) {
    sendError(res, error, 'Error in endStaffGrant:');
  }
}

// athleteProfileId -> { ok, profile } or { ok: false, status, message }.
async function loadProfile(db, rawId) {
  const athleteProfileId = parseInt(rawId, 10);
  if (!Number.isInteger(athleteProfileId) || athleteProfileId < 1) {
    return { ok: false, status: 400, message: 'athleteProfileId is required' };
  }
  const profile = await db.tables.AthleteProfiles.findByPk(athleteProfileId);
  if (!profile) {
    return { ok: false, status: 404, message: 'Athlete profile not found.' };
  }
  if (!profile.athleteId) {
    return { ok: false, status: 409, message: 'This profile is not linked to an athlete.' };
  }
  return { ok: true, profile: profile };
}

async function loadPresented(db, profile, now) {
  const loaded = await loadCredits(db, profile.athleteId);
  const reservationRows = await db.tables.ClassReservations.findAll({
    where: { athleteProfileId: profile.id },
  });
  const starts = await classStartsFor(db, reservationRows);
  const allocationsByReservation = {};
  loaded.allocations.forEach((allocation) => {
    if (!allocationsByReservation[allocation.reservationId]) {
      allocationsByReservation[allocation.reservationId] = [];
    }
    allocationsByReservation[allocation.reservationId].push(allocation);
  });
  const reservations = reservationRows.map((row) => ({
    classStart: starts[row.id] || null,
    paused: isPaused(allocationsByReservation[row.id] || []),
  }));
  return presentStaffCredits({
    grants: loaded.grants,
    allocations: loaded.allocations,
    reservations: reservations,
    now: now,
  });
}

async function loadCredits(db, athleteId) {
  const grantRows = await db.tables.CreditGrants.findAll({
    where: { athleteId: athleteId },
    order: [['id', 'ASC']],
  });
  const grantIds = grantRows.map((row) => row.id);
  const allocationRows = grantIds.length
    ? await db.tables.CreditAllocations.findAll({ where: { creditGrantId: grantIds } })
    : [];
  return {
    grants: grantRows.map(toGrant),
    allocations: allocationRows.map(toAllocation),
  };
}

function toGrant(row) {
  return {
    id: row.id,
    athleteId: row.athleteId,
    source: row.source,
    label: row.label,
    quantity: row.quantity == null ? null : Number(row.quantity),
    startsAt: row.startsAt == null ? null : new Date(row.startsAt),
    expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
    originalExpiresAt: row.originalExpiresAt == null ? null : new Date(row.originalExpiresAt),
  };
}

function toAllocation(row) {
  return {
    reservationId: row.reservationId,
    creditGrantId: row.creditGrantId,
    amount: Number(row.amount),
    holding: row.holding,
  };
}

// The staff member's own profile, the same check a class notice uses.
function readSender(req) {
  const senderId = parseInt(req.body && req.body.senderAthleteProfileId, 10);
  const user = req.user || {};
  const owns = athleteProfileBelongsToUser(senderId, user)
    || athleteProfileBelongsToUser(String(senderId), user);
  if (!Number.isInteger(senderId) || senderId < 1 || !owns) {
    return { ok: false, message: 'senderAthleteProfileId is required' };
  }
  return { ok: true, senderId: senderId };
}

// A failed send does not undo the grant. Returns 1 when the message was saved.
async function sendCreditNotice(db, athleteProfileId, senderId, fields) {
  const notice = creditNotice(fields);
  if (!notice) {
    return 0;
  }
  try {
    await postAthleteNotice(db, {
      athleteProfileId: athleteProfileId,
      senderId: senderId,
      summary: notice.summary,
      body: notice.body,
    });
    return 1;
  } catch (error) {
    console.error('Error sending credit notice:', error);
    return 0;
  }
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

function coded(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
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
  listStaffCredits,
  adjustStaffCredits,
  endStaffGrant,
};
