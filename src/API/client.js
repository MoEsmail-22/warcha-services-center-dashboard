const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

const getAccessToken = () => {
  const devAuthEnabled = import.meta.env.VITE_ENABLE_DEV_AUTH === 'true';
  return devAuthEnabled && import.meta.env.VITE_DEV_ACCESS_TOKEN
    ? import.meta.env.VITE_DEV_ACCESS_TOKEN
    : localStorage.getItem('auth_token');
};

export function getApiUrl(path) {
  return `${API_BASE_URL}/${path.replace(/^\//, '')}`;
}

export function getAuthHeaders(headers = {}) {
  const token = getAccessToken();

  return {
    Accept: '*/*',
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function apiFetch(path, options = {}) {
  return fetch(getApiUrl(path), {
    ...options,
    headers: getAuthHeaders(options.headers),
  });
}
