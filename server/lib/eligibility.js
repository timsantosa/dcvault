'use strict';

// Group and age eligibility for one class date. No database.
// An athlete with no training groups counts as the `allages` catalog group for
// this check only. Nothing is saved on the profile (PRD §16 #2 stays open).

const DEFAULT_GROUP_KEY = 'allages';

// Input: session ({ occursOn 'YYYY-MM-DD', trainingGroupIds, minAge, maxAge }),
// athlete ({ firstName, dob, trainingGroups: [{ id, key, label }] }), and
// trainingGroups (the catalog, [{ id, key, label }]). Returns null when the
// athlete may join, or the reason sentences when they may not.
function eligibilityReason(input) {
  const session = input.session;
  const athlete = input.athlete || {};
  const catalog = input.trainingGroups || [];
  const name = athlete.firstName && String(athlete.firstName).trim()
    ? String(athlete.firstName).trim()
    : 'This athlete';
  const reasons = [];

  const group = groupReason(session, athlete, catalog, name);
  if (group) {
    reasons.push(group);
  }
  const age = ageReason(session, athlete.dob, name);
  if (age) {
    reasons.push(age);
  }
  return reasons.length ? reasons.join(' ') : null;
}

function groupReason(session, athlete, catalog, name) {
  const classIds = (session.trainingGroupIds || []).map(Number);
  if (!classIds.length) {
    return null;
  }
  let groups = athlete.trainingGroups || [];
  if (!groups.length) {
    groups = catalog.filter((item) => item.key === DEFAULT_GROUP_KEY);
  }
  if (groups.some((item) => classIds.indexOf(Number(item.id)) !== -1)) {
    return null;
  }
  const classLabels = catalog
    .filter((item) => classIds.indexOf(Number(item.id)) !== -1)
    .map((item) => item.label);
  const classLine = classLabels.length
    ? 'This class is ' + joinLabels(classLabels) + '.'
    : 'This class is for other training groups.';
  if (!groups.length) {
    return name + ' has no training group. ' + classLine;
  }
  return name + ' is in ' + joinLabels(groups.map((item) => item.label)) + '. ' + classLine;
}

function ageReason(session, dob, name) {
  const minAge = session.minAge == null || session.minAge === '' ? null : Number(session.minAge);
  const maxAge = session.maxAge == null || session.maxAge === '' ? null : Number(session.maxAge);
  if (minAge == null && maxAge == null) {
    return null;
  }
  const age = ageOn(dob, session.occursOn);
  if (age == null) {
    return name + '’s age is not on the profile.';
  }
  if ((minAge == null || age >= minAge) && (maxAge == null || age <= maxAge)) {
    return null;
  }
  return name + ' is ' + age + '. This class is for ' + rangeLabel(minAge, maxAge) + '.';
}

function rangeLabel(minAge, maxAge) {
  if (minAge != null && maxAge != null) {
    return minAge === maxAge ? 'age ' + minAge : 'ages ' + minAge + '–' + maxAge;
  }
  if (minAge != null) {
    return 'age ' + minAge + ' or older';
  }
  return 'age ' + maxAge + ' or younger';
}

// Completed years on the class date. dob is 'MM/DD/YYYY' or 'YYYY-MM-DD'.
// Returns null when dob is missing or not a real date.
function ageOn(dob, occursOn) {
  const birth = readDate(dob);
  const on = readDate(occursOn);
  if (!birth || !on) {
    return null;
  }
  let age = on.year - birth.year;
  if (on.month < birth.month || (on.month === birth.month && on.day < birth.day)) {
    age -= 1;
  }
  return age < 0 ? null : age;
}

function readDate(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const text = value.trim();
  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  let parts;
  if (match) {
    parts = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  } else {
    match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return null;
    }
    parts = { year: Number(match[3]), month: Number(match[1]), day: Number(match[2]) };
  }
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  if (check.getUTCFullYear() !== parts.year
    || check.getUTCMonth() !== parts.month - 1
    || check.getUTCDate() !== parts.day) {
    return null;
  }
  return parts;
}

function joinLabels(labels) {
  if (labels.length <= 1) {
    return labels.join('');
  }
  if (labels.length === 2) {
    return labels[0] + ' and ' + labels[1];
  }
  return labels.slice(0, -1).join(', ') + ', and ' + labels[labels.length - 1];
}

module.exports = {
  eligibilityReason,
  ageOn,
};
