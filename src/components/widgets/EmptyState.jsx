/**
 * EmptyState — friendly placeholder when a table or list has no data.
 * Used inside table cells (colSpan), cards and lists so every empty view looks the same.
 *
 * `compact` uses less vertical space (small cards, side lists).
 * RTL-aware: symmetric centered layout, no direction-specific code.
 */
import { cn } from '@/utils/cn';

export function EmptyState({ icon, title, description, action, compact = false, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-8' : 'py-14',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'mb-3 flex items-center justify-center rounded-full bg-[#F6F3EE] text-[#8A8074]',
            compact ? 'h-10 w-10 [&>svg]:h-5 [&>svg]:w-5' : 'h-12 w-12 [&>svg]:h-6 [&>svg]:w-6'
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}

      <p className="text-sm font-semibold text-[#1C1712]">{title}</p>

      {description && <p className="mt-1 max-w-sm text-sm text-[#5A6968]">{description}</p>}

      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export default EmptyState;
