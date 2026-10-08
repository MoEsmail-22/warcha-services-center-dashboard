/**
 * Backend messages we recognise, mapped to keys in public/locales/{lang}/errors.json.
 * The API only replies in English, so known sentences get our own translated text.
 * Keys are lowercase, without the trailing period.
 */
export const KNOWN_BACKEND_ERRORS = {
  'invalid email or password': 'auth.invalidCredentials',
  'user not found': 'auth.userNotFound',
  'invalid token': 'auth.sessionInvalid',
  // A refreshed token without workshopId makes every /Workshop endpoint fail like this.
  'nullable object must have a value': 'auth.sessionInvalid',
  'invalid otp': 'auth.invalidOtp',
  'invalid or expired otp': 'auth.invalidOtp',
};

export function findKnownBackendError(details) {
  if (!details) return null;
  const normalized = String(details).trim().toLowerCase().replace(/\.$/, '');
  return KNOWN_BACKEND_ERRORS[normalized] ?? null;
}
