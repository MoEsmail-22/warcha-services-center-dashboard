import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

/** Shared pagination for paginated dashboard lists. */
export function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  labels = {},
  className,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const firstItem = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const lastItem = Math.min(safePage * pageSize, totalItems);
  const goToPage = (page) => onPageChange(Math.min(Math.max(page, 1), totalPages));

  return (
    <nav
      className={cn(
        'flex items-center justify-between gap-3 border-t border-gray-100 px-4 py-3',
        className
      )}
      aria-label={labels.navigation || 'Pagination'}
    >
      <p className="text-xs text-[#5A6968]">
        {labels.showing || 'Showing'}{' '}
        <span className="font-semibold text-[#15201F]">
          {firstItem}–{lastItem}
        </span>{' '}
        {labels.of || 'of'} <span className="font-semibold text-[#15201F]">{totalItems}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => goToPage(safePage - 1)}
          disabled={safePage === 1}
          aria-label={labels.previous || 'Previous page'}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            aria-current={safePage === page ? 'page' : undefined}
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-md text-xs font-semibold transition-colors',
              safePage === page ? 'bg-[#0E5C5B] text-white' : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => goToPage(safePage + 1)}
          disabled={safePage === totalPages}
          aria-label={labels.next || 'Next page'}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
        </button>
      </div>
    </nav>
  );
}

export default Pagination;
