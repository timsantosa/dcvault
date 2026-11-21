'use strict';

// Date or 'YYYY-MM-DD...' string -> 'YYYY-MM-DD'. Null stays null.
// A Date uses the local calendar day.
function day(value) {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.getFullYear() + '-' + pad(value.getMonth() + 1) + '-' + pad(value.getDate());
  }
  return String(value).slice(0, 10);
}

// Time value -> 'HH:MM:SS'. Shorter text is left as-is. Null stays null.
function clock(value) {
  if (value == null) {
    return null;
  }
  const text = String(value);
  return text.length >= 8 ? text.slice(0, 8) : text;
}

// Date -> ISO string. Anything else is returned unchanged. Null stays null.
function timestamp(value) {
  if (value == null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

function pad(number) {
  return number < 10 ? '0' + number : String(number);
}

module.exports = {
  day,
  clock,
  timestamp,
};
