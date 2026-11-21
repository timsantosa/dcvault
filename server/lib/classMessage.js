'use strict';

// Message all for one class date. Callers load the signups and the current
// participants, then post through the existing message send. Walk-ins stay
// on the roster. Email, SMS, and deletion are not done here.

const MESSAGE_LIMIT = 8000;
const NAME_LIMIT = 255;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// manage_classes or manage_attendance. manage_conversations is not enough.
function canMessageClass(permissions) {
  const list = Array.isArray(permissions) ? permissions : [];
  return list.indexOf('manage_classes') !== -1 || list.indexOf('manage_attendance') !== -1;
}

// Body -> { ok, seriesId, occursOn, message, senderId }. The caller checks
// that the sender profile belongs to the signed-in user.
function readClassMessage(body, userOwns) {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'seriesId is required' };
  }
  const seriesId = parseInt(body.seriesId, 10);
  const occursOn = typeof body.occursOn === 'string' ? body.occursOn.slice(0, 10) : '';
  if (!Number.isInteger(seriesId) || seriesId < 1) {
    return { ok: false, message: 'seriesId is required' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(occursOn)) {
    return { ok: false, message: 'occursOn is required' };
  }
  const text = readClassMessageText(body.message);
  if (!text.ok) {
    return text;
  }
  const senderId = parseInt(body.senderAthleteProfileId, 10);
  if (!Number.isInteger(senderId) || senderId < 1 || !userOwns(senderId)) {
    return { ok: false, message: 'senderAthleteProfileId is required' };
  }
  return {
    ok: true,
    seriesId: seriesId,
    occursOn: occursOn,
    message: text.value,
    senderId: senderId,
  };
}

function readClassMessageText(value) {
  if (typeof value !== 'string') {
    return { ok: false, message: 'message must be text' };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: false, message: 'message is required' };
  }
  if (trimmed.length > MESSAGE_LIMIT) {
    return { ok: false, message: 'message must be 8000 characters or less' };
  }
  return { ok: true, value: trimmed };
}

// { title, occursOn, senderId, signups, participants }
// -> membership changes for that date, or { ok:false } when nobody is signed up.
// signups include walk-ins. The sender is an admin and is not also a member.
// An admin who already sent stays even after they leave the class.
function classMessagePlan(input) {
  const source = input || {};
  const senderId = Number(source.senderId);
  const roster = rosterIds(source.signups);
  if (roster.length === 0) {
    return { ok: false, message: 'No one is on this class yet.' };
  }
  const current = {};
  (source.participants || []).forEach((row) => {
    const id = profileId(row && row.athleteProfileId);
    if (id == null) {
      return;
    }
    current[id] = row.role === 'admin' ? 'admin' : String(row.role || 'member');
  });

  const desired = {};
  Object.keys(current).forEach((key) => {
    const id = Number(key);
    if (current[id] === 'admin') {
      desired[id] = 'admin';
    }
  });
  if (Number.isInteger(senderId) && senderId > 0) {
    desired[senderId] = 'admin';
  }
  roster.forEach((id) => {
    if (!desired[id]) {
      desired[id] = 'member';
    }
  });

  const add = [];
  const remove = [];
  const roleChanges = [];
  Object.keys(desired).forEach((key) => {
    const id = Number(key);
    if (!current[id]) {
      add.push({ athleteProfileId: id, role: desired[id] });
    } else if (current[id] !== desired[id]) {
      roleChanges.push({ athleteProfileId: id, role: desired[id] });
    }
  });
  Object.keys(current).forEach((key) => {
    const id = Number(key);
    if (!desired[id]) {
      remove.push(id);
    }
  });

  const memberIds = Object.keys(desired)
    .map((key) => Number(key))
    .filter((id) => desired[id] === 'member');

  add.sort(byProfile);
  roleChanges.sort(byProfile);
  remove.sort(byNumber);
  memberIds.sort(byNumber);

  return {
    ok: true,
    name: classConversationName(source.title, source.occursOn),
    memberIds: memberIds,
    add: add,
    remove: remove,
    roleChanges: roleChanges,
  };
}

function classConversationName(title, occursOn) {
  const name = text(title) || 'Class';
  const full = name + ' · ' + dateLabel(occursOn);
  return full.length > NAME_LIMIT ? full.slice(0, NAME_LIMIT) : full;
}

function rosterIds(signups) {
  const seen = {};
  const ids = [];
  (signups || []).forEach((row) => {
    const id = profileId(row && row.athleteProfileId);
    if (id == null || seen[id]) {
      return;
    }
    seen[id] = true;
    ids.push(id);
  });
  return ids;
}

function profileId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

function text(value) {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim();
}

function dateLabel(iso) {
  const parts = String(iso == null ? '' : iso).split('-');
  const month = MONTHS[Number(parts[1]) - 1];
  if (!month || parts[2] == null || parts[2] === '') {
    return String(iso == null ? '' : iso);
  }
  return month + ' ' + Number(parts[2]);
}

function byProfile(a, b) {
  return a.athleteProfileId - b.athleteProfileId;
}

function byNumber(a, b) {
  return a - b;
}

module.exports = {
  canMessageClass,
  readClassMessage,
  classMessagePlan,
};
