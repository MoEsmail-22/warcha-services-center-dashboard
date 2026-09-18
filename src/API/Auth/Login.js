const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/Auth/workshop/login`, {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const result = await response.json().catch(() => null);

  console.log('Login API response:', result);

  if (!response.ok) {
    throw new Error(result?.message || `Login failed: ${response.status}`);
  }
  return result;
}
