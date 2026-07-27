/**
 * Modal — centered dialog with backdrop.
 * Closes on Escape key + backdrop click.
 */
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Flexible dialog primitive. Title, body (children), footer, close behavior,
 * and styling are all optional; the original centered dialog remains the default.
 */
export function Modal({
  open,
  onClose,
  title = 'Dialog',
  children,
  size = 'md',
  footer,
  className,
  contentClassName,
  footerClassName,
  closeLabel = 'Close',
  dismissOnBackdrop = true,
  showCloseButton = true,
}) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={dismissOnBackdrop ? onClose : undefined}
    >
      <div
        className={cn('w-full rounded-2xl bg-white shadow-xl', SIZES[size], className)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label={closeLabel}
            >
              <X size={20} />
            </button>
          )}
        </div>
        <div className={cn('max-h-[70vh] overflow-y-auto px-6 py-4', contentClassName)}>
          {children}
        </div>
        {footer && (
          <div
            className={cn(
              'flex justify-end gap-3 border-t border-gray-100 px-6 py-4',
              footerClassName
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
