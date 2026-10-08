/**
 * ToastContext — small pop-up messages for success and errors.
 *
 *   const { showToast } = useToast();
 *   showToast('success', 'Service saved');
 *   showToast('error', 'Something went wrong');
 *
 * Most code should use useNotify() instead, which also translates the text.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const ToastContext = createContext(null);

const DURATION_MS = { success: 3500, error: 6000 };

const STYLES = {
  success: { icon: CheckCircle2, box: 'border-emerald-200', icon_: 'text-emerald-600' },
  error: { icon: AlertCircle, box: 'border-red-200', icon_: 'text-red-600' },
};

function ToastItem({ toast, onClose }) {
  const { t } = useTranslation('common', { useSuspense: false });
  const style = STYLES[toast.type] ?? STYLES.success;
  const Icon = style.icon;

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), DURATION_MS[toast.type] ?? 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.type, onClose]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-white px-4 py-3 shadow-lg',
        'animate-[toast-in_0.2s_ease-out]',
        style.box
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', style.icon_)} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium text-[#15201F]">{toast.message}</p>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="rounded-md p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
        aria-label={t('actions.close', { defaultValue: 'Close' })}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((type, message) => {
    if (!message) return;
    const id = ++nextId.current;
    // Keep at most 4 on screen; the oldest goes first.
    setToasts((current) => [...current.slice(-3), { id, type, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* end-4 = right in English, left in Arabic. z-[70] stays above dialogs and the loader. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed end-4 top-4 z-[70] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a <ToastProvider>');
  return context;
}
