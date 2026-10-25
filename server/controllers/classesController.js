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
} = require('../lib/classSchedule');

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
  await savePrepared(db, row, prepared.value);
  const reloaded = await loadSeries(db, row.id);
  res.json({
    ok: true,
    classSeries: toClassSeriesJson(reloaded),
    notifyRequested: prepared.value.notifyRequested,
  });
}

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

function loadSeries(db, id) {
  return db.tables.ClassSeries.findByPk(id, { include: seriesInclude(db) });
}

async function savePrepared(db, row, prepared) {
  await db.tables.schema.transaction(async (transaction) => {
    await row.update(prepared.series, { transaction: transaction });
    await replaceChildren(db, row.id, prepared, transaction);
  });
}

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

async function loadKnownIds(db, body) {
  const source = body && typeof body === 'object' ? body : {};
  return {
    knownCoachIds: await existingIds(db.tables.AthleteProfiles, listedIds(source.coachIds)),
    knownTrainingGroupIds: await existingIds(db.tables.TrainingGroups, listedIds(source.trainingGroupIds)),
  };
}

function existingIds(model, ids) {
  if (!ids.length) {
    return Promise.resolve([]);
  }
  return model.findAll({
    where: { id: ids },
    attributes: ['id'],
  }).then((rows) => rows.map((row) => row.id));
}

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

function idList(rows, key) {
  return (rows || []).map((row) => row[key]).sort((a, b) => a - b);
}

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

function callerId(req) {
  const id = req.user && req.user.id;
  if (typeof id === 'number' && Number.isInteger(id) && id > 0) {
    return id;
  }
  return null;
}

function parseRouteId(value) {
  const id = parseInt(value, 10);
  if (!Number.isInteger(id) || id < 1) {
    return null;
  }
  return id;
}

function compareSessions(a, b) {
  if (a.occursOn !== b.occursOn) {
    return a.occursOn < b.occursOn ? -1 : 1;
  }
  if (a.startTime !== b.startTime) {
    return a.startTime < b.startTime ? -1 : 1;
  }
  return a.seriesId - b.seriesId;
}

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

function clock(value) {
  if (value == null) {
    return null;
  }
  const text = String(value);
  return text.length >= 8 ? text.slice(0, 8) : text;
}

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

function sendError(res, error, label) {
  console.error(label, error);
  res.status(500).json({ ok: false, message: 'Internal server error.' });
}

module.exports = {
  listClasses,
  loadExpandedSessions,
  getClass,
  createClass,
  updateClass,
  cancelClass,
  deleteClass,
};
