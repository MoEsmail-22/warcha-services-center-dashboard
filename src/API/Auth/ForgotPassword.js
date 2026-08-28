const API_BASE_URL = import.meta.env.DEV
  ? '/api/v1'
  : (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export async function forgotPassword(email) {
  const response = await fetch(`${API_BASE_URL}/Auth/workshop/forgot-password`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || `Request failed: ${response.status}`);
  }

  return result;
}
