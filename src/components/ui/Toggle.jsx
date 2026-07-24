/**
 * Toggle — on/off switch with proper proportions + RTL support.
 * Track: 44px wide × 24px tall (standard iOS/Material size)
 * Thumb: 20px circle, moves 20px when toggled (right in LTR, left in RTL)
 */
import { cn } from '@/utils/cn';

export function Toggle({ checked, onChange, label, description, id, disabled }) {
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label htmlFor={id} className="block text-sm font-medium text-gray-900">
              {label}
            </label>
          )}
          {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
        </div>
      )}

      <div className="relative inline-flex items-center">
        {/* Wrapping the input and visual elements makes the whole switch clickable. */}
        <label
          className={cn(
            'relative inline-flex items-center',
            disabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          <input
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(event) => onChange?.(event.target.checked)}
            className="peer sr-only"
          />

          {/* Track */}
          <span
            className={cn(
              'block h-6 w-11 rounded-full transition-colors duration-200',
              'peer-focus-visible:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2',
              checked ? 'bg-primary' : 'bg-gray-300',
              disabled && 'opacity-50'
            )}
          />

          {/* Thumb — RTL-aware positioning + movement */}
          <span
            className={cn(
              'pointer-events-none absolute top-0.5 block h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200',
              'ltr:left-0.5 rtl:right-0.5',
              checked
                ? 'ltr:translate-x-5 rtl:-translate-x-5'
                : 'ltr:translate-x-0 rtl:translate-x-0'
            )}
          />
        </label>
      </div>
    </div>
  );
}

export default Toggle;
