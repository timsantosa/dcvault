'use strict';

// Staff class CRUD. The notify flag is accepted and echoed. Sending the class
// message is task 12.2.

const {
  expandClassOccurrences,
  parseScheduleRange,
  prepareClassCreate,
  prepareClassUpdate,
  prepareClassCancel,
  prepareClassDelete,
} = require('../../lib/classSchedule');
const { day, clock, timestamp } = require('../../lib/dates');
const { classStartInstant } = require('../../lib/memberSchedule');
const { reservationEffects, reallocatePaused, sessionOnDate } = require('../../lib/reservations');

async function listClasses(req, res, db) {
  try {
    const range = parseScheduleRange(req.query.from, req.query.to);
    if (!range.ok) {
      return res.status(400).json({ ok: false, message: range.message });
    }
    const sessions = await loadExpandedSessions(db, range.value.from, range.value.to);
    res.json({ ok: true, sessions: sessions });
  } catch (error) {
    sendError(res, error, 'Error in listClasses:');
  }
}

// (from, to 'YYYY-MM-DD') -> expanded sessions for every live series.
async function loadExpandedSessions(db, from, to) {
  const rows = await db.tables.ClassSeries.findAll({
    where: { deletedAt: null },
    include: seriesInclude(db),
  });
  const sessions = [];
  rows.forEach((row) => {
    const graph = graphFromRow(row);
    expandClassOccurrences({
      series: graph.series,
      slots: graph.slots,
      occurrences: graph.occurrences,
      rangeStart: from,
      rangeEnd: to,
    }).forEach((session) => {
      sessions.push(session);
    });
  });
  sessions.sort(compareSessions);
  return sessions;
}

async function getClass(req, res, db) {
  try {
    const row = await findLiveSeries(req, res, db);
    if (!row) {
      return;
    }
    res.json({ ok: true, classSeries: toClassSeriesJson(row) });
  } catch (error) {
    sendError(res, error, 'Error in getClass:');
  }
}

async function createClass(req, res, db) {
  try {
    const known = await loadKnownIds(db, req.body);
    const prepared = prepareClassCreate(req.body, known);
    if (!prepared.ok) {
      return res.status(400).json({ ok: false, message: prepared.message });
    }
    let seriesId;
    await db.tables.schema.transaction(async (transaction) => {
      const created = await db.tables.ClassSeries.create(Object.assign({
        createdByUserId: callerId(req),
      }, prepared.value.series), { transaction: transaction });
      seriesId = created.id;
      await replaceChildren(db, seriesId, prepared.value, transaction);
    });
    const row = await loadSeries(db, seriesId);
    res.status(201).json({ ok: true, classSeries: toClassSeriesJson(row) });
  } catch (error) {
    sendError(res, error, 'Error in createClass:');
  }
}

async function updateClass(req, res, db) {
  try {
    await writeClass(req, res, db, (graph, known) => prepareClassUpdate(graph, req.body, known));
  } catch (error) {
    sendError(res, error, 'Error in updateClass:');
  }
}

async function cancelClass(req, res, db) {
  try {
    const now = new Date().toISOString();
    await writeClass(req, res, db, (graph) => prepareClassCancel(graph, req.body, now));
  } catch (error) {
    sendError(res, error, 'Error in cancelClass:');
  }
}

async function deleteClass(req, res, db) {
  try {
    const now = new Date().toISOString();
    await writeClass(req, res, db, (graph) => prepareClassDelete(graph, req.body, now));
  } catch (error) {
    sendError(res, error, 'Error in deleteClass:');
  }
}

