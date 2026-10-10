/**
 * Development only: prints API requests and their full responses in the browser
 * console, grouped and collapsed. Nothing is logged in production builds.
 *
 *   logResponse('Bookings API', 'GET bookings list', response);
 *   logError('Bookings API', 'GET bookings list', error);
 */
function logGroup(area, label, status, color, config, payload) {
  if (!import.meta.env.DEV) return;
  console.groupCollapsed(`%c[${area}] ${label} → ${status}`, `color:${color};font-weight:bold`);
  console.log('Request:', config?.method?.toUpperCase(), config?.url, {
    params: config?.params,
    body: config?.data,
  });
  console.log('Response:', payload);
  console.groupEnd();
}

export function logResponse(area, label, response) {
  logGroup(area, label, response.status, '#0E5C5B', response.config, response.data);
}

/** For failed requests the backend's error body is the useful part. */
export function logError(area, label, error) {
  logGroup(
    area,
    label,
    error.response?.status ?? 'no response',
    '#D64545',
    error.config,
    error.response?.data ?? error.message
  );
}
