const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export async function createWorkshop(workshopData) {
  const response = await fetch(`${API_BASE_URL}/Auth/workshop/create`, {
    method: 'POST',
    headers: {
      Accept: '*/*',

      'Content-Type': 'application/json',
    },
    body: JSON.stringify(workshopData),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || result?.title || `Registration failed: ${response.status}`);
  }

  return result;
}