// Shared update, cancel, and delete. prepareFor(graph, known) -> { ok, value }.
async function writeClass(req, res, db, prepareFor) {
  const row = await findLiveSeries(req, res, db);
  if (!row) {
    return;
  }
  const known = await loadKnownIds(db, req.body);
  const prepared = prepareFor(graphFromRow(row), known);
  if (!prepared.ok) {
    res.status(400).json({ ok: false, message: prepared.message });
    return;
  }
  const saved = await savePrepared(db, row, prepared.value);
  if (!saved.ok) {
    res.status(saved.status).json({ ok: false, message: saved.message });
    return;
  }
  const reloaded = await loadSeries(db, row.id);
  res.json({
    ok: true,
    classSeries: toClassSeriesJson(reloaded),
    notifyRequested: prepared.value.notifyRequested,
  });
}

// Load a non-deleted series, or send 400/404 and return null.
async function findLiveSeries(req, res, db) {
  const id = parseRouteId(req.params.id);
  if (!id) {
    res.status(400).json({ ok: false, message: 'Invalid class id.' });
    return null;
  }
  const row = await loadSeries(db, id);
  if (!row || row.deletedAt) {
    res.status(404).json({ ok: false, message: 'Class not found.' });
    return null;
  }
  return row;
}

// Series row with slots, occurrences, coaches, and groups.
function loadSeries(db, id, transaction) {
  const options = { include: seriesInclude(db) };
  if (transaction) {
    options.transaction = transaction;
  }
  return db.tables.ClassSeries.findByPk(id, options);
}

// Series id -> { series, slots, occurrences }, or null.
function loadClassGraph(db, id, transaction) {
  return loadSeries(db, id, transaction).then((row) => (row ? graphFromRow(row) : null));
}

// (series row, prepared) -> { ok: true } or { ok: false, status, message }. 404 and 409 stay in that result.
async function savePrepared(db, row, prepared) {
  try {
    await db.tables.schema.transaction(async (transaction) => {
      const locked = await db.tables.ClassSeries.findByPk(row.id, {
        transaction: transaction,
        lock: transaction.LOCK.UPDATE,
      });
      if (!locked || locked.deletedAt) {
        throw coded(404, 'Class not found.');
      }
      const fresh = await loadSeries(db, row.id, transaction);
      const before = graphFromRow(fresh);
      const after = {
        series: prepared.series,
        slots: prepared.slots,
        occurrences: prepared.occurrences,
      };
      await syncReservations(db, fresh.id, before, after, transaction);
      await fresh.update(prepared.series, { transaction: transaction });
      await replaceChildren(db, fresh.id, prepared, transaction);
    });
  } catch (error) {
    if (error.status === 409 || error.status === 404) {
      return { ok: false, status: error.status, message: error.message };
    }
    throw error;
  }
  return { ok: true };
}

