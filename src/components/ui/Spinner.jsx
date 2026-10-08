/**
 * Spinner — small rotating ring in the brand teal.
 * Sizes: sm (buttons, inline text) | md (cards) | lg (full screen).
 */
import { cn } from '@/utils/cn';

const SIZES = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
};

export function Spinner({ size = 'md', className }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-block shrink-0 animate-spin rounded-full border-[#0E5C5B]/20 border-t-[#0E5C5B]',
        SIZES[size],
        className
      )}
    />
  );
}

export default Spinner;
