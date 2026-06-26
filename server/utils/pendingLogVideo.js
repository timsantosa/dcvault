const { destroyJumpDrillCloudinaryAssetIfOwned } = require('../lib/cloudinaryMedia');

function normalizeStoredVideoLink(v) {
  if (v === null || v === undefined || v === '') return null;
  const s = String(v).trim();
  return s === '' ? null : s;
}

function userCanVerifyLogVideoMedia(user) {
  return !!user?.permissions?.includes('verify_images');
}

function viewerCanSeePendingLogVideo(user, athleteProfileIdBeingViewed) {
  if (!user) return false;
  if (user.permissions?.includes('verify_images')) return true;
  const pid = parseInt(athleteProfileIdBeingViewed, 10);
  if (Number.isNaN(pid)) return false;
  if (user.athleteProfileIds && Array.isArray(user.athleteProfileIds)) {
    return user.athleteProfileIds.includes(pid) || user.athleteProfileIds.includes(String(pid));
  }
  return false;
}

async function destroyRowsAndCloudinary(rows, { transaction } = {}) {
  for (const row of rows) {
    try {
      await destroyJumpDrillCloudinaryAssetIfOwned(row.videoUrl);
    } catch (e) {
      console.warn('pending log video cloud delete:', e && e.message);
    }
    await row.destroy({ transaction });
  }
}

async function destroyPendingLogVideosForJump(db, jumpId, { transaction } = {}) {
  if (!jumpId) return;
  const rows = await db.tables.PendingLogVideos.findAll({ where: { jumpId }, transaction });
  await destroyRowsAndCloudinary(rows, { transaction });
}

async function destroyPendingLogVideosForDrill(db, drillId, { transaction } = {}) {
  if (!drillId) return;
  const rows = await db.tables.PendingLogVideos.findAll({ where: { drillId }, transaction });
  await destroyRowsAndCloudinary(rows, { transaction });
}

async function clearOtherPendingLogVideosForJump(db, jumpId, keepPendingLogVideoId, { transaction } = {}) {
  if (!jumpId || !keepPendingLogVideoId) return;
  const Op = db.tables.schema.Sequelize.Op;
  const rows = await db.tables.PendingLogVideos.findAll({
    where: {
      jumpId,
      id: { [Op.ne]: keepPendingLogVideoId },
    },
    transaction,
  });
  await destroyRowsAndCloudinary(rows, { transaction });
}

async function clearOtherPendingLogVideosForDrill(db, drillId, keepPendingLogVideoId, { transaction } = {}) {
  if (!drillId || !keepPendingLogVideoId) return;
  const Op = db.tables.schema.Sequelize.Op;
  const rows = await db.tables.PendingLogVideos.findAll({
    where: {
      drillId,
      id: { [Op.ne]: keepPendingLogVideoId },
    },
    transaction,
  });
  await destroyRowsAndCloudinary(rows, { transaction });
}

async function linkPendingLogVideoToJump(db, pendingLogVideoId, jumpId, athleteProfileId, { transaction } = {}) {
  const pending = await db.tables.PendingLogVideos.findByPk(pendingLogVideoId, { transaction });
  if (!pending) {
    const err = new Error('PENDING_NOT_FOUND');
    err.statusCode = 404;
    throw err;
  }
  const aid = parseInt(athleteProfileId, 10);
  if (pending.athleteProfileId !== aid || pending.entityKind !== 'jump') {
    const err = new Error('PENDING_INVALID');
    err.statusCode = 400;
    throw err;
  }
  if (pending.jumpId && pending.jumpId !== jumpId) {
    const err = new Error('PENDING_WRONG_JUMP');
    err.statusCode = 400;
    throw err;
  }
  await clearOtherPendingLogVideosForJump(db, jumpId, pendingLogVideoId, { transaction });
  pending.jumpId = jumpId;
  await pending.save({ transaction });
}

