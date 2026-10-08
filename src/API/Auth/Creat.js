import apiClient from '../client';
import { assertApiSuccess, handleApiError } from '../errors';

export async function createWorkshop(workshopData) {
  try {
    const response = await apiClient.post('/Auth/workshop/create', workshopData);
    return assertApiSuccess(response.data, 'Registration failed.');
  } catch (error) {
    return handleApiError(error, 'Workshop registration');
  }
}
