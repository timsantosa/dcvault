'use strict';

const { expandClassOccurrences } = require('../../lib/classSchedule');
const {
  presentClassProgress,
  presentClassHistory,
  canViewClassHistory,
  parseHistoryRange,
  historyClass,
} = require('../../lib/classHistory');
const { trainingGroupsByProfileId } = require('../../lib/athleteTrainingGroups');
const { day } = require('../../lib/dates');
const { parseId } = require('../../lib/ids');
const { classStartInstant, nyDateString } = require('../../lib/memberSchedule');
const { loadClassGraph } = require('./classesController');
const { isPaused } = require('./memberScheduleController');

// Own profile with reserve_classes, or any profile with manage_credits.
// Sends 400, 401, or 404 and returns null when the caller cannot continue.
async function loadClassRecord(req, res, db) {
  const profileId = parseId(req.query.athleteProfileId);
  if (!profileId) {
    res.status(400).json({ ok: false, message: 'athleteProfileId is required' });
    return null;
  }
  const userId = parseId(req.user && req.user.id);
  if (!userId) {
    res.status(401).json({ ok: false, message: 'Unauthorized' });
    return null;
  }
  const profile = await db.tables.AthleteProfiles.findByPk(profileId);
  if (!profile) {
    res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    return null;
  }
  const allowed = canViewClassHistory({
    permissions: req.user && req.user.permissions,
    ownsProfile: parseId(profile.userId) === userId,
  });
  // Same 404 as schedule / reservations so callers cannot probe other profiles.
  if (!allowed) {
    res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    return null;
  }

  const grantRows = profile.athleteId
    ? await db.tables.CreditGrants.findAll({ where: { athleteId: profile.athleteId } })
    : [];
  const grantIds = grantRows.map((row) => row.id);
  const allocationRows = grantIds.length
    ? await db.tables.CreditAllocations.findAll({ where: { creditGrantId: grantIds } })
    : [];
  const reservationRows = await db.tables.ClassReservations.findAll({
    where: { athleteProfileId: profileId },
  });
  const context = await reservationContext(db, reservationRows);
  const allocationsByReservation = {};
  allocationRows.forEach((row) => {
    if (!allocationsByReservation[row.reservationId]) {
      allocationsByReservation[row.reservationId] = [];
    }
    allocationsByReservation[row.reservationId].push(row);
  });
  const groups = await trainingGroupsByProfileId(db, [profileId]);

  return {
    profileId: profileId,
    grantRows: grantRows,
    allocationRows: allocationRows,
    reservationRows: reservationRows,
    starts: context.starts,
    sessions: context.sessions,
    allocationsByReservation: allocationsByReservation,
    groups: groups,
  };
}

async function getClassProgress(req, res, db) {
  try {
    const record = await loadClassRecord(req, res, db);
    if (!record) {
      return;
    }
    const presented = presentClassProgress({
      now: new Date(),
      grants: record.grantRows.map(toProgressGrant),
      allocations: record.allocationRows.map(toAllocation),
      reservations: record.reservationRows.map((row) => ({
        occursOn: day(row.occursOn),
        checkedInAt: row.checkedInAt == null ? null : new Date(row.checkedInAt),
        classStart: record.starts[row.id] || null,
        paused: isPaused(record.allocationsByReservation[row.id] || []),
      })),
    });
    res.json(Object.assign({ ok: true }, presented, {
      trainingGroups: (record.groups[record.profileId] || []).map((group) => group.label),
    }));
  } catch (error) {
    console.error('Error in getClassProgress:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

async function getClassHistory(req, res, db) {
  const now = new Date();
  try {
    const record = await loadClassRecord(req, res, db);
    if (!record) {
      return;
    }
    const range = parseHistoryRange(req.query.from, req.query.to, now);
    if (!range.ok) {
      return res.status(400).json({ ok: false, message: range.message });
    }
    const presented = presentClassHistory({
      now: now,
      today: nyDateString(now),
      from: range.from,
      to: range.to,
      grants: record.grantRows.map(toHistoryGrant),
      allocations: record.allocationRows.map(toAllocation),
      reservations: historyReservations(record.reservationRows, record.sessions),
    });
    res.json(Object.assign({ ok: true }, presented));
  } catch (error) {
    console.error('Error in getClassHistory:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

// One walk per series: start time for the meter, title and canceled for history.
async function reservationContext(db, reservations) {
  const bySeries = {};
  reservations.forEach((row) => {
    if (!bySeries[row.classSeriesId]) {
      bySeries[row.classSeriesId] = [];
    }
    bySeries[row.classSeriesId].push(row);
  });
  const starts = {};
  const sessions = {};
  const seriesIds = Object.keys(bySeries);
  for (let i = 0; i < seriesIds.length; i += 1) {
    const seriesId = Number(seriesIds[i]);
    const graph = await loadClassGraph(db, seriesId);
    const byDate = {};
    if (graph && !graph.series.deletedAt) {
      const dates = bySeries[seriesId].map((row) => day(row.occursOn)).sort();
      const expanded = expandClassOccurrences({
        series: graph.series,
        slots: graph.slots,
        occurrences: graph.occurrences,
        rangeStart: dates[0],
        rangeEnd: dates[dates.length - 1],
      });
      expanded.forEach((session) => {
        byDate[session.occursOn] = session;
      });
    }
    bySeries[seriesId].forEach((row) => {
      const session = byDate[day(row.occursOn)];
      if (session) {
        starts[row.id] = classStartInstant(session.occursOn, session.startTime);
      }
      const resolved = historyClass(session, graph ? graph.series : null);
      sessions[row.id] = { title: resolved.title, status: resolved.canceled ? 'canceled' : 'active' };
    });
  }
  return { starts: starts, sessions: sessions };
}

function historyReservations(reservationRows, sessions) {
  const rows = [];
  reservationRows.forEach((row) => {
    const session = sessions[row.id];
    if (!session || !session.title) {
      return;
    }
    rows.push({
      id: row.id,
      occursOn: day(row.occursOn),
      title: session.title,
      checkedIn: row.checkedInAt != null,
      canceled: session.status === 'canceled',
    });
  });
  return rows;
}

function toProgressGrant(row) {
  return {
    id: row.id,
    quantity: row.quantity == null ? null : Number(row.quantity),
    startsAt: row.startsAt == null ? null : new Date(row.startsAt),
    expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
  };
}

function toHistoryGrant(row) {
  return {
    id: row.id,
    label: row.label,
    quantity: row.quantity == null ? null : Number(row.quantity),
    createdAt: row.createdAt == null ? null : new Date(row.createdAt),
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

module.exports = {
  getClassProgress,
  getClassHistory,
};
