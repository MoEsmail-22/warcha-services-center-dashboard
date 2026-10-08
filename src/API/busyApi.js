import apiClient from './client';
import { assertApiSuccess, createLocalError, handleApiError } from './errors';

/**
 * Converts the Busy Mode form values into the body the API expects.
 *   startAt → "2026-10-06T21:00" (datetime-local input, user's local time)
 *   endAt   → "2026-10-06T23:00"
 * Returns { busyFrom, busyUntil } as UTC ISO strings.
 */
export function toBusyPayload({ startAt, endAt }) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  if (Number.isNaN(start.getTime()))
    throw createLocalError('form.invalidStart', 'Enter a valid start date and time.');
  if (Number.isNaN(end.getTime()))
    throw createLocalError('form.invalidEnd', 'Enter a valid end date and time.');
  if (end <= start)
    throw createLocalError('form.endBeforeStart', 'The end time must be after the start time.');

  return {
    busyFrom: start.toISOString(),
    busyUntil: end.toISOString(),
  };
}

export async function setWorkshopBusy(form) {
  try {
    const response = await apiClient.post('/Workshop/busy', toBusyPayload(form));
    return assertApiSuccess(response.data, 'Failed to set busy time.');
  } catch (error) {
    return handleApiError(error, 'Set busy time');
  }
}

/** Ends the workshop's busy time. The API takes no ID: it clears the current busy period. */
export async function clearWorkshopBusy() {
  try {
    const response = await apiClient.delete('/Workshop/busy');
    return assertApiSuccess(response.data, 'Failed to remove busy time.');
  } catch (error) {
    return handleApiError(error, 'Remove busy time');
  }
}
