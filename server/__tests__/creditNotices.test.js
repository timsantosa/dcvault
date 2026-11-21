'use strict';

const { creditNotice } = require('../lib/creditNotices');

describe('creditNotice', () => {
  it('says classes were added and names the expiration', () => {
    expect(creditNotice({
      kind: 'add',
      quantity: 4,
      expiresAt: new Date(2026, 9, 1, 0, 0, 0, 0),
    })).toEqual({
      summary: '4 classes were added.',
      body: '4 classes were added. They expire Sep 30.',
    });
  });

  it('says one class was added', () => {
    expect(creditNotice({
      kind: 'add',
      quantity: 1,
      expiresAt: new Date(2026, 9, 1, 0, 0, 0, 0),
    })).toEqual({
      summary: '1 class was added.',
      body: '1 class was added. It expires Sep 30.',
    });
  });

  it('omits the date when an add does not expire', () => {
    expect(creditNotice({ kind: 'add', quantity: 4, expiresAt: null })).toEqual({
      summary: '4 classes were added.',
      body: '4 classes were added.',
    });
  });

  it('says unlimited classes were added through a date', () => {
    expect(creditNotice({
      kind: 'add',
      quantity: null,
      expiresAt: new Date(2026, 9, 1, 0, 0, 0, 0),
    })).toEqual({
      summary: 'Unlimited classes were added through Sep 30.',
      body: 'Unlimited classes were added through Sep 30.',
    });
  });

  it('says unlimited classes were added when there is no end date', () => {
    expect(creditNotice({ kind: 'add', quantity: null, expiresAt: null })).toEqual({
      summary: 'Unlimited classes were added.',
      body: 'Unlimited classes were added.',
    });
  });

  it('says classes were removed and names the window', () => {
    expect(creditNotice({
      kind: 'remove',
      quantity: -2,
      expiresAt: new Date(2026, 9, 1, 0, 0, 0, 0),
    })).toEqual({
      summary: '2 classes were removed.',
      body: '2 classes were removed. They applied through Sep 30.',
    });
  });

  it('omits the date when a removal does not expire', () => {
    expect(creditNotice({ kind: 'remove', quantity: 2, expiresAt: null })).toEqual({
      summary: '2 classes were removed.',
      body: '2 classes were removed.',
    });
  });

  it('says one class was removed', () => {
    expect(creditNotice({ kind: 'remove', quantity: 1, expiresAt: null })).toEqual({
      summary: '1 class was removed.',
      body: '1 class was removed.',
    });
  });

  it('says classes ended on the calendar day of a non-midnight expiration', () => {
    expect(creditNotice({
      kind: 'end',
      quantity: 8,
      expiresAt: new Date(2026, 10, 20, 15, 30, 0, 0),
    })).toEqual({
      summary: '8 classes ended Nov 20.',
      body: '8 classes ended Nov 20.',
    });
  });

  it('says one class ended', () => {
    expect(creditNotice({
      kind: 'end',
      quantity: 1,
      expiresAt: new Date(2026, 10, 20, 15, 30, 0, 0),
    })).toEqual({
      summary: '1 class ended Nov 20.',
      body: '1 class ended Nov 20.',
    });
  });

  it('says unlimited classes ended', () => {
    expect(creditNotice({
      kind: 'end',
      quantity: null,
      expiresAt: new Date(2026, 10, 20, 15, 30, 0, 0),
    })).toEqual({
      summary: 'Unlimited classes ended Nov 20.',
      body: 'Unlimited classes ended Nov 20.',
    });
  });

  it('returns null for an unknown kind', () => {
    expect(creditNotice({ kind: 'pause', quantity: 1, expiresAt: null })).toBeNull();
  });
});
