import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

/**
 * A section that stays open on desktop and becomes an accessible accordion on mobile.
 * Use it for long page sections where mobile users benefit from seeing one section at a time.
 */
export function ResponsiveAccordion({ title, children, defaultOpen = false, className }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <section className={cn('overflow-hidden rounded-2xl', className)}>
      <h2 className="border-b border-gray-200">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start md:cursor-default"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((current) => !current)}
        >
          <span className="text-base font-semibold text-[#15201F]">{title}</span>
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'text-primary h-5 w-5 shrink-0 transition-transform duration-200 md:hidden',
              isOpen && 'rotate-180'
            )}
          />
        </button>
      </h2>

      <div className={cn(isOpen ? 'block' : 'hidden', 'md:block')}>{children}</div>
    </section>
  );
}

export default ResponsiveAccordion;
