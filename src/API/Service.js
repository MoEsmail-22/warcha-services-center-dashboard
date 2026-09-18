import { apiFetch } from './client';

async function parseResponse(response, action) {
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || `${action} failed: ${response.status}`);
  }

  return result;
}

export async function getServices() {
  const response = await apiFetch('/Workshop/service');
  return parseResponse(response, 'Loading services');
}

export async function createService(serviceData) {
  const response = await apiFetch('/Workshop/service', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });

  return parseResponse(response, 'Creating service');
}

export async function editService(id, serviceData) {
  const response = await apiFetch(`/Workshop/service/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(serviceData),
  });

  return parseResponse(response, 'Updating service');
}

export async function removeService(id) {
  const response = await apiFetch(`/Workshop/service/${id}`, { method: 'DELETE' });
  return parseResponse(response, 'Deleting service');
}

export async function updateProfile(id, profileData) {
  const response = await apiFetch(`/Workshop/update-profile/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || `Profile update failed: ${response.status}`);
  }

  return result;
}

export async function updateSettings(id, settingsData) {
  const response = await apiFetch(`/Workshop/update-settings/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settingsData),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || `Settings update failed: ${response.status}`);
  }

  return result;
}
