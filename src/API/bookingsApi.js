import apiClient from './client';
import { assertApiSuccess, handleApiError } from './errors';
import { logError as logErrorFor, logResponse as logResponseFor } from './devLog';

const AREA = 'Bookings API';
const logResponse = (label, response) => logResponseFor(AREA, label, response);
const logError = (label, error) => logErrorFor(AREA, label, error);

/** One page of the workshop's bookings (note: lowercase page/pageSize, unlike services). */
export async function getBookings({ page = 1, pageSize = 100 } = {}) {
  try {
    const response = await apiClient.get('/Workshop/bookings', { params: { page, pageSize } });
    logResponse('GET bookings list', response);
    return assertApiSuccess(response.data, 'Failed to load bookings.');
  } catch (error) {
    logError('GET bookings list', error);
    return handleApiError(error, 'Load bookings');
  }
}

export async function getBooking(id) {
  try {
    const response = await apiClient.get(`/Workshop/bookings/${id}`);
    logResponse(`GET booking ${id}`, response);
    return assertApiSuccess(response.data, 'Failed to load the booking.');
  } catch (error) {
    logError(`GET booking ${id}`, error);
    return handleApiError(error, 'Load booking');
  }
}

/**
 * Changes a booking's status. The API expects just the status number as the
 * body (e.g. 3), not an object — see bookingStatuses.js for what each number means.
 */
export async function updateBookingStatus(id, statusNumber) {
  try {
    const response = await apiClient.patch(`/Workshop/bookings/${id}/status`, statusNumber);
    logResponse(`PATCH booking ${id} status → ${statusNumber}`, response);
    return assertApiSuccess(response.data, 'Failed to update the booking status.');
  } catch (error) {
    logError(`PATCH booking ${id} status → ${statusNumber}`, error);
    return handleApiError(error, 'Update booking status');
  }
}

export async function cancelBooking(id) {
  try {
    const response = await apiClient.patch(`/Workshop/bookings/${id}/cancel`);
    logResponse(`PATCH booking ${id} cancel`, response);
    return assertApiSuccess(response.data, 'Failed to cancel the booking.');
  } catch (error) {
    logError(`PATCH booking ${id} cancel`, error);
    return handleApiError(error, 'Cancel booking');
  }
}
