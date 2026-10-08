/**
 * ToastContext — small pop-up messages for success and errors.
 * Styled like the Admin Dashboard's ActionToast so both apps feel the same.
 *
 *   const { showToast } = useToast();
 *   showToast('success', 'Service saved');
 *   showToast('error', 'Something went wrong');
 *
 * Most code should use useNotify() instead, which also translates the text.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const ToastContext = createContext(null);

// Same timings as the Admin Dashboard.
const DURATION_MS = { success: 3500, error: 5000 };
const MAX_VISIBLE = 5;
// Matches the action-toast-pop-out animation in index.css.
const EXIT_MS = 220;

const STYLES = {
  success: {
    icon: Check,
    titleKey: 'toast.success',
    titleFallback: 'Success',
    badge: 'bg-[#EAF8EF] text-[#2F9E5B]',
  },
  error: {
    icon: X,
    titleKey: 'toast.error',
    titleFallback: 'Something went wrong',
    badge: 'bg-[#FDECEC] text-[#D64545]',
  },
};

function ToastItem({ toast, onClose }) {
  const { t } = useTranslation('common', { useSuspense: false });
  const style = STYLES[toast.type] ?? STYLES.success;
  const Icon = style.icon;
  const [leaving, setLeaving] = useState(false);

  // Time left before closing; hovering pauses it so longer messages can be read.
  const remaining = useRef(DURATION_MS[toast.type] ?? 4000);
  const startedAt = useRef(0);
  const timer = useRef(null);

  const close = useCallback(() => {
    clearTimeout(timer.current);
    setLeaving(true);
    // Let the pop-out animation finish before removing the toast.
    setTimeout(() => onClose(toast.id), EXIT_MS);
  }, [onClose, toast.id]);

  const resume = useCallback(() => {
    startedAt.current = Date.now();
    timer.current = setTimeout(close, remaining.current);
  }, [close]);

  const pause = () => {
    clearTimeout(timer.current);
    remaining.current -= Date.now() - startedAt.current;
  };

  useEffect(() => {
    resume();
    return () => clearTimeout(timer.current);
  }, [resume]);

  return (
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={cn(
        'action-toast pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-[#E8E2D8] bg-white px-4 py-3.5',
        'shadow-[0_14px_36px_rgba(28,23,18,0.16)]',
        leaving ? 'action-toast--hidden' : 'action-toast--visible'
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          style.badge
        )}
        aria-hidden="true"
      >
        <Icon className="h-5 w-5" strokeWidth={2.4} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-[#1C1712]">
          {t(style.titleKey, { defaultValue: style.titleFallback })}
        </p>
        <p className="mt-0.5 text-sm leading-5 text-[#6F665C]">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={close}
        className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[#8A8074] transition-colors hover:bg-[#F6F3EE] hover:text-[#1C1712] focus-visible:ring-2 focus-visible:ring-[#E08B2F]/40 focus-visible:outline-none"
        aria-label={t('actions.close', { defaultValue: 'Close' })}
      >
        <X className="h-4 w-4" strokeWidth={2} />
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
    // Keep at most MAX_VISIBLE on screen; the oldest goes first.
    setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, type, message }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Top-center like the Admin Dashboard. z-[70] stays above dialogs and the loader. */}
      <div
        aria-live="polite"
        className="pointer-events-none fixed top-5 left-1/2 z-[70] flex w-[min(420px,calc(100vw-32px))] -translate-x-1/2 flex-col gap-3"
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
