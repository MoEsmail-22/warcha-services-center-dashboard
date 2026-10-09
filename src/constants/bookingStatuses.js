/**
 * Booking statuses: the API uses numbers (PATCH /Workshop/bookings/{id}/status takes 1–5),
 * the UI uses words (statusStyles.js, filters, badges).
 *
 * ⚠ The number → status order is an assumption until the backend team confirms it.
 *   If they send a different order, only this mapping needs to change.
 */
export const STATUS_BY_NUMBER = {
  1: 'pending',
  2: 'confirmed',
  3: 'in_progress',
  4: 'completed',
  5: 'cancelled',
};

export const NUMBER_BY_STATUS = Object.fromEntries(
  Object.entries(STATUS_BY_NUMBER).map(([number, status]) => [status, Number(number)])
);

/** Accepts 3, "3", "InProgress", "in progress" or "in_progress" → "in_progress". */
export function toStatusKey(value) {
  if (value == null || value === '') return 'pending';
  if (STATUS_BY_NUMBER[value]) return STATUS_BY_NUMBER[value];

  const key = String(value)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
  return Object.values(STATUS_BY_NUMBER).includes(key) ? key : 'pending';
}
