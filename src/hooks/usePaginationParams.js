import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/** Page sizes the user can pick from; the first one is the default. */
export const PAGE_SIZE_OPTIONS = [10, 20, 50];

/**
 * Keeps a table's page number and page size in the URL, e.g. ?page=2&size=20.
 * Pass a prefix when one page has several tables: usePaginationParams('offers')
 * → ?offersPage=2&offersSize=20.
 */
export function usePaginationParams(prefix = '') {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageKey = prefix ? `${prefix}Page` : 'page';
  const sizeKey = prefix ? `${prefix}Size` : 'size';

  const requestedSize = Number(searchParams.get(sizeKey));
  const pageSize = PAGE_SIZE_OPTIONS.includes(requestedSize) ? requestedSize : PAGE_SIZE_OPTIONS[0];

  const requestedPage = Number(searchParams.get(pageKey));
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const update = useCallback(
    (nextPage, nextSize) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set(pageKey, String(nextPage));
          next.set(sizeKey, String(nextSize));
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams, pageKey, sizeKey]
  );

  const setPage = useCallback((nextPage) => update(nextPage, pageSize), [update, pageSize]);
  // A new page size changes how many pages exist, so start again from page 1.
  const setPageSize = useCallback((nextSize) => update(1, nextSize), [update]);

  return { page, pageSize, setPage, setPageSize };
}

export default usePaginationParams;
