/**
 * Keep API errors consistent across every endpoint.
 *
 * Every error thrown from the API layer gets:
 *   error.code    → what kind of problem it is (see ERROR_CODES); the UI turns
 *                   this into a friendly, translated message (useErrorMessage)
 *   error.details → the backend's original text, for logs only — never shown to users
 *   error.status  → the HTTP status, when there was a response
 */

export const ERROR_CODES = {
  network: 'network', // no response: offline, server down, CORS
  validation: 'validation', // 400/422 or isSuccess: false — the request data was rejected
  unauthorized: 'unauthorized', // 401 — not signed in or session expired
  forbidden: 'forbidden', // 403 — signed in but not allowed
  notFound: 'notFound', // 404
  conflict: 'conflict', // 409 — blocked by related data
  tooManyRequests: 'tooManyRequests', // 429
  server: 'server', // 500+ — the backend crashed
  unknown: 'unknown',
};

function codeFromStatus(status) {
  if (status === 400 || status === 422) return ERROR_CODES.validation;
  if (status === 401) return ERROR_CODES.unauthorized;
  if (status === 403) return ERROR_CODES.forbidden;
  if (status === 404) return ERROR_CODES.notFound;
  if (status === 409) return ERROR_CODES.conflict;
  if (status === 429) return ERROR_CODES.tooManyRequests;
  if (status >= 500) return ERROR_CODES.server;
  return ERROR_CODES.unknown;
}

/** Joins ASP.NET validation errors ({ Email: ["required"] }) into one line for the logs. */
function readValidationErrors(errors) {
  if (Array.isArray(errors)) return errors.join('; ');
  if (errors && typeof errors === 'object') {
    return Object.entries(errors)
      .map(([field, messages]) => `${field}: ${[].concat(messages).join(', ')}`)
      .join('; ');
  }
  return null;
}

function createApiError({ code, details, status, payload }) {
  const error = new Error(details || code);
  error.code = code;
  error.details = details || '';
  error.status = status;
  error.payload = payload;
  return error;
}

/**
 * Errors found in the browser before any request is sent (e.g. end time before start).
 * `i18nKey` points to a message in errors.json; `fallback` is the English text.
 */
export function createLocalError(i18nKey, fallback) {
  const error = createApiError({ code: ERROR_CODES.validation, details: fallback });
  error.i18nKey = i18nKey;
  return error;
}

export function handleApiError(error, action) {
  // Errors we already created (local checks, assertApiSuccess) pass through unchanged.
  if (error?.code && ERROR_CODES[error.code]) throw error;

  if (error.response) {
    const body = error.response.data;
    const details =
      body?.message || body?.title || body?.detail || readValidationErrors(body?.errors) || '';
    console.error(`${action} failed (${error.response.status}):`, details || error.message);

    throw createApiError({
      code: codeFromStatus(error.response.status),
      details,
      status: error.response.status,
      payload: body,
    });
  }

  if (error.request) {
    console.error(`${action} failed: no response from the server.`);
    throw createApiError({ code: ERROR_CODES.network, details: error.message });
  }

  console.error(`${action} failed:`, error.message);
  throw createApiError({ code: ERROR_CODES.unknown, details: error.message });
}

/** The API sometimes answers 200 with { isSuccess: false } — treat it as a rejected request. */
export function assertApiSuccess(data, fallback) {
  if (data?.isSuccess === false) {
    throw createApiError({
      code: ERROR_CODES.validation,
      details: data.message || data.title || fallback,
      status: 200,
      payload: data,
    });
  }

  return data;
}
