import apiClient from '../client';
import { assertApiSuccess, handleApiError } from '../errors';

export async function loginUser(credentials) {
  try {
    const response = await apiClient.post('/Auth/workshop/login', {
      email: credentials.email,
      password: credentials.password,
    });

    return assertApiSuccess(response.data, 'Login failed.');
  } catch (error) {
    return handleApiError(error, 'Login');
  }
}
