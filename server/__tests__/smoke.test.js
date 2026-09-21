'use strict';

describe('test runner', () => {
  it('runs a CommonJS unit test without booting the server or database', () => {
    expect(1 + 1).toBe(2);
  });
});
