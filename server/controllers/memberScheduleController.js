'use strict';

const { parseScheduleRange } = require('../lib/classSchedule');
const { memberScheduleRange, presentMemberSchedule } = require('../lib/memberSchedule');
const { loadExpandedSessions } = require('./classesController');

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
    const presented = presentMemberSchedule({
      sessions: sessions,
      grants: grantRows.map(toGrant),
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

function toGrant(row) {
  return {
    id: row.id,
    quantity: row.quantity == null ? null : Number(row.quantity),
    startsAt: row.startsAt == null ? null : new Date(row.startsAt),
    expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
  };
}

function athleteName(profile) {
  const parts = [profile.firstName, profile.lastName].filter((part) => {
    return part != null && String(part).trim() !== '';
  });
  if (!parts.length) {
    return 'Athlete';
  }
  return parts.join(' ');
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

module.exports = {
  getMemberSchedule,
};
