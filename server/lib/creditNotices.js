'use strict';

// One notice when staff add, remove, or end credits. Callers post it into
// the athlete's Notifications conversation. A class link and a staff note
// are not part of this message.

const { lastInclusiveDay } = require('./creditInventory');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// { kind: 'add'|'remove'|'end', quantity, expiresAt }
// quantity null is unlimited. A remove count may be negative.
// -> { summary, body } or null.
function creditNotice(input) {
  const source = input || {};
  const through = throughLabel(source.expiresAt);
  if (source.kind === 'add') {
    return addNotice(source.quantity, through);
  }
  if (source.kind === 'remove') {
    return removeNotice(source.quantity, through);
  }
  if (source.kind === 'end') {
    return endNotice(source.quantity, through);
  }
  return null;
}

function addNotice(quantity, through) {
  if (quantity == null) {
    const text = through
      ? 'Unlimited classes were added through ' + through + '.'
      : 'Unlimited classes were added.';
    return { summary: text, body: text };
  }
  const summary = countLabel(quantity) + (isOne(quantity) ? ' was added.' : ' were added.');
  if (!through) {
    return { summary: summary, body: summary };
  }
  const body = summary + (isOne(quantity) ? ' It expires ' : ' They expire ') + through + '.';
  return { summary: summary, body: body };
}

function removeNotice(quantity, through) {
  const summary = countLabel(quantity) + (isOne(quantity) ? ' was removed.' : ' were removed.');
  if (!through) {
    return { summary: summary, body: summary };
  }
  const body = summary + (isOne(quantity) ? ' It applied through ' : ' They applied through ') + through + '.';
  return { summary: summary, body: body };
}

function endNotice(quantity, through) {
  let text;
  if (quantity == null) {
    text = through ? 'Unlimited classes ended ' + through + '.' : 'Unlimited classes ended.';
  } else if (isOne(quantity)) {
    text = through ? '1 class ended ' + through + '.' : '1 class ended.';
  } else {
    const count = String(Math.abs(Number(quantity)));
    text = through ? count + ' classes ended ' + through + '.' : count + ' classes ended.';
  }
  return { summary: text, body: text };
}

function countLabel(quantity) {
  const count = Math.abs(Number(quantity));
  if (count === 1) {
    return '1 class';
  }
  return count + ' classes';
}

function isOne(quantity) {
  return Math.abs(Number(quantity)) === 1;
}

function throughLabel(expiresAt) {
  if (expiresAt == null) {
    return null;
  }
  const date = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (isNaN(date.getTime())) {
    return null;
  }
  const day = lastInclusiveDay(date);
  if (!day) {
    return null;
  }
  return MONTHS[day.getMonth()] + ' ' + day.getDate();
}

module.exports = {
  creditNotice,
};
