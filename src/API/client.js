import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: '*/*',
    'Content-Type': 'application/json',
  },
});

let refreshPromise = null;

function clearSavedSession() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_token_expires_at');
    localStorage.removeItem('auth_refresh_token');
    localStorage.removeItem('auth_refresh_token_expires_at');
    localStorage.removeItem('auth_user');
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:session-expired'));
  }
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('auth_refresh_token');
  if (!refreshToken) throw new Error('No refresh token is available.');

  const response = await axios.post(
    `${baseURL}/Auth/client/refresh-token`,
    { refreshToken },
    {
      headers: {
        Accept: '*/*',
        'Content-Type': 'application/json',
      },
    }
  );

  const result = response.data;
  if (result?.isSuccess === false) {
    throw new Error(result.message || 'Unable to refresh the session.');
  }

  const tokenData = result?.data || result;
  const accessToken = tokenData?.accessToken || tokenData?.token;
  const nextRefreshToken = tokenData?.refreshToken;
  if (!accessToken) throw new Error('The refresh endpoint returned no access token.');

  localStorage.setItem('auth_token', accessToken);
  if (nextRefreshToken) localStorage.setItem('auth_refresh_token', nextRefreshToken);
  if (tokenData.expiresAt) localStorage.setItem('auth_token_expires_at', tokenData.expiresAt);
  if (tokenData.refreshTokenExpiresAt) {
    localStorage.setItem('auth_refresh_token_expires_at', tokenData.refreshTokenExpiresAt);
  }

  return accessToken;
}

export const isDemoMode = () =>
  typeof localStorage !== 'undefined' && localStorage.getItem('demo_mode') === 'true';

apiClient.interceptors.request.use((config) => {
  // Keep demo mode entirely local while returning the same response envelope as the API.
  if (isDemoMode() && !config.skipDemoMode) {
    config.adapter = async (requestConfig) => ({
      data: { isSuccess: true, data: [], message: 'demo' },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: requestConfig,
      request: {},
    });
    return config;
  }

  const devAuthEnabled = import.meta.env.VITE_ENABLE_DEV_AUTH === 'true';
  const token =
    devAuthEnabled && import.meta.env.VITE_DEV_ACCESS_TOKEN
      ? import.meta.env.VITE_DEV_ACCESS_TOKEN
      : typeof localStorage !== 'undefined'
        ? localStorage.getItem('auth_token')
        : null;

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isRefreshRequest = originalRequest?.url?.includes('/Auth/client/refresh-token');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isRefreshRequest ||
      isDemoMode() ||
      (import.meta.env.VITE_ENABLE_DEV_AUTH === 'true' && import.meta.env.VITE_DEV_ACCESS_TOKEN)
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('auth_refresh_token');
    if (!refreshToken) {
      clearSavedSession();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearSavedSession();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
