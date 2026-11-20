'use strict';

// One notice for a class cancel, time change, or location change. Callers
// load reservations and send the message. A past date is left out. Restore,
// delete, and every other edit produce nothing.

const { day } = require('./dates');
const { reservationEffects, sessionOnDate } = require('./reservations');

const ADDRESS_KEYS = ['line1', 'line2', 'city', 'state', 'zip', 'country'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// (before graph, after graph, reservation rows) -> pairs for classNotice.
// A moved date is paired with the session it lands on.
function pairsForNotice(before, after, reservations) {
  const rows = reservations || [];
  const effects = reservationEffects(before, after, rows.map((row) => row.occursOn));
  const moved = {};
  effects.moves.forEach((move) => {
    moved[move.from] = move.to;
  });
  return rows.map((row) => {
    const from = day(row.occursOn);
    const to = moved[from] || from;
    return {
      athleteProfileId: Number(row.athleteProfileId),
      before: snapshot(from ? sessionOnDate(before, from) : null),
      after: snapshot(to ? sessionOnDate(after, to) : null),
    };
  });
}

const NOTICE_LIMIT = 500;

// Notify on: message is optional text. The caller checks that the sender
// profile belongs to the signed-in user.
function readNoticeRequest(body, telling, userOwns) {
  const message = readNoticeMessage(body && body.message);
  if (!message.ok) {
    return message;
  }
  if (!telling) {
    return { ok: true, message: null, senderId: null };
  }
  const senderId = parseInt(body && body.senderAthleteProfileId, 10);
  if (!Number.isInteger(senderId) || senderId < 1 || !userOwns(senderId)) {
    return { ok: false, message: 'senderAthleteProfileId is required' };
  }
  return { ok: true, message: message.value, senderId: senderId };
}

function readNoticeMessage(value) {
  if (value == null || value === '') {
    return { ok: true, value: null };
  }
  if (typeof value !== 'string') {
    return { ok: false, message: 'message must be text' };
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return { ok: true, value: null };
  }
  if (trimmed.length > NOTICE_LIMIT) {
    return { ok: false, message: 'message must be 500 characters or less' };
  }
  return { ok: true, value: trimmed };
}

// { title, seriesId, note, today, reservations: [{ athleteProfileId, before, after }] }
// -> { notices: [{ athleteProfileId, summary, note, body }] } or null.
// Each athlete gets one message. Each of their dates is its own sentence.
function classNotice(input) {
  const today = input.today;
  const note = cleanNote(input.note);
  const byAthlete = {};
  (input.reservations || []).forEach((row) => {
    const athleteProfileId = Number(row && row.athleteProfileId);
    if (!Number.isInteger(athleteProfileId) || athleteProfileId < 1) {
      return;
    }
    const change = describeChange(row.before, row.after);
    if (!change) {
      return;
    }
    const when = change.after.occursOn;
    if (today && when && when < today) {
      return;
    }
    if (!byAthlete[athleteProfileId]) {
      byAthlete[athleteProfileId] = [];
    }
    byAthlete[athleteProfileId].push(change);
  });
  const notices = Object.keys(byAthlete).map(Number).sort((a, b) => a - b).map((athleteProfileId) => {
    const changes = byAthlete[athleteProfileId];
    const lines = changes.map((change) => lineFor(input.title, change));
    const summary = lines[0];
    const links = classLinks(input.seriesId, changes);
    const text = [lines.join('\n'), note, links].filter(Boolean).join('\n');
    return {
      athleteProfileId: athleteProfileId,
      summary: summary,
      note: note,
      body: text,
    };
  });
  if (!notices.length) {
    return null;
  }
  return { notices: notices };
}

function snapshot(session) {
  if (!session) {
    return null;
  }
  return {
    occursOn: session.occursOn,
    startTime: session.startTime,
    endTime: session.endTime,
    status: session.status,
    location: session.location == null ? null : session.location,
    locationAddress: session.locationAddress == null ? null : session.locationAddress,
  };
}

function describeChange(before, after) {
  if (!before || !after) {
    return null;
  }
  const becameCanceled = before.status !== 'canceled' && after.status === 'canceled';
  const timeChanged = timeKey(before.startTime) !== timeKey(after.startTime)
    || timeKey(before.endTime) !== timeKey(after.endTime);
  const dateChanged = before.occursOn !== after.occursOn;
  const locationChanged = text(before.location) !== text(after.location)
    || addressKey(before.locationAddress) !== addressKey(after.locationAddress);
  if (!becameCanceled && !timeChanged && !dateChanged && !locationChanged) {
    return null;
  }
  return {
    before: before,
    after: after,
    becameCanceled: becameCanceled,
    timeChanged: timeChanged,
    dateChanged: dateChanged,
    locationChanged: locationChanged,
  };
}

function lineFor(title, change) {
  const name = text(title) || 'Class';
  const on = name + ' on ' + dateLabel(change.before.occursOn);
  if (onlyCancel(change)) {
    return on + ' at ' + clockLabel(change.before.startTime) + ' is canceled.';
  }
  if (onlyLocation(change)) {
    return locationLine(on, change);
  }
  if (dateMove(change)) {
    const landed = dateLabel(change.after.occursOn) + ' at ' + clockLabel(change.after.startTime);
    if (timeKey(change.before.startTime) === timeKey(change.after.startTime)) {
      return on + ' moved to ' + landed + '.';
    }
    return on + ' at ' + clockLabel(change.before.startTime) + ' moved to ' + landed + '.';
  }
  if (onlyTime(change)) {
    return timeLine(on, change);
  }
  return on + ' changed: ' + mixedDetail(change) + '.';
}

function locationLine(on, change) {
  const next = placeLabel(change.after, change.before);
  const previous = placeLabel(change.before, change.after);
  if (previous && next && previous !== next) {
    return on + ' location changed from ' + previous + ' to ' + next + '.';
  }
  if (next) {
    return on + ' location is now ' + next + '.';
  }
  return on + ' has a new location.';
}

function timeLine(on, change) {
  const startChanged = timeKey(change.before.startTime) !== timeKey(change.after.startTime);
  const endChanged = timeKey(change.before.endTime) !== timeKey(change.after.endTime);
  if (startChanged && !endChanged) {
    return on + ' moved from ' + clockLabel(change.before.startTime) + ' to ' + clockLabel(change.after.startTime) + '.';
  }
  if (!startChanged && endChanged) {
    return on + ' now ends at ' + clockLabel(change.after.endTime) + ' instead of ' + clockLabel(change.before.endTime) + '.';
  }
  return on + ' moved from ' + rangeLabel(change.before) + ' to ' + rangeLabel(change.after) + '.';
}

function mixedDetail(change) {
  const parts = [];
  if (change.becameCanceled) {
    parts.push('canceled');
  }
  if (change.dateChanged) {
    parts.push('date ' + dateLabel(change.before.occursOn) + ' → ' + dateLabel(change.after.occursOn));
  }
  if (change.timeChanged) {
    parts.push('time ' + clockLabel(change.before.startTime) + ' → ' + clockLabel(change.after.startTime));
  }
  if (change.locationChanged) {
    const previous = placeLabel(change.before, change.after) || 'none';
    const next = placeLabel(change.after, change.before) || 'none';
    parts.push('location ' + previous + ' → ' + next);
  }
  return parts.join(', ');
}

function classLinks(seriesId, changes) {
  const id = Number(seriesId);
  if (!Number.isInteger(id) || id < 1) {
    return '';
  }
  const seen = {};
  const links = [];
  changes.forEach((change) => {
    const occursOn = change.after && change.after.occursOn;
    if (!occursOn || seen[occursOn]) {
      return;
    }
    seen[occursOn] = true;
    const label = changes.length === 1 ? 'View class' : 'View ' + dateLabel(occursOn);
    links.push('[[class:' + id + ':' + occursOn + '|' + label + ']]');
  });
  return links.join('\n');
}

function placeLabel(session, other) {
  const name = text(session.location);
  const otherName = text(other.location);
  if (name && name !== otherName) {
    return name;
  }
  const address = addressLine(session.locationAddress);
  const otherAddress = addressLine(other.locationAddress);
  if (address && address !== otherAddress) {
    return address;
  }
  return name || address;
}

function rangeLabel(session) {
  return clockLabel(session.startTime) + '–' + clockLabel(session.endTime);
}

function onlyCancel(change) {
  return change.becameCanceled && !change.timeChanged && !change.dateChanged && !change.locationChanged;
}

function onlyLocation(change) {
  return change.locationChanged && !change.becameCanceled && !change.timeChanged && !change.dateChanged;
}

function onlyTime(change) {
  return change.timeChanged && !change.becameCanceled && !change.dateChanged && !change.locationChanged;
}

function dateMove(change) {
  return change.dateChanged && !change.becameCanceled && !change.locationChanged;
}

function addressLine(address) {
  if (!address || typeof address !== 'object') {
    return '';
  }
  const line1 = text(address.line1);
  const city = text(address.city);
  if (line1 && city) {
    return line1 + ', ' + city;
  }
  return line1 || city;
}

function addressKey(address) {
  if (!address || typeof address !== 'object') {
    return '';
  }
  return ADDRESS_KEYS.map((key) => text(address[key])).join('|');
}

function timeKey(value) {
  if (value == null) {
    return '';
  }
  const match = /^(\d{2}):(\d{2})/.exec(String(value).trim());
  if (!match) {
    return String(value).trim();
  }
  return match[1] + ':' + match[2];
}

function clockLabel(value) {
  const key = timeKey(value);
  const parts = key.split(':');
  const minute = parts[1];
  let hour = Number(parts[0]);
  if (!minute || Number.isNaN(hour)) {
    return key;
  }
  const suffix = hour >= 12 ? 'PM' : 'AM';
  hour %= 12;
  if (hour === 0) {
    hour = 12;
  }
  return hour + ':' + minute + ' ' + suffix;
}

function dateLabel(iso) {
  const parts = String(iso).split('-');
  const month = MONTHS[Number(parts[1]) - 1];
  if (!month || !parts[2]) {
    return iso;
  }
  return month + ' ' + Number(parts[2]);
}

function cleanNote(note) {
  if (typeof note !== 'string') {
    return null;
  }
  const trimmed = note.trim();
  return trimmed || null;
}

function text(value) {
  if (value == null) {
    return '';
  }
  return String(value).trim();
}

module.exports = {
  pairsForNotice,
  classNotice,
  readNoticeRequest,
};