// prepared: { slots, coachIds, trainingGroupIds, occurrences }. Replaces those child rows.
async function replaceChildren(db, seriesId, prepared, transaction) {
  const existing = await db.tables.ClassOccurrences.findAll({
    where: { classSeriesId: seriesId },
    attributes: ['id'],
    transaction: transaction,
  });
  const occurrenceIds = existing.map((occurrence) => occurrence.id);
  if (occurrenceIds.length) {
    await db.tables.ClassOccurrenceCoaches.destroy({
      where: { classOccurrenceId: occurrenceIds },
      transaction: transaction,
    });
    await db.tables.ClassOccurrenceTrainingGroups.destroy({
      where: { classOccurrenceId: occurrenceIds },
      transaction: transaction,
    });
  }
  await db.tables.ClassOccurrences.destroy({
    where: { classSeriesId: seriesId },
    transaction: transaction,
  });
  await db.tables.ClassSeriesSlots.destroy({
    where: { classSeriesId: seriesId },
    transaction: transaction,
  });
  await db.tables.ClassSeriesCoaches.destroy({
    where: { classSeriesId: seriesId },
    transaction: transaction,
  });
  await db.tables.ClassSeriesTrainingGroups.destroy({
    where: { classSeriesId: seriesId },
    transaction: transaction,
  });

  for (let i = 0; i < prepared.slots.length; i += 1) {
    const slot = prepared.slots[i];
    await db.tables.ClassSeriesSlots.create({
      classSeriesId: seriesId,
      weekday: slot.weekday,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }, { transaction: transaction });
  }
  for (let i = 0; i < prepared.coachIds.length; i += 1) {
    await db.tables.ClassSeriesCoaches.create({
      classSeriesId: seriesId,
      athleteProfileId: prepared.coachIds[i],
    }, { transaction: transaction });
  }
  for (let i = 0; i < prepared.trainingGroupIds.length; i += 1) {
    await db.tables.ClassSeriesTrainingGroups.create({
      classSeriesId: seriesId,
      trainingGroupId: prepared.trainingGroupIds[i],
    }, { transaction: transaction });
  }
  for (let i = 0; i < prepared.occurrences.length; i += 1) {
    const occurrence = prepared.occurrences[i];
    const created = await db.tables.ClassOccurrences.create({
      classSeriesId: seriesId,
      occursOn: occurrence.occursOn,
      status: occurrence.status,
      deletedAt: occurrence.deletedAt,
      rescheduledFrom: occurrence.rescheduledFrom,
      overrides: occurrence.overrides,
      overrideCoaches: occurrence.overrideCoaches,
      overrideGroups: occurrence.overrideGroups,
    }, { transaction: transaction });
    for (let c = 0; c < occurrence.coachIds.length; c += 1) {
      await db.tables.ClassOccurrenceCoaches.create({
        classOccurrenceId: created.id,
        athleteProfileId: occurrence.coachIds[c],
      }, { transaction: transaction });
    }
    for (let g = 0; g < occurrence.trainingGroupIds.length; g += 1) {
      await db.tables.ClassOccurrenceTrainingGroups.create({
        classOccurrenceId: created.id,
        trainingGroupId: occurrence.trainingGroupIds[g],
      }, { transaction: transaction });
    }
  }
}

// body -> { knownCoachIds: number[], knownTrainingGroupIds: number[] }.
async function loadKnownIds(db, body) {
  const source = body && typeof body === 'object' ? body : {};
  return {
    knownCoachIds: await existingIds(db.tables.AthleteProfiles, listedIds(source.coachIds)),
    knownTrainingGroupIds: await existingIds(db.tables.TrainingGroups, listedIds(source.trainingGroupIds)),
  };
}

// Ids from the list that this table actually has.
function existingIds(model, ids) {
  if (!ids.length) {
    return Promise.resolve([]);
  }
  return model.findAll({
    where: { id: ids },
    attributes: ['id'],
  }).then((rows) => rows.map((row) => row.id));
}

// Sequelize include for a full series graph.
function seriesInclude(db) {
  return [
    { model: db.tables.ClassSeriesSlots, as: 'slots' },
    { model: db.tables.ClassSeriesCoaches, as: 'coaches' },
    { model: db.tables.ClassSeriesTrainingGroups, as: 'seriesTrainingGroups' },
    {
      model: db.tables.ClassOccurrences,
      as: 'occurrences',
      include: [
        { model: db.tables.ClassOccurrenceCoaches, as: 'coaches' },
        { model: db.tables.ClassOccurrenceTrainingGroups, as: 'occurrenceTrainingGroups' },
      ],
    },
  ];
}

