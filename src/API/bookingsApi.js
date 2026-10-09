import apiClient from './client';
import { assertApiSuccess, handleApiError } from './errors';

/** One page of the workshop's bookings (note: lowercase page/pageSize, unlike services). */
export async function getBookings({ page = 1, pageSize = 100 } = {}) {
  try {
    const response = await apiClient.get('/Workshop/bookings', { params: { page, pageSize } });
    return assertApiSuccess(response.data, 'Failed to load bookings.');
  } catch (error) {
    return handleApiError(error, 'Load bookings');
  }
}

export async function getBooking(id) {
  try {
    const response = await apiClient.get(`/Workshop/bookings/${id}`);
    return assertApiSuccess(response.data, 'Failed to load the booking.');
  } catch (error) {
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
    return assertApiSuccess(response.data, 'Failed to update the booking status.');
  } catch (error) {
    return handleApiError(error, 'Update booking status');
  }
}

export async function cancelBooking(id) {
  try {
    const response = await apiClient.patch(`/Workshop/bookings/${id}/cancel`);
    return assertApiSuccess(response.data, 'Failed to cancel the booking.');
  } catch (error) {
    return handleApiError(error, 'Cancel booking');
  }
}
