'use strict';

// Database id from a number or a digit string (query, params, body, JWT).
// Returns a positive integer, or null for anything else ('12abc', '1.5', 0, -1, '').
function parseId(value) {
  if (typeof value === 'number') {
    return Number.isInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0 ? id : null;
  }
  return null;
}

module.exports = {
  parseId,
};
