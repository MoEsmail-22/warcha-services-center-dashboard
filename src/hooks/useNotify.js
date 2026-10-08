import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/contexts/ToastContext';
import { useErrorMessage } from './useErrorMessage';

/**
 * One-line toasts with translated text.
 *
 *   const notify = useNotify();
 *   notify.success('serviceSaved');          // common.json → notifications.serviceSaved
 *   notify.error(error, 'service.delete');   // errors.json, picked by useErrorMessage
 */
export function useNotify() {
  const { showToast } = useToast();
  const { getErrorMessage } = useErrorMessage();
  const { t } = useTranslation('common', { useSuspense: false });

  const success = useCallback(
    (key) => showToast('success', t(`notifications.${key}`)),
    [showToast, t]
  );

  const error = useCallback(
    (err, action) => showToast('error', getErrorMessage(err, action)),
    [showToast, getErrorMessage]
  );

  return useMemo(() => ({ success, error }), [success, error]);
}

export default useNotify;
