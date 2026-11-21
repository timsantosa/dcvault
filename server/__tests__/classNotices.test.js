'use strict';

const { classNotice, pairsForNotice, readNoticeRequest } = require('../lib/classNotices');

function session(overrides) {
  return Object.assign({
    occursOn: '2026-08-25',
    startTime: '16:00:00',
    endTime: '18:00:00',
    status: 'active',
    location: 'DC Vault',
    locationAddress: null,
  }, overrides);
}

function notice(reservations, extra) {
  return classNotice(Object.assign({
    title: 'Open Vault',
    today: '2026-08-01',
    reservations: reservations,
  }, extra));
}

function row(athleteProfileId, before, after) {
  return { athleteProfileId: athleteProfileId, before: before, after: after };
}

describe('classNotice', () => {
  it('says a class is canceled', () => {
    const result = notice([
      row(3, session(), session({ status: 'canceled' })),
    ]);
    expect(result.notices).toEqual([
      expect.objectContaining({
        athleteProfileId: 3,
        summary: 'Open Vault on Aug 25 at 4:00 PM is canceled.',
        body: 'Open Vault on Aug 25 at 4:00 PM is canceled.',
      }),
    ]);
  });

  it('says the class moved to the new time', () => {
    const result = notice([
      row(3, session(), session({ startTime: '16:30:00' })),
    ]);
    expect(result.notices[0].summary).toBe('Open Vault on Aug 25 moved from 4:00 PM to 4:30 PM.');
  });

  it('says the class moved to the new date', () => {
    const result = notice([
      row(3, session(), session({ occursOn: '2026-08-26', startTime: '16:30:00' })),
    ]);
    expect(result.notices[0].summary).toBe('Open Vault on Aug 25 at 4:00 PM moved to Aug 26 at 4:30 PM.');
  });

  it('says the location changed', () => {
    const result = notice([
      row(3, session(), session({ location: 'the pit' })),
    ]);
    expect(result.notices[0].summary).toBe('Open Vault on Aug 25 location changed from DC Vault to the pit.');
  });

  it('sends one notice when one athlete has two dates', () => {
    const result = notice([
      row(3, session(), session({ startTime: '16:30:00' })),
      row(3, session({ occursOn: '2026-08-27' }), session({ occursOn: '2026-08-27', startTime: '18:00:00' })),
    ]);
    expect(result.notices).toHaveLength(1);
    expect(result.notices[0].athleteProfileId).toBe(3);
    expect(result.notices[0].summary).toBe('Open Vault on Aug 25 moved from 4:00 PM to 4:30 PM.');
    expect(result.notices[0].body).toBe(
      'Open Vault on Aug 25 moved from 4:00 PM to 4:30 PM.\n'
      + 'Open Vault on Aug 27 moved from 4:00 PM to 6:00 PM.'
    );
  });

  it('gives each athlete the line for their own dates', () => {
    const result = notice([
      row(2, session(), session({ status: 'canceled' })),
      row(4, session({ occursOn: '2026-08-27' }), session({ occursOn: '2026-08-27', startTime: '16:30:00' })),
    ]);
    expect(result.notices.map((item) => item.summary)).toEqual([
      'Open Vault on Aug 25 at 4:00 PM is canceled.',
      'Open Vault on Aug 27 moved from 4:00 PM to 4:30 PM.',
    ]);
  });

  it('skips a past date', () => {
    const result = notice([
      row(3, session({ occursOn: '2026-07-01' }), session({ occursOn: '2026-07-01', startTime: '16:30:00' })),
    ]);
    expect(result).toBeNull();
  });

  it('leaves a title-only edit and a restore unsent', () => {
    expect(notice([
      row(3, session(), session()),
    ])).toBeNull();
    expect(notice([
      row(3, session({ status: 'canceled' }), session({ status: 'active' })),
    ])).toBeNull();
  });

  it('adds a View class link for each date', () => {
    const result = notice([
      row(3, session(), session({ startTime: '16:30:00' })),
      row(3, session({ occursOn: '2026-08-27' }), session({ occursOn: '2026-08-27', startTime: '18:00:00' })),
    ], { seriesId: 12 });
    expect(result.notices[0].body).toBe(
      'Open Vault on Aug 25 moved from 4:00 PM to 4:30 PM.\n'
      + 'Open Vault on Aug 27 moved from 4:00 PM to 6:00 PM.\n'
      + '[[class:12:2026-08-25|View Aug 25]]\n'
      + '[[class:12:2026-08-27|View Aug 27]]'
    );
  });

  it('uses one View class link when only one date changed', () => {
    const result = notice([
      row(3, session(), session({ endTime: '18:30:00' })),
    ], { seriesId: 12 });
    expect(result.notices[0].body).toBe(
      'Open Vault on Aug 25 now ends at 6:30 PM instead of 6:00 PM.\n[[class:12:2026-08-25|View class]]'
    );
  });

  it('appends the staff note', () => {
    const result = notice([
      row(4, session(), session({ startTime: '16:30:00' })),
      row(2, session(), session({ startTime: '16:30:00' })),
    ], { note: '  Thunder delay — still on for 4:30.  ' });
    expect(result.notices.map((item) => item.athleteProfileId)).toEqual([2, 4]);
    expect(result.notices[0].summary).toBe('Open Vault on Aug 25 moved from 4:00 PM to 4:30 PM.');
    expect(result.notices[0].note).toBe('Thunder delay — still on for 4:30.');
    expect(result.notices[0].body).toBe(
      'Open Vault on Aug 25 moved from 4:00 PM to 4:30 PM.\nThunder delay — still on for 4:30.'
    );
  });
});

