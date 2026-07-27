/**
 * StatCard — KPI metric card.
 *
 * RTL-aware: All spacing uses symmetric utilities (mb-4, mt-1, mt-2, gap-1).
 * The trend arrow (↑/↓) is direction-agnostic.
 *
 * No changes needed for RTL — works in both directions automatically.
 */
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/utils/cn';

const TREND_CLASSES = {
  up: 'text-status-completed',
  down: 'text-status-cancelled',
  neutral: 'text-primary-600',
};

export function StatCard({
  icon,
  value,
  label,
  change,
  subtext,
  trend = 'neutral',
  iconBg = 'bg-primary-50',
  onClick,
}) {
  const detail = change ?? subtext;

  return (
    <div onClick={onClick} className={cn('card p-6', onClick && 'card-hover cursor-pointer')}>
      {icon && (
        <div
          className={cn(
            'mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg',
            iconBg,
            'text-primary'
          )}
        >
          {icon}
        </div>
      )}

      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-600">{label}</p>

      {detail && (
        <p className={cn('mt-2 flex items-center gap-1 text-xs font-medium', TREND_CLASSES[trend])}>
          {trend === 'up' && <ArrowUp size={12} />}
          {trend === 'down' && <ArrowDown size={12} />}
          {detail}
        </p>
      )}
    </div>
  );
}

export default StatCard;
