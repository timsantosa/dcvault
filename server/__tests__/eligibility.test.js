'use strict';

const { eligibilityReason, ageOn } = require('../lib/eligibility');

const FLY_KIDS = { id: 1, key: 'fly-kids', label: 'Fly Kids' };
const ADULT = { id: 2, key: 'adult', label: 'Adult' };
const ALL_AGES = { id: 3, key: 'allages', label: 'Open / All Ages' };
const ELITE = { id: 4, key: 'elite', label: 'Elite Development' };
const CATALOG = [FLY_KIDS, ADULT, ALL_AGES, ELITE];

function reason(session, athlete, catalog) {
  return eligibilityReason({
    session: Object.assign({
      occursOn: '2026-08-25',
      trainingGroupIds: [],
      minAge: null,
      maxAge: null,
    }, session),
    athlete: Object.assign({ firstName: 'Emma', dob: '2012-05-01', trainingGroups: [] }, athlete),
    trainingGroups: catalog || CATALOG,
  });
}

describe('eligibilityReason groups', () => {
  it('has no group limit when the class lists no groups', () => {
    expect(reason({}, { trainingGroups: [] })).toBeNull();
    expect(reason({}, { trainingGroups: [ELITE] })).toBeNull();
    expect(reason({}, { trainingGroups: [] }, [])).toBeNull();
  });

  it('passes when the athlete shares at least one group', () => {
    expect(reason({ trainingGroupIds: [2, 4] }, { trainingGroups: [FLY_KIDS, ELITE] })).toBeNull();
  });

  it('names both sides when no group is shared', () => {
    expect(reason({ trainingGroupIds: [4] }, { trainingGroups: [ALL_AGES] })).toBe(
      'Emma is in Open / All Ages. This class is Elite Development.'
    );
    expect(reason({ trainingGroupIds: [1, 2, 4] }, { trainingGroups: [ALL_AGES] })).toBe(
      'Emma is in Open / All Ages. This class is Fly Kids, Adult, and Elite Development.'
    );
    expect(reason({ trainingGroupIds: [4] }, { trainingGroups: [FLY_KIDS, ADULT] })).toBe(
      'Emma is in Fly Kids and Adult. This class is Elite Development.'
    );
  });

  it('counts an athlete with no groups as Open / All Ages', () => {
    expect(reason({ trainingGroupIds: [3] }, { trainingGroups: [] })).toBeNull();
    expect(reason({ trainingGroupIds: [4] }, { trainingGroups: [] })).toBe(
      'Emma is in Open / All Ages. This class is Elite Development.'
    );
  });

  it('blocks an athlete with no groups when the catalog has no allages row', () => {
    expect(reason({ trainingGroupIds: [4] }, { trainingGroups: [] }, [ELITE])).toBe(
      'Emma has no training group. This class is Elite Development.'
    );
  });
});

describe('eligibilityReason ages', () => {
  it('has no age limit without a minimum or maximum, even with no dob', () => {
    expect(reason({}, { dob: null })).toBeNull();
  });

  it('uses inclusive limits on the class date', () => {
    expect(reason({ minAge: 14, maxAge: 18 }, { dob: '2012-08-25' })).toBeNull();
    expect(reason({ minAge: 14, maxAge: 18 }, { dob: '2012-08-26' })).toBe(
      'Emma is 13. This class is for ages 14–18.'
    );
    expect(reason({ minAge: 14, maxAge: 18 }, { dob: '2007-08-26' })).toBeNull();
    expect(reason({ minAge: 14, maxAge: 18 }, { dob: '2007-08-25' })).toBe(
      'Emma is 19. This class is for ages 14–18.'
    );
  });

  it('describes a minimum only and a maximum only', () => {
    expect(reason({ minAge: 14 }, { dob: '2014-01-01' })).toBe('Emma is 12. This class is for age 14 or older.');
    expect(reason({ maxAge: 12 }, { dob: '05/01/2010' })).toBe('Emma is 16. This class is for age 12 or younger.');
  });

  it('blocks a limited class when the dob cannot be read', () => {
    expect(reason({ minAge: 14 }, { dob: '' })).toBe('Emma’s age is not on the profile.');
    expect(reason({ minAge: 14 }, { dob: '02/30/2010', firstName: '' })).toBe(
      'This athlete’s age is not on the profile.'
    );
  });

  it('puts the group and age sentences together', () => {
    expect(reason(
      { trainingGroupIds: [4], minAge: 16 },
      { trainingGroups: [ALL_AGES], dob: '2014-01-01' }
    )).toBe(
      'Emma is in Open / All Ages. This class is Elite Development. Emma is 12. This class is for age 16 or older.'
    );
  });
});

describe('ageOn', () => {
  it('reads both dob formats and rejects a bad date', () => {
    expect(ageOn('2012-08-25', '2026-08-25')).toBe(14);
    expect(ageOn('8/26/2012', '2026-08-25')).toBe(13);
    expect(ageOn('2012-13-01', '2026-08-25')).toBeNull();
    expect(ageOn('2027-01-01', '2026-08-25')).toBeNull();
    expect(ageOn(undefined, '2026-08-25')).toBeNull();
  });
});