describe('pairsForNotice', () => {
  it('pairs a moved one-off with the session it lands on', () => {
    const before = oneOffGraph();
    const after = oneOffGraph({ startsOn: '2026-08-26', startTime: '16:30:00' });
    expect(pairsForNotice(before, after, [{ athleteProfileId: 3, occursOn: '2026-08-25' }])).toEqual([{
      athleteProfileId: 3,
      before: {
        occursOn: '2026-08-25',
        startTime: '16:00:00',
        endTime: '18:00:00',
        status: 'active',
        location: 'DC Vault',
        locationAddress: null,
      },
      after: {
        occursOn: '2026-08-26',
        startTime: '16:30:00',
        endTime: '18:00:00',
        status: 'active',
        location: 'DC Vault',
        locationAddress: null,
      },
    }]);
  });
});

describe('readNoticeRequest', () => {
  const owns = (senderId) => senderId === 9;

  it('requires a sender profile when notify is on', () => {
    expect(readNoticeRequest({ message: 'Hi', senderAthleteProfileId: 4 }, true, owns).ok).toBe(false);
    const accepted = readNoticeRequest({ message: '  Hi  ', senderAthleteProfileId: 9 }, true, owns);
    expect(accepted).toEqual({ ok: true, message: 'Hi', senderId: 9 });
  });

  it('rejects a note longer than 500 characters', () => {
    const rejected = readNoticeRequest({ message: 'a'.repeat(501), senderAthleteProfileId: 9 }, true, owns);
    expect(rejected.ok).toBe(false);
  });

  it('ignores the note and sender when notify is off', () => {
    expect(readNoticeRequest({ message: 'Hi', senderAthleteProfileId: 4 }, false, owns)).toEqual({
      ok: true,
      message: null,
      senderId: null,
    });
  });
});

function oneOffGraph(overrides) {
  return {
    series: Object.assign({
      title: 'Open Vault',
      location: 'DC Vault',
      locationAddress: null,
      startsOn: '2026-08-25',
      repeats: false,
      endsOn: null,
      startTime: '16:00:00',
      endTime: '18:00:00',
      visible: true,
      canceledAt: null,
      deletedAt: null,
    }, overrides),
    slots: [],
    occurrences: [],
  };
}