async function linkPendingLogVideoToDrill(db, pendingLogVideoId, drillId, athleteProfileId, { transaction } = {}) {
  const pending = await db.tables.PendingLogVideos.findByPk(pendingLogVideoId, { transaction });
  if (!pending) {
    const err = new Error('PENDING_NOT_FOUND');
    err.statusCode = 404;
    throw err;
  }
  const aid = parseInt(athleteProfileId, 10);
  if (pending.athleteProfileId !== aid || pending.entityKind !== 'drill') {
    const err = new Error('PENDING_INVALID');
    err.statusCode = 400;
    throw err;
  }
  if (pending.drillId && pending.drillId !== drillId) {
    const err = new Error('PENDING_WRONG_DRILL');
    err.statusCode = 400;
    throw err;
  }
  await clearOtherPendingLogVideosForDrill(db, drillId, pendingLogVideoId, { transaction });
  pending.drillId = drillId;
  await pending.save({ transaction });
}

async function fetchPendingLogByJumpIds(db, jumpIds) {
  if (!jumpIds || jumpIds.length === 0) return new Map();
  const Op = db.tables.schema.Sequelize.Op;
  const rows = await db.tables.PendingLogVideos.findAll({
    where: {
      jumpId: { [Op.in]: jumpIds },
      entityKind: 'jump',
    },
  });
  const m = new Map();
  rows.forEach((r) => m.set(r.jumpId, r));
  return m;
}

async function fetchPendingLogByDrillIds(db, drillIds) {
  if (!drillIds || drillIds.length === 0) return new Map();
  const Op = db.tables.schema.Sequelize.Op;
  const rows = await db.tables.PendingLogVideos.findAll({
    where: {
      drillId: { [Op.in]: drillIds },
      entityKind: 'drill',
    },
  });
  const m = new Map();
  rows.forEach((r) => m.set(r.drillId, r));
  return m;
}

async function attachPendingLogVideoToJumps(jumps, db, user, athleteProfileIdBeingViewed) {
  if (!jumps || jumps.length === 0) return jumps;
  if (!viewerCanSeePendingLogVideo(user, athleteProfileIdBeingViewed)) {
    return jumps.map((j) => ({ ...j, pendingLogVideo: null }));
  }
  const ids = jumps.map((j) => j.id).filter((id) => id > 0);
  const pmap = await fetchPendingLogByJumpIds(db, ids);
  return jumps.map((j) => {
    const p = pmap.get(j.id);
    return {
      ...j,
      pendingLogVideo: p ? { id: p.id, videoUrl: p.videoUrl } : null,
    };
  });
}

async function attachPendingLogVideoToJumpSingle(jump, db, user, athleteProfileIdBeingViewed) {
  const [out] = await attachPendingLogVideoToJumps([jump], db, user, athleteProfileIdBeingViewed);
  return out;
}

async function attachPendingLogVideoToDrills(drills, db, user, athleteProfileIdBeingViewed) {
  if (!drills || drills.length === 0) return drills;
  if (!viewerCanSeePendingLogVideo(user, athleteProfileIdBeingViewed)) {
    return drills.map((d) => ({ ...d, pendingLogVideo: null }));
  }
  const ids = drills.map((d) => d.id).filter((id) => id > 0);
  const pmap = await fetchPendingLogByDrillIds(db, ids);
  return drills.map((d) => {
    const p = pmap.get(d.id);
    return {
      ...d,
      pendingLogVideo: p ? { id: p.id, videoUrl: p.videoUrl } : null,
    };
  });
}

async function attachPendingLogVideoToDrillSingle(drill, db, user, athleteProfileIdBeingViewed) {
  const [out] = await attachPendingLogVideoToDrills([drill], db, user, athleteProfileIdBeingViewed);
  return out;
}

module.exports = {
  normalizeStoredVideoLink,
  userCanVerifyLogVideoMedia,
  viewerCanSeePendingLogVideo,
  destroyPendingLogVideosForJump,
  destroyPendingLogVideosForDrill,
  linkPendingLogVideoToJump,
  linkPendingLogVideoToDrill,
  attachPendingLogVideoToJumps,
  attachPendingLogVideoToJumpSingle,
  attachPendingLogVideoToDrills,
  attachPendingLogVideoToDrillSingle,
  fetchPendingLogByJumpIds,
};