// Series row -> { series, slots, occurrences }.
function graphFromRow(row) {
  const plain = row.get({ plain: true });
  return {
    series: {
      id: plain.id,
      title: plain.title,
      description: plain.description,
      location: plain.location,
      startsOn: day(plain.startsOn),
      repeats: plain.repeats,
      endsOn: day(plain.endsOn),
      startTime: clock(plain.startTime),
      endTime: clock(plain.endTime),
      visible: plain.visible,
      isReservable: plain.isReservable,
      capacity: Number(plain.capacity),
      creditCost: Number(plain.creditCost),
      dollarCost: plain.dollarCost == null ? null : Number(plain.dollarCost),
      minAge: plain.minAge == null ? null : Number(plain.minAge),
      maxAge: plain.maxAge == null ? null : Number(plain.maxAge),
      reservationCutoffMinutes: Number(plain.reservationCutoffMinutes),
      cancellationCutoffMinutes: Number(plain.cancellationCutoffMinutes),
      color: plain.color,
      note: plain.note,
      notifyCoachOnReserve: plain.notifyCoachOnReserve,
      canceledAt: plain.canceledAt,
      deletedAt: plain.deletedAt,
      createdByUserId: plain.createdByUserId,
      coachIds: idList(plain.coaches, 'athleteProfileId'),
      trainingGroupIds: idList(plain.seriesTrainingGroups, 'trainingGroupId'),
    },
    slots: (plain.slots || []).map((slot) => ({
      weekday: slot.weekday,
      startTime: clock(slot.startTime),
      endTime: clock(slot.endTime),
    })).sort((a, b) => a.weekday - b.weekday),
    occurrences: (plain.occurrences || []).map((occurrence) => ({
      occursOn: day(occurrence.occursOn),
      rescheduledFrom: day(occurrence.rescheduledFrom),
      status: occurrence.status,
      deletedAt: occurrence.deletedAt,
      overrides: occurrence.overrides,
      overrideCoaches: occurrence.overrideCoaches,
      overrideGroups: occurrence.overrideGroups,
      coachIds: idList(occurrence.coaches, 'athleteProfileId'),
      trainingGroupIds: idList(occurrence.occurrenceTrainingGroups, 'trainingGroupId'),
    })).sort((a, b) => {
      if (a.occursOn < b.occursOn) {
        return -1;
      }
      if (a.occursOn > b.occursOn) {
        return 1;
      }
      return 0;
    }),
  };
}

// Graph as the class JSON response.
function toClassSeriesJson(row) {
  const graph = graphFromRow(row);
  const series = graph.series;
  return {
    id: series.id,
    title: series.title,
    description: series.description,
    location: series.location,
    startsOn: series.startsOn,
    repeats: series.repeats,
    endsOn: series.endsOn,
    startTime: series.startTime,
    endTime: series.endTime,
    visible: series.visible,
    isReservable: series.isReservable,
    capacity: series.capacity,
    creditCost: series.creditCost,
    dollarCost: series.dollarCost,
    minAge: series.minAge,
    maxAge: series.maxAge,
    reservationCutoffMinutes: series.reservationCutoffMinutes,
    cancellationCutoffMinutes: series.cancellationCutoffMinutes,
    color: series.color,
    note: series.note,
    notifyCoachOnReserve: series.notifyCoachOnReserve,
    canceledAt: timestamp(series.canceledAt),
    deletedAt: timestamp(series.deletedAt),
    createdByUserId: series.createdByUserId,
    slots: graph.slots,
    coachIds: series.coachIds,
    trainingGroupIds: series.trainingGroupIds,
    occurrences: graph.occurrences.map((occurrence) => {
      return Object.assign({}, occurrence, {
        deletedAt: timestamp(occurrence.deletedAt),
      });
    }),
  };
}

// Sorted values of one column.
function idList(rows, key) {
  return (rows || []).map((row) => row[key]).sort((a, b) => a - b);
}

// Positive integer ids from a request array.
function listedIds(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  const ids = [];
  value.forEach((id) => {
    if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
      ids.push(id);
    } else if (typeof id === 'string' && /^\d+$/.test(id) && Number(id) > 0) {
      ids.push(Number(id));
    }
  });
  return ids;
}

// Signed-in user id, or null.
function callerId(req) {
  const id = req.user && req.user.id;
  if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
    return id;
  }
  return null;
}

