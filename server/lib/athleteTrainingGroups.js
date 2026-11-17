'use strict';

// Profile training-group ids. readTrainingGroupIds does not read the database;
// callers load the groups that exist and pass those ids in.

function readTrainingGroupIds(value, knownIds) {
  if (!Array.isArray(value)) {
    return { ok: false, message: 'training group ids must be a list' };
  }
  const ids = [];
  const seen = {};
  const known = knownIds || [];
  for (let i = 0; i < value.length; i += 1) {
    if (!isWholeNumber(value[i]) || Number(value[i]) < 1) {
      return { ok: false, message: 'training group ids must be a list' };
    }
    const id = Number(value[i]);
    if (seen[id]) {
      return { ok: false, message: 'Duplicate training group.' };
    }
    seen[id] = true;
    if (known.indexOf(id) === -1) {
      return { ok: false, message: 'Unknown training group.' };
    }
    ids.push(id);
  }
  ids.sort((a, b) => a - b);
  return { ok: true, ids: ids };
}

// profileId -> [{ id, key, label }], each list sorted by id.
async function trainingGroupsByProfileId(db, profileIds) {
  const grouped = {};
  const ids = [];
  (profileIds || []).forEach((profileId) => {
    const id = Number(profileId);
    if (!grouped[id]) {
      grouped[id] = [];
      ids.push(id);
    }
  });
  if (!ids.length) {
    return grouped;
  }
  const rows = await db.tables.AthleteProfileTrainingGroups.findAll({
    where: { athleteProfileId: ids },
    include: [{
      model: db.tables.TrainingGroups,
      as: 'trainingGroup',
      attributes: ['id', 'key', 'label'],
    }],
  });
  rows.forEach((row) => {
    const group = row.trainingGroup;
    if (!group || !grouped[row.athleteProfileId]) {
      return;
    }
    grouped[row.athleteProfileId].push({
      id: Number(group.id),
      key: group.key,
      label: group.label,
    });
  });
  ids.forEach((id) => {
    grouped[id].sort((a, b) => a.id - b.id);
  });
  return grouped;
}

// Profile row -> { athlete: { firstName, dob, trainingGroups }, trainingGroups }
// for eligibilityReason. trainingGroups is the whole catalog.
async function loadEligibilityInput(db, profile) {
  const groups = await trainingGroupsByProfileId(db, [profile.id]);
  const rows = await db.tables.TrainingGroups.findAll({
    attributes: ['id', 'key', 'label'],
    order: [['id', 'ASC']],
  });
  return {
    athlete: {
      firstName: profile.firstName,
      dob: profile.dob,
      trainingGroups: groups[Number(profile.id)] || [],
    },
    trainingGroups: rows.map((row) => ({ id: Number(row.id), key: row.key, label: row.label })),
  };
}

function isWholeNumber(value) {
  if (typeof value === 'number') {
    return isFinite(value) && Math.floor(value) === value;
  }
  return typeof value === 'string' && /^\d+$/.test(value);
}

module.exports = {
  readTrainingGroupIds,
  trainingGroupsByProfileId,
  loadEligibilityInput,
};
