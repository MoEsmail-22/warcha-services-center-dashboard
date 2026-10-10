/**
 * LoadingScreen — one loading UI for the whole app.
 *
 * Variants:
 *   page       → fills the screen while a route or the session loads
 *   section    → sits inside a card or table while its data loads
 *   fullscreen → overlay that blocks the page during an action (used by useLoading)
 *
 * `delay` (ms) hides the loader for fast requests so the screen doesn't flash.
 */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import logo from '@/assets/warsha-logo-sm.png';
import { Spinner } from './Spinner';

export function LoadingScreen({ variant = 'section', message, delay = 0, className }) {
  // useSuspense: false — this is shown as a Suspense fallback, so it must never suspend itself.
  const { t } = useTranslation('common', { useSuspense: false });
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return undefined;
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  const text = message || t('loading.default', { defaultValue: 'Loading…' });

  if (variant === 'section') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn('flex flex-col items-center justify-center gap-3 py-12', className)}
      >
        <Spinner size="md" />
        <p className="text-sm text-[#5A6968]">{text}</p>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        'flex flex-col items-center justify-center gap-4',
        variant === 'fullscreen'
          ? 'fixed inset-0 z-[60] bg-white/75 backdrop-blur-[2px]'
          : 'min-h-screen bg-[#F6F3EE]',
        className
      )}
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <Spinner size="lg" className="absolute inset-0 h-20 w-20" />
        <img
          src={logo}
          alt=""
          width={44}
          height={44}
          className="h-11 w-11 rounded-lg object-contain"
        />
      </div>
      <p className="text-sm font-medium text-[#15201F]">{text}</p>
    </div>
  );
}

export default LoadingScreen;
