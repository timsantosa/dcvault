'use strict';

const { isValidPackageCreditCount } = require('../db/classPackageCreditCount');

const AUDIENCE_SLUG = /^[a-z][a-z0-9-]*$/;
const MAX_NAME_LENGTH = 255;
const MAX_AUDIENCE_LENGTH = 64;

function fail(message) {
  return { ok: false, message: message };
}

function parsePrice(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) {
      return null;
    }
    const rounded = Math.round(value * 100) / 100;
    if (Math.abs(value - rounded) > 1e-8) {
      return null;
    }
    return rounded.toFixed(2);
  }
  if (typeof value !== 'string') {
    return null;
  }
  const text = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(text)) {
    return null;
  }
  return Number(text).toFixed(2);
}

function parseStrictInt(value) {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return value;
  }
  if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
    return parseInt(value.trim(), 10);
  }
  return null;
}

function normalizeClassPackageInput(input, context) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('Package details are required.');
  }

  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (!name) {
    return fail('Name is required.');
  }
  if (name.length > MAX_NAME_LENGTH) {
    return fail('Name is too long.');
  }

  const price = parsePrice(input.price);
  if (price == null) {
    return fail('Price must be zero or more, with at most two decimal places.');
  }

  if (typeof input.audience !== 'string') {
    return fail('Group is required.');
  }
  const audience = input.audience.trim().toLowerCase();
  if (!audience || audience.length > MAX_AUDIENCE_LENGTH || !AUDIENCE_SLUG.test(audience)) {
    return fail('Group must be a short key such as fly-kids, adult, allages, or elite.');
  }

  let creditCount;
  if (input.unlimited === true) {
    const countWasSent = input.creditCount != null && input.creditCount !== '';
    if (countWasSent) {
      return fail('Choose unlimited or a credit count, not both.');
    }
    creditCount = null;
  } else {
    const countMissing = input.creditCount == null || input.creditCount === '';
    if (countMissing) {
      return fail('Enter a credit count, or turn on Unlimited.');
    }
    const parsedCount = parseStrictInt(input.creditCount);
    if (!isValidPackageCreditCount(parsedCount) || parsedCount == null) {
      return fail('Credit count must be a whole number of 1 or more.');
    }
    creditCount = parsedCount;
  }

  let inviteLevel = null;
  const inviteMissing = input.inviteLevel == null || input.inviteLevel === '';
  if (!inviteMissing) {
    const parsedLevel = parseStrictInt(input.inviteLevel);
    if (parsedLevel == null || parsedLevel < 1 || parsedLevel > 5) {
      return fail('Invite level must be from 1 to 5, or empty for everyone.');
    }
    inviteLevel = parsedLevel;
  }

  let active = true;
  if (input.active !== undefined) {
    if (typeof input.active !== 'boolean') {
      return fail('Show on website must be on or off.');
    }
    active = input.active;
  }

  const packages = (context && context.packages) || [];
  const currentId = context && context.currentId != null ? context.currentId : null;
  const duplicate = packages.some((pkg) => {
    if (currentId != null && pkg.id === currentId) {
      return false;
    }
    return pkg.audience === audience && pkg.name === name;
  });
  if (duplicate) {
    return fail('A package with this name already exists in that group.');
  }

  return {
    ok: true,
    value: {
      name: name,
      price: price,
      audience: audience,
      creditCount: creditCount,
      inviteLevel: inviteLevel,
      active: active,
    },
  };
}

function sortOrdersForSection(orderedIds, sectionIds) {
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return fail('Choose an order for the packages in this group.');
  }
  if (!Array.isArray(sectionIds)) {
    return fail('That group has no packages.');
  }

  const ids = [];
  for (let i = 0; i < orderedIds.length; i += 1) {
    const id = parseStrictInt(orderedIds[i]);
    if (id == null || id < 1) {
      return fail('Package order contains an invalid id.');
    }
    ids.push(id);
  }

  const seen = Object.create(null);
  for (let i = 0; i < ids.length; i += 1) {
    if (seen[ids[i]]) {
      return fail('Package order lists the same package twice.');
    }
    seen[ids[i]] = true;
  }

  if (ids.length !== sectionIds.length) {
    return fail('Order must include every package in the group.');
  }

  const sectionSet = Object.create(null);
  for (let i = 0; i < sectionIds.length; i += 1) {
    sectionSet[sectionIds[i]] = true;
  }
  for (let i = 0; i < ids.length; i += 1) {
    if (!sectionSet[ids[i]]) {
      return fail('A package in this order is not in that group.');
    }
  }

  return {
    ok: true,
    updates: ids.map((id, index) => ({ id: id, sortOrder: index + 1 })),
  };
}

function toClassPackageJson(row) {
  const priceNumber = Number(row.price);
  return {
    id: row.id,
    name: row.name,
    price: Number.isFinite(priceNumber) ? priceNumber.toFixed(2) : String(row.price),
    audience: row.audience,
    creditCount: row.creditCount == null ? null : row.creditCount,
    inviteLevel: row.inviteLevel == null ? null : row.inviteLevel,
    active: row.active === true || row.active === 1,
    sortOrder: row.sortOrder,
  };
}

module.exports = {
  normalizeClassPackageInput,
  sortOrdersForSection,
  toClassPackageJson,
};
