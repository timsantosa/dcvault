'use strict';

const {
  trainingGroupKeyFromLabel,
  normalizeTrainingGroupInput,
} = require('../lib/trainingGroups');

const GROUPS = [
  { id: 1, key: 'fly-kids', label: 'Fly Kids' },
  { id: 2, key: 'adult', label: 'Adult' },
  { id: 3, key: 'allages', label: 'Open / All Ages' },
];

function create(body) {
  return normalizeTrainingGroupInput(body, { groups: GROUPS, currentId: null });
}

function rename(id, body) {
  return normalizeTrainingGroupInput(body, { groups: GROUPS, currentId: id });
}

describe('trainingGroupKeyFromLabel', () => {
  it('lowercases and joins words with dashes', () => {
    expect(trainingGroupKeyFromLabel('Pre-Elite')).toBe('pre-elite');
    expect(trainingGroupKeyFromLabel('Elite Development')).toBe('elite-development');
  });

  it('collapses punctuation and trims dashes from the ends', () => {
    expect(trainingGroupKeyFromLabel('  Open / All Ages! ')).toBe('open-all-ages');
    expect(trainingGroupKeyFromLabel('--Teens 13+--')).toBe('teens-13');
  });

  it('returns an empty key when there are no letters or numbers', () => {
    expect(trainingGroupKeyFromLabel('!!!')).toBe('');
  });
});

describe('normalizeTrainingGroupInput on create', () => {
  it('trims the label and returns the key', () => {
    expect(create({ label: '  Pre-Elite ' })).toEqual({
      ok: true,
      value: { label: 'Pre-Elite', key: 'pre-elite' },
    });
  });

  it('rejects a missing body, blank label, or non-string label', () => {
    expect(create(null).ok).toBe(false);
    expect(create({ label: '   ' })).toEqual({ ok: false, message: 'Name is required.' });
    expect(create({ label: 5 }).ok).toBe(false);
  });

  it('rejects a label longer than 255 characters', () => {
    expect(create({ label: 'a'.repeat(256) })).toEqual({ ok: false, message: 'Name is too long.' });
    expect(create({ label: 'a'.repeat(255) }).ok).toBe(true);
  });

  it('rejects a label with no letters or numbers', () => {
    expect(create({ label: '!!!' })).toEqual({ ok: false, message: 'Name must include a letter or number.' });
  });

  it('rejects a duplicate label regardless of case', () => {
    const result = create({ label: 'adult' });
    expect(result.ok).toBe(false);
    expect(result.message).toBe('A group named "Adult" already exists.');
  });

  it('rejects a label whose key already exists', () => {
    const result = create({ label: 'Fly-Kids!' });
    expect(result.ok).toBe(false);
    expect(result.message).toBe('"Fly-Kids!" is too close to the existing group "Fly Kids".');
  });
});

describe('normalizeTrainingGroupInput on rename', () => {
  it('returns only the label', () => {
    expect(rename(2, { label: 'Adults' })).toEqual({ ok: true, value: { label: 'Adults' } });
  });

  it('allows renaming a group to its own label in a different case', () => {
    expect(rename(2, { label: 'ADULT' })).toEqual({ ok: true, value: { label: 'ADULT' } });
  });

  it('rejects another group\'s label regardless of case', () => {
    const result = rename(2, { label: 'fly kids' });
    expect(result.ok).toBe(false);
    expect(result.message).toBe('A group named "Fly Kids" already exists.');
  });

  it('does not check keys, so punctuation-only differences are allowed', () => {
    expect(rename(2, { label: 'Fly-Kids' }).ok).toBe(true);
  });

  it('still rejects a blank label or one with no letters or numbers', () => {
    expect(rename(2, { label: '' }).ok).toBe(false);
    expect(rename(2, { label: '!!!' }).ok).toBe(false);
  });
});
