const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export async function resetPassword(resetData) {
  const response = await fetch(`${API_BASE_URL}/Auth/workshop/reset-password`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(resetData),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || `Password reset failed: ${response.status}`);
  }

  return result;
}
