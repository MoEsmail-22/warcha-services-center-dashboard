/**
 * How often background data is checked (see hooks/usePolling.js).
 * Bookings and quotes share one schedule so they always refresh together.
 * `max` is the slowest the check gets after repeated server errors.
 */
export const POLLING = {
  notifications: { intervalMs: 15_000, maxIntervalMs: 120_000 },
  bookings: { intervalMs: 30_000, maxIntervalMs: 240_000 },
};
