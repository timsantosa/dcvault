'use strict';

const { Op } = require('sequelize');
const { parseScheduleRange, expandClassOccurrences } = require('../../lib/classSchedule');
const { day } = require('../../lib/dates');
const { memberScheduleRange, presentMemberSchedule, classStartInstant } = require('../../lib/memberSchedule');
const { loadExpandedSessions, loadClassGraph } = require('./classesController');

async function getMemberSchedule(req, res, db) {
  try {
    const profileId = parseInt(req.query.athleteProfileId, 10);
    if (!Number.isInteger(profileId) || profileId < 1) {
      return res.status(400).json({ ok: false, message: 'athleteProfileId is required' });
    }
    const userId = callerId(req);
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }

    const now = new Date();
    let from;
    let to;
    if (req.query.from == null && req.query.to == null) {
      const range = memberScheduleRange(now);
      from = range.from;
      to = range.to;
    } else {
      const parsed = parseScheduleRange(req.query.from, req.query.to);
      if (!parsed.ok) {
        return res.status(400).json({ ok: false, message: parsed.message });
      }
      from = parsed.value.from;
      to = parsed.value.to;
    }

    const profile = await db.tables.AthleteProfiles.findOne({
      where: { id: profileId, userId: userId },
    });
    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }

    const grantRows = profile.athleteId
      ? await db.tables.CreditGrants.findAll({ where: { athleteId: profile.athleteId } })
      : [];
    const sessions = await loadExpandedSessions(db, from, to);
    const signupRows = await db.tables.ClassReservations.findAll({
      where: { occursOn: { [Op.gte]: from, [Op.lte]: to } },
    });
    const myReservations = await db.tables.ClassReservations.findAll({
      where: { athleteProfileId: profileId },
    });
    const grantIds = grantRows.map((row) => row.id);
    const allocationRows = grantIds.length
      ? await db.tables.CreditAllocations.findAll({ where: { creditGrantId: grantIds } })
      : [];
    const starts = await classStartsFor(db, myReservations);
    const allocationsByReservation = {};
    allocationRows.forEach((row) => {
      if (!allocationsByReservation[row.reservationId]) {
        allocationsByReservation[row.reservationId] = [];
      }
      allocationsByReservation[row.reservationId].push(row);
    });
    const presented = presentMemberSchedule({
      sessions: sessions,
      grants: grantRows.map(toGrant),
      allocations: allocationRows.map(toAllocation),
      signups: signupCounts(signupRows, profileId),
      chipReservations: myReservations.map((row) => ({
        classStart: starts[row.id] || null,
        paused: isPaused(allocationsByReservation[row.id] || []),
      })),
      now: now,
    });

    res.json({
      ok: true,
      today: presented.today,
      from: from,
      to: to,
      athleteName: athleteName(profile),
      chipText: presented.chipText,
      needsRegistration: presented.needsRegistration,
      sessions: presented.sessions,
    });
  } catch (error) {
    console.error('Error in getMemberSchedule:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

// Reservation rows -> { [reservationId]: Date }. Skips a deleted series or a missing date.
async function classStartsFor(db, reservations) {
  const bySeries = {};
  reservations.forEach((row) => {
    if (!bySeries[row.classSeriesId]) {
      bySeries[row.classSeriesId] = [];
    }
    bySeries[row.classSeriesId].push(row);
  });
  const starts = {};
  const seriesIds = Object.keys(bySeries);
  for (let i = 0; i < seriesIds.length; i += 1) {
    const seriesId = Number(seriesIds[i]);
    const graph = await loadClassGraph(db, seriesId);
    if (!graph || graph.series.deletedAt) {
      continue;
    }
    const dates = bySeries[seriesId].map((row) => day(row.occursOn)).sort();
    const sessions = expandClassOccurrences({
      series: graph.series,
      slots: graph.slots,
      occurrences: graph.occurrences,
      rangeStart: dates[0],
      rangeEnd: dates[dates.length - 1],
    });
    const byDate = {};
    sessions.forEach((session) => {
      byDate[session.occursOn] = session;
    });
    bySeries[seriesId].forEach((row) => {
      const session = byDate[day(row.occursOn)];
      if (!session) {
        return;
      }
      starts[row.id] = classStartInstant(session.occursOn, session.startTime);
    });
  }
  return starts;
}

// (reservation rows, profileId) -> [{ seriesId, occursOn, spotsTaken, reserved }].
function signupCounts(rows, profileId) {
  const grouped = {};
  rows.forEach((row) => {
    const occursOn = day(row.occursOn);
    const key = row.classSeriesId + '|' + occursOn;
    if (!grouped[key]) {
      grouped[key] = {
        seriesId: row.classSeriesId,
        occursOn: occursOn,
        spotsTaken: 0,
        reserved: false,
      };
    }
    grouped[key].spotsTaken += 1;
    if (row.athleteProfileId === profileId) {
      grouped[key].reserved = true;
    }
  });
  return Object.keys(grouped).map((key) => grouped[key]);
}

// True when every allocation is paused. No rows means the signup is not paused.
function isPaused(rows) {
  if (!rows.length) {
    return false;
  }
  return rows.every((row) => row.holding === false || row.holding === 0);
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

// Grant row -> { id, quantity, startsAt, expiresAt }.
function toGrant(row) {
  return {
    id: row.id,
    quantity: row.quantity == null ? null : Number(row.quantity),
    startsAt: row.startsAt == null ? null : new Date(row.startsAt),
    expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
  };
}

// First and last name, or "Athlete".
function athleteName(profile) {
  const parts = [profile.firstName, profile.lastName].filter((part) => {
    return part != null && String(part).trim() !== '';
  });
  if (!parts.length) {
    return 'Athlete';
  }
  return parts.join(' ');
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

module.exports = {
  getMemberSchedule,
};
