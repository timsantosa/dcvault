'use strict';

const { readTrainingGroupIds } = require('../lib/athleteTrainingGroups');

describe('readTrainingGroupIds', () => {
  const known = [1, 2, 4];

  it('accepts known ids, including an empty list, and sorts them', () => {
    expect(readTrainingGroupIds([], known)).toEqual({ ok: true, ids: [] });
    expect(readTrainingGroupIds([4, 1], known)).toEqual({ ok: true, ids: [1, 4] });
    expect(readTrainingGroupIds(['2'], known)).toEqual({ ok: true, ids: [2] });
  });

  it('rejects a non-list, a duplicate, and an unknown id', () => {
    expect(readTrainingGroupIds(null, known).message).toBe('training group ids must be a list');
    expect(readTrainingGroupIds(['nope'], known).message).toBe('training group ids must be a list');
    expect(readTrainingGroupIds([1, 1], known).message).toBe('Duplicate training group.');
    expect(readTrainingGroupIds([3], known).message).toBe('Unknown training group.');
  });
});
