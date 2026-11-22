'use strict';

// Training group catalog rules. The key is made from the label once, at create,
// and never changes: eligibility looks groups up by key (see eligibility.js).

const MAX_LABEL_LENGTH = 255;

function fail(message) {
  return { ok: false, message: message };
}

// 'Pre-Elite Team!' -> 'pre-elite-team'
function trainingGroupKeyFromLabel(label) {
  return String(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// (body, { groups: [{ id, key, label }], currentId }) ->
//   { ok: true, value: { label, key? } } | { ok: false, message }.
// currentId null means create; the key is only returned on create.
function normalizeTrainingGroupInput(input, context) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('Group details are required.');
  }
  const label = typeof input.label === 'string' ? input.label.trim() : '';
  if (!label) {
    return fail('Name is required.');
  }
  if (label.length > MAX_LABEL_LENGTH) {
    return fail('Name is too long.');
  }
  const key = trainingGroupKeyFromLabel(label);
  if (!key) {
    return fail('Name must include a letter or number.');
  }

  const currentId = context.currentId;
  const others = context.groups.filter((group) => group.id !== currentId);
  const lowered = label.toLowerCase();
  const sameLabel = others.find((group) => String(group.label).toLowerCase() === lowered);
  if (sameLabel) {
    return fail('A group named "' + sameLabel.label + '" already exists.');
  }

  if (currentId != null) {
    return { ok: true, value: { label: label } };
  }

  const sameKey = others.find((group) => group.key === key);
  if (sameKey) {
    return fail('"' + label + '" is too close to the existing group "' + sameKey.label + '".');
  }
  return { ok: true, value: { label: label, key: key } };
}

module.exports = {
  trainingGroupKeyFromLabel,
  normalizeTrainingGroupInput,
};
