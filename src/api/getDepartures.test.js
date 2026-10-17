import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDepartures } from './getDepartures.js';

describe('getDepartures', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves with a list of flights after the fake network delay', async () => {
    const promise = getDepartures({ delayMs: 1000 });
    await vi.advanceTimersByTimeAsync(1000);
    const flights = await promise;

    expect(flights.length).toBeGreaterThan(0);
    expect(flights[0]).toHaveProperty('flight');
    expect(flights[0]).toHaveProperty('destination');
  });

  it('rejects with an error when asked to fail', async () => {
    const promise = getDepartures({ delayMs: 1000, fail: true });
    const assertion = expect(promise).rejects.toThrow('Could not reach the flight server.');
    await vi.advanceTimersByTimeAsync(1000);
    await assertion;
  });
});
