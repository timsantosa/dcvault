'use strict';

function isValidPackageCreditCount(value) {
  if (value == null) {
    return true;
  }
  return Number.isInteger(value) && value >= 1;
}

function assertValidPackageCreditCount(value) {
  if (!isValidPackageCreditCount(value)) {
    throw new Error('creditCount must be null (unlimited) or an integer of 1 or more');
  }
}

module.exports = {
  isValidPackageCreditCount,
  assertValidPackageCreditCount,
};
