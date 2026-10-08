import { tr } from 'date-fns/locale';
import apiClient, { isDemoMode } from './client';
import { assertApiSuccess, handleApiError } from './errors';

function getBackendServiceId(id) {
  const numericId = Number(id);
  if (isDemoMode()) return id;
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(
      'This service has no valid backend ID. Refresh the service list and try again.'
    );
  }
  return numericId;
}

/** The backend returns services one page at a time: { items, totalCount, totalPages, ... }. */

export async function getServiceCategories() {
  try {
    const response = await apiClient.get('/Workshop/service-categories');
    return assertApiSuccess(response.data, 'Failed to get service categories.');
  } catch (error) {
    return handleApiError(error, 'get service categories error');
  }
}

export async function getServices({ pageNumber = 1, pageSize = 10 } = {}) {
  try {
    const response = await apiClient.get('/Workshop/service', {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    });
    return assertApiSuccess(response.data, 'Failed to load services.');
  } catch (error) {
    return handleApiError(error, 'Load services');
  }
}

export async function createService(serviceData) {
  try {
    const response = await apiClient.post('/Workshop/service', serviceData, { skipDemoMode: true });
    return assertApiSuccess(response.data, 'Failed to create service.');
  } catch (error) {
    return handleApiError(error, 'Create service');
  }
}

export async function editService(id, serviceData) {
  try {
    const serviceId = getBackendServiceId(id);
    const requestBody = isDemoMode()
      ? serviceData
      : { ...serviceData, workshopServiceId: Number(serviceData.workshopServiceId ?? serviceId) };
    const response = await apiClient.put(`/Workshop/service/${serviceId}`, requestBody);
    return assertApiSuccess(response.data, 'Failed to update service.');
  } catch (error) {
    return handleApiError(error, 'Update service');
  }
}

export async function toggleServiceVisibility(id) {
  try {
    const serviceId = getBackendServiceId(id);
    const response = await apiClient.put(`/Workshop/service/toggle-visibility/${serviceId}`);
    return assertApiSuccess(response.data, 'Failed to change service visibility.');
  } catch (error) {
    return handleApiError(error, 'Change service visibility');
  }
}

export async function removeService(id) {
  try {
    const serviceId = getBackendServiceId(id);
    const response = await apiClient.delete(`/Workshop/service/${serviceId}`);
    return assertApiSuccess(response.data, 'Failed to delete service.');
  } catch (error) {
    return handleApiError(error, 'Delete service');
  }
}

export async function updateProfile(id, profileData) {
  try {
    const response = await apiClient.post(`/Workshop/update-profile/${id}`, profileData);
    return assertApiSuccess(response.data, 'Failed to update profile.');
  } catch (error) {
    return handleApiError(error, 'Update profile');
  }
}

export async function updateSettings(id, settingsData) {
  try {
    const response = await apiClient.post(`/Workshop/update-settings/${id}`, settingsData);
    return assertApiSuccess(response.data, 'Failed to update settings.');
  } catch (error) {
    return handleApiError(error, 'Update settings');
  }
}
