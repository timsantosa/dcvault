'use strict';

const { presentClassProgress, canViewClassProgress } = require('../../lib/classProgress');
const { trainingGroupsByProfileId } = require('../../lib/athleteTrainingGroups');
const { day } = require('../../lib/dates');
const { parseId } = require('../../lib/ids');
const { classStartsFor, isPaused } = require('./memberScheduleController');

// Own profile with reserve_classes, or any profile with manage_credits.
async function getClassProgress(req, res, db) {
  try {
    const profileId = parseId(req.query.athleteProfileId);
    if (!profileId) {
      return res.status(400).json({ ok: false, message: 'athleteProfileId is required' });
    }
    const userId = parseId(req.user && req.user.id);
    if (!userId) {
      return res.status(401).json({ ok: false, message: 'Unauthorized' });
    }
    const profile = await db.tables.AthleteProfiles.findByPk(profileId);
    if (!profile) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
    }
    const allowed = canViewClassProgress({
      permissions: req.user && req.user.permissions,
      ownsProfile: parseId(profile.userId) === userId,
    });
    // Same 404 as schedule / reservations so callers cannot probe other profiles.
    if (!allowed) {
      return res.status(404).json({ ok: false, message: 'Athlete profile not found.' });
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
    const starts = await classStartsFor(db, reservationRows);
    const allocationsByReservation = {};
    allocationRows.forEach((row) => {
      if (!allocationsByReservation[row.reservationId]) {
        allocationsByReservation[row.reservationId] = [];
      }
      allocationsByReservation[row.reservationId].push(row);
    });
    const groups = await trainingGroupsByProfileId(db, [profileId]);

    const presented = presentClassProgress({
      now: new Date(),
      grants: grantRows.map((row) => ({
        id: row.id,
        quantity: row.quantity == null ? null : Number(row.quantity),
        startsAt: row.startsAt == null ? null : new Date(row.startsAt),
        expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
      })),
      allocations: allocationRows.map((row) => ({
        reservationId: row.reservationId,
        creditGrantId: row.creditGrantId,
        amount: Number(row.amount),
        holding: row.holding,
      })),
      reservations: reservationRows.map((row) => ({
        occursOn: day(row.occursOn),
        checkedInAt: row.checkedInAt == null ? null : new Date(row.checkedInAt),
        classStart: starts[row.id] || null,
        paused: isPaused(allocationsByReservation[row.id] || []),
      })),
    });

    res.json(Object.assign({ ok: true }, presented, {
      trainingGroups: (groups[profileId] || []).map((group) => group.label),
    }));
  } catch (error) {
    console.error('Error in getClassProgress:', error);
    res.status(500).json({ ok: false, message: 'Internal server error.' });
  }
}

module.exports = {
  getClassProgress,
};
