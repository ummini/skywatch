import departures from '../data/departures.json';

export const FAKE_NETWORK_DELAY_MS = 1500;

/**
 * Pretends to call a real flight API.
 *
 * Resolves with the list of departures after `delayMs`.
 * Pass `{ fail: true }` to simulate the network going down.
 */
export function getDepartures({ delayMs = FAKE_NETWORK_DELAY_MS, fail = false } = {}) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (fail) {
        reject(new Error('Could not reach the flight server.'));
        return;
      }
      resolve(departures.map((flight) => ({ ...flight })));
    }, delayMs);
  });
}
