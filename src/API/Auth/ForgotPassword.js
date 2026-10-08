import apiClient from '../client';
import { assertApiSuccess, handleApiError } from '../errors';

export async function forgotPassword(email) {
  try {
    const response = await apiClient.post('/Auth/workshop/forgot-password', { email });
    return assertApiSuccess(response.data, 'Password reset request failed.');
  } catch (error) {
    return handleApiError(error, 'Forgot password request');
  }
}