// Positive integer route id, or null.
function parseRouteId(value) {
  const id = parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

// Date, then start time, then series id.
function compareSessions(a, b) {
  if (a.occursOn !== b.occursOn) {
    return a.occursOn < b.occursOn ? -1 : 1;
  }
  if (a.startTime !== b.startTime) {
    return a.startTime < b.startTime ? -1 : 1;
  }
  return a.seriesId - b.seriesId;
}

// Log the error and respond 500.
function sendError(res, error, label) {
  console.error(label, error);
  res.status(500).json({ ok: false, message: 'Internal server error.' });
}

// before and after are { series, slots, occurrences }. Applies move, removal, pause, and resume.
async function syncReservations(db, seriesId, before, after, transaction) {
  const reservationRows = await db.tables.ClassReservations.findAll({
    where: { classSeriesId: seriesId },
    transaction: transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!reservationRows.length) {
    return;
  }
  const effects = reservationEffects(before, after, reservationRows.map((row) => row.occursOn));
  const allocationRows = await db.tables.CreditAllocations.findAll({
    where: { reservationId: reservationRows.map((row) => row.id) },
    transaction: transaction,
  });
  const planned = prepareReservationRows(reservationRows, effects);
  const rebuilt = await reallocateResumes(db, planned, allocationRows, after, effects, transaction);
  if (!rebuilt.ok) {
    throw coded(409, 'A reserved athlete no longer has the credits for this class.');
  }
  await writeReservationEffects(db, seriesId, planned, effects, rebuilt, transaction);
}

// effects: { moves: [{ from, to }], removals, pauses, resumes } -> [{ id, athleteProfileId, from, occursOn, removed }].
function prepareReservationRows(reservationRows, effects) {
  const removed = {};
  effects.removals.forEach((date) => {
    removed[date] = true;
  });
  const moves = {};
  effects.moves.forEach((move) => {
    moves[move.from] = move.to;
  });
  return reservationRows.map((row) => {
    const from = day(row.occursOn);
    return {
      id: row.id,
      athleteProfileId: row.athleteProfileId,
      from: from,
      occursOn: moves[from] || from,
      removed: removed[from] === true,
    };
  });
}

// -> { ok: true, allocations, resumeIds } or { ok: false }. Fails the save when anyone is short.
async function reallocateResumes(db, planned, allocationRows, after, effects, transaction) {
  const resumeDates = {};
  effects.resumes.forEach((date) => {
    resumeDates[date] = true;
  });
  const pauseDates = {};
  effects.pauses.forEach((date) => {
    pauseDates[date] = true;
  });
  const resumeIds = {};
  const excluded = {};
  planned.forEach((row) => {
    if (row.removed || pauseDates[row.occursOn] || resumeDates[row.occursOn]) {
      excluded[row.id] = true;
    }
    if (!row.removed && resumeDates[row.occursOn]) {
      resumeIds[row.id] = true;
    }
  });
  const resumeIdList = Object.keys(resumeIds).map(Number);
  if (!resumeIdList.length) {
    return { ok: true, allocations: [], resumeIds: [] };
  }

  const byReservation = {};
  allocationRows.forEach((row) => {
    if (!byReservation[row.reservationId]) {
      byReservation[row.reservationId] = [];
    }
    byReservation[row.reservationId].push(row);
  });

  const resumeList = planned.filter((row) => resumeIds[row.id]);
  const profiles = await db.tables.AthleteProfiles.findAll({
    where: { id: resumeList.map((row) => row.athleteProfileId) },
    transaction: transaction,
  });
  const athleteByProfile = {};
  profiles.forEach((profile) => {
    athleteByProfile[profile.id] = profile.athleteId;
  });

  const reservations = [];
  for (let i = 0; i < resumeList.length; i += 1) {
    const row = resumeList[i];
    const creditCost = amountSum(byReservation[row.id] || []);
    if (creditCost <= 0) {
      continue;
    }
    const session = sessionOnDate(after, row.occursOn);
    if (!session) {
      return { ok: false };
    }
    reservations.push({
      id: row.id,
      athleteId: athleteByProfile[row.athleteProfileId],
      classStart: classStartInstant(session.occursOn, session.startTime),
      creditCost: creditCost,
    });
  }
  if (!reservations.length) {
    return { ok: true, allocations: [], resumeIds: resumeIdList };
  }

  const athleteIds = reservations.map((row) => row.athleteId).filter((id) => id != null);
  const grantRows = athleteIds.length
    ? await db.tables.CreditGrants.findAll({
      where: { athleteId: athleteIds },
      transaction: transaction,
      lock: transaction.LOCK.UPDATE,
    })
    : [];
  const holding = allocationRows
    .filter((row) => !excluded[row.reservationId] && isHoldingAllocation(row))
    .map(toHeldAllocation);
  const result = reallocatePaused({
    reservations: reservations,
    grants: grantRows.map(toSyncGrant),
    holdingAllocations: holding,
  });
  if (!result.ok) {
    return { ok: false };
  }
  return { ok: true, allocations: result.allocations, resumeIds: resumeIdList };
}

// rebuilt: { allocations, resumeIds }. Deletes removals, moves dates, pauses holds, replaces resumed holds.
async function writeReservationEffects(db, seriesId, planned, effects, rebuilt, transaction) {
  const removedIds = planned.filter((row) => row.removed).map((row) => row.id);
  if (removedIds.length) {
    await db.tables.CreditAllocations.destroy({
      where: { reservationId: removedIds },
      transaction: transaction,
    });
    await db.tables.ClassReservations.destroy({
      where: { id: removedIds },
      transaction: transaction,
    });
  }
  for (let i = 0; i < effects.moves.length; i += 1) {
    const move = effects.moves[i];
    await db.tables.ClassReservations.update({
      occursOn: move.to,
    }, {
      where: { classSeriesId: seriesId, occursOn: move.from },
      transaction: transaction,
    });
  }
  const pauseDates = {};
  effects.pauses.forEach((date) => {
    pauseDates[date] = true;
  });
  const pauseIds = planned
    .filter((row) => !row.removed && pauseDates[row.occursOn])
    .map((row) => row.id);
  if (pauseIds.length) {
    await db.tables.CreditAllocations.update({ holding: false }, {
      where: { reservationId: pauseIds },
      transaction: transaction,
    });
  }
  if (rebuilt.resumeIds && rebuilt.resumeIds.length) {
    await db.tables.CreditAllocations.destroy({
      where: { reservationId: rebuilt.resumeIds },
      transaction: transaction,
    });
  }
  for (let i = 0; i < rebuilt.allocations.length; i += 1) {
    const allocation = rebuilt.allocations[i];
    await db.tables.CreditAllocations.create({
      reservationId: allocation.reservationId,
      creditGrantId: allocation.creditGrantId,
      amount: allocation.amount,
      holding: true,
    }, { transaction: transaction });
  }
}

// Sum of allocation amounts. Zero is a free signup.
function amountSum(rows) {
  return rows.reduce((sum, row) => sum + Number(row.amount), 0);
}

// A paused hold has holding false.
function isHoldingAllocation(row) {
  return row.holding !== false && row.holding !== 0;
}

// Allocation row -> { reservationId, creditGrantId, amount, holding }.
function toHeldAllocation(row) {
  return {
    reservationId: row.reservationId,
    creditGrantId: row.creditGrantId,
    amount: Number(row.amount),
    holding: row.holding,
  };
}

// Grant row -> { id, athleteId, quantity, startsAt, expiresAt }.
function toSyncGrant(row) {
  return {
    id: row.id,
    athleteId: row.athleteId,
    quantity: row.quantity == null ? null : Number(row.quantity),
    startsAt: row.startsAt == null ? null : new Date(row.startsAt),
    expiresAt: row.expiresAt == null ? null : new Date(row.expiresAt),
  };
}

// Error savePrepared turns into that HTTP status.
function coded(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

module.exports = {
  listClasses,
  loadExpandedSessions,
  loadClassGraph,
  getClass,
  createClass,
  updateClass,
  cancelClass,
  deleteClass,
};
