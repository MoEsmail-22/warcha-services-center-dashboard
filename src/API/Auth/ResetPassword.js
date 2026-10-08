import apiClient from '../client';
import { assertApiSuccess, handleApiError } from '../errors';

export async function resetPassword(resetData) {
  try {
    const response = await apiClient.post('/Auth/workshop/reset-password', resetData);
    return assertApiSuccess(response.data, 'Password reset failed.');
  } catch (error) {
    return handleApiError(error, 'Password reset');
  }
}
