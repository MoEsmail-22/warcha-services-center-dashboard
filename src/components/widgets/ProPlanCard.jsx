import { Star } from 'lucide-react';
import { useAppTranslation } from '../../hooks/useAppTranslation';

export default function ProPlanCard() {
  const { t } = useAppTranslation('nav');

  return (
    <div className="rounded-xl border border-[#E08B2F] bg-[#2A2119] p-3 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/20">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">
            {t('proPlan.title', { defaultValue: 'Pro Plan' })}
          </p>
          <p className="truncate text-xs text-[#A89A8A]">
            {t('proPlan.subtitle', { defaultValue: 'Renews Jun 2026 · 12 jobs left today' })}
          </p>
        </div>
      </div>
    </div>
  );
}
