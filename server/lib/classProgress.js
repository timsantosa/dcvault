'use strict';

// Profile progress for the current quarter (PRD §10, CREDIT_INVENTORY.md §8).
// Pure functions. Callers load grants, allocations, and this profile's reservations.

const {
  seasonOf,
  resolveSeasonWindow,
  summarizeCredits,
  formatCreditChip,
} = require('./creditInventory');
const { day } = require('./dates');

// input: { now, grants, allocations, reservations: [{ occursOn, checkedInAt, classStart, paused }] }
function presentClassProgress(input) {
  const now = input.now;
  const grants = input.grants || [];
  const reservations = input.reservations || [];
  const summary = summarizeCredits({
    now: now,
    grants: grants,
    allocations: input.allocations || [],
    reservations: reservations.map((row) => ({ classStart: row.classStart, paused: row.paused })),
  });

  const season = seasonOf(now);
  const window = resolveSeasonWindow(season, now);
  const firstDay = day(window.startsAt);
  const lastDay = day(new Date(window.expiresAt.getFullYear(), window.expiresAt.getMonth(), window.expiresAt.getDate() - 1));
  const attended = reservations.filter((row) => {
    return row.checkedInAt != null && row.occursOn >= firstDay && row.occursOn <= lastDay;
  }).length;

  const finite = grants.filter((grant) => grant.quantity != null && covers(grant, now));
  const purchased = Math.max(0, finite.reduce((sum, grant) => sum + Number(grant.quantity), 0));

  return {
    seasonLabel: season.charAt(0).toUpperCase() + season.slice(1) + ' quarter',
    unlimited: summary.unlimited,
    purchased: summary.unlimited ? null : purchased,
    remaining: summary.remaining,
    reserved: summary.reserved,
    attended: attended,
    summaryText: formatCreditChip(summary),
  };
}

function canViewClassProgress(input) {
  const permissions = Array.isArray(input.permissions) ? input.permissions : [];
  if (permissions.indexOf('manage_credits') !== -1) {
    return true;
  }
  return input.ownsProfile === true && permissions.indexOf('reserve_classes') !== -1;
}

function covers(grant, instant) {
  if (grant.startsAt != null && instant < grant.startsAt) {
    return false;
  }
  if (grant.expiresAt != null && instant >= grant.expiresAt) {
    return false;
  }
  return true;
}

module.exports = {
  presentClassProgress,
  canViewClassProgress,
};
