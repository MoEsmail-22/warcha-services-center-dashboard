import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ERROR_CODES } from '@/API/errors';
import { findKnownBackendError } from '@/utils/knownBackendErrors';

/**
 * Turns any error from the API layer into a short, translated message.
 *
 *   const { getErrorMessage } = useErrorMessage();
 *   getErrorMessage(error, 'service.delete');
 *
 * It tries, in order:
 *   1. the error's own key (local checks, e.g. "form.endBeforeStart")
 *   2. a translation of a known backend message → "Service 'X' already exists…"
 *   3. a message for this action + error code   → errors.json "service.delete.server"
 *   4. the general message for the error code   → errors.json "general.server"
 *   5. "Something went wrong"
 */
export function useErrorMessage() {
  const { t, i18n } = useTranslation('errors', { useSuspense: false });

  const getErrorMessage = useCallback(
    (error, action) => {
      if (!error) return '';

      const code = ERROR_CODES[error.code] ? error.code : ERROR_CODES.unknown;
      const known = findKnownBackendError(error.details ?? error.message);
      const candidates = [
        error.i18nKey,
        known?.key,
        action && `${action}.${code}`,
        `general.${code}`,
      ];

      const key = candidates.find((candidate) => candidate && i18n.exists(`errors:${candidate}`));
      return t(key ?? 'general.unknown', {
        // e.g. { name: 'adlf' } for "A service named “{{name}}” already exists"
        ...(key === known?.key ? known.values : {}),
        defaultValue: 'Something went wrong. Please try again.',
      });
    },
    [t, i18n]
  );

  return { getErrorMessage };
}

export default useErrorMessage;
