'use strict';

const { canMessageClass, classMessagePlan, readClassMessage } = require('../lib/classMessage');

const owns = (id) => id === 9;

function plan(extra) {
  return classMessagePlan(Object.assign({
    title: 'Open Vault',
    occursOn: '2026-08-25',
    senderId: 9,
    signups: [],
    participants: [],
  }, extra));
}

describe('canMessageClass', () => {
  it('allows class editors and check-in staff', () => {
    expect(canMessageClass(['manage_classes'])).toBe(true);
    expect(canMessageClass(['manage_attendance'])).toBe(true);
    expect(canMessageClass(['manage_conversations'])).toBe(false);
    expect(canMessageClass([])).toBe(false);
    expect(canMessageClass(undefined)).toBe(false);
  });
});

describe('classMessagePlan', () => {
  it('includes walk-ins and drops people who left', () => {
    expect(plan({
      signups: [
        { athleteProfileId: 3, walkIn: false },
        { athleteProfileId: 3, walkIn: false },
        { athleteProfileId: 4, walkIn: true },
        { athleteProfileId: 'nope' },
      ],
      participants: [
        { athleteProfileId: 9, role: 'member' },
        { athleteProfileId: 2, role: 'admin' },
        { athleteProfileId: 8, role: 'member' },
        { athleteProfileId: 3, role: 'member' },
      ],
    })).toEqual({
      ok: true,
      name: 'Open Vault · Aug 25',
      memberIds: [3, 4],
      add: [{ athleteProfileId: 4, role: 'member' }],
      remove: [8],
      roleChanges: [{ athleteProfileId: 9, role: 'admin' }],
    });
  });

  it('adds the sender as an admin and keeps a previous staff admin', () => {
    expect(plan({
      title: '  Open Vault ',
      signups: [{ athleteProfileId: 3, walkIn: false }],
      participants: [{ athleteProfileId: 2, role: 'admin' }],
    })).toEqual({
      ok: true,
      name: 'Open Vault · Aug 25',
      memberIds: [3],
      add: [
        { athleteProfileId: 3, role: 'member' },
        { athleteProfileId: 9, role: 'admin' },
      ],
      remove: [],
      roleChanges: [],
    });
  });

  it('does not describe a conversation when nobody is signed up', () => {
    expect(plan({ signups: [] })).toEqual({
      ok: false,
      message: 'No one is on this class yet.',
    });
    expect(plan({ signups: [{ athleteProfileId: 0 }] }).ok).toBe(false);
  });

  it('names a class with no title', () => {
    expect(plan({
      title: ' ',
      signups: [{ athleteProfileId: 2 }],
    }).name).toBe('Class · Aug 25');
  });
});

describe('readClassMessage', () => {
  const body = {
    seriesId: 4,
    occursOn: '2026-08-25',
    senderAthleteProfileId: 9,
    message: '  Someone left a jacket.  ',
  };

  it('accepts a trimmed message from the caller’s profile', () => {
    expect(readClassMessage(body, owns)).toEqual({
      ok: true,
      seriesId: 4,
      occursOn: '2026-08-25',
      message: 'Someone left a jacket.',
      senderId: 9,
    });
    expect(readClassMessage(Object.assign({}, body, { message: 'a'.repeat(8000) }), owns).ok).toBe(true);
  });

  it('rejects a blank message, a long message, and a profile the caller does not own', () => {
    expect(readClassMessage(Object.assign({}, body, { message: '   ' }), owns)).toEqual({
      ok: false,
      message: 'message is required',
    });
    expect(readClassMessage(Object.assign({}, body, { message: 4 }), owns).message).toBe('message must be text');
    expect(readClassMessage(Object.assign({}, body, { message: 'a'.repeat(8001) }), owns).message)
      .toBe('message must be 8000 characters or less');
    expect(readClassMessage(Object.assign({}, body, { senderAthleteProfileId: 4 }), owns).message)
      .toBe('senderAthleteProfileId is required');
    expect(readClassMessage(Object.assign({}, body, { seriesId: null }), owns).message).toBe('seriesId is required');
    expect(readClassMessage(Object.assign({}, body, { occursOn: 'Tuesday' }), owns).message).toBe('occursOn is required');
  });
});
