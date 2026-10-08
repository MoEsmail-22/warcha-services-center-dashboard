import apiClient from './client';
import { assertApiSuccess, handleApiError } from './errors';

/** One page of the workshop's notifications (the backend defaults to page 1, 20 per page). */
export async function getNotifications({ page = 1, pageSize = 20 } = {}) {
  try {
    const response = await apiClient.get('/Workshop/notifications', {
      params: { page, pageSize },
    });
    return assertApiSuccess(response.data, 'Failed to load notifications.');
  } catch (error) {
    return handleApiError(error, 'Load notifications');
  }
}

export async function markNotificationRead(id) {
  try {
    const response = await apiClient.patch(`/Workshop/notifications/${id}/read`);
    return assertApiSuccess(response.data, 'Failed to mark the notification as read.');
  } catch (error) {
    return handleApiError(error, 'Mark notification as read');
  }
}
