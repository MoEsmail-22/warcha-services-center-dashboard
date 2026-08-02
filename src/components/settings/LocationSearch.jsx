import { useCallback, useEffect, useState } from 'react';
import { LoaderCircle, MapPin, Search, X } from 'lucide-react';
import { useAppTranslation } from '@/hooks/useAppTranslation';

const MAPTILER_API_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
const MINIMUM_QUERY_LENGTH = 3;

/**
 * Searches MapTiler's geocoding API and lets the parent map own the selected pin.
 * Keeping it separate makes this search field reusable with another location picker.
 */
export default function LocationSearch({ position, onLocationSelect }) {
  const { t, i18n } = useAppTranslation('settings');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const searchLocations = useCallback(
    async (searchQuery, signal) => {
      if (!MAPTILER_API_KEY) {
        setResults([]);
        setSearchError(t('locationSearchUnavailable'));
        return;
      }

      setIsSearching(true);
      setSearchError('');

      try {
        const params = new URLSearchParams({
          key: MAPTILER_API_KEY,
          limit: '5',
          language: i18n.language === 'ar' ? 'ar' : 'en',
          proximity: `${position.lng},${position.lat}`,
          country: 'eg',
          // MapTiler does not include points of interest in its default types.
          // Adding `poi` makes named shops, businesses, and landmarks searchable.
          types: 'poi,address,place,municipality,locality,neighbourhood,road',
        });
        const response = await fetch(
          `https://api.maptiler.com/geocoding/${encodeURIComponent(searchQuery)}.json?${params}`,
          { signal }
        );

        if (!response.ok) throw new Error('MapTiler search failed');

        const data = await response.json();
        setResults(Array.isArray(data.features) ? data.features : []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          setResults([]);
          setSearchError(t('locationSearchError'));
        }
      } finally {
        if (!signal?.aborted) setIsSearching(false);
      }
    },
    [i18n.language, position.lat, position.lng, t]
  );

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MINIMUM_QUERY_LENGTH) {
      setResults([]);
      setSearchError('');
      setIsSearching(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => searchLocations(trimmedQuery, controller.signal),
      350
    );

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query, searchLocations]);

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    // This input sits inside the Settings page form. Prevent that outer form
    // from saving and closing the picker when the user intends to search.
    event.preventDefault();
    event.stopPropagation();

    const trimmedQuery = query.trim();
    if (trimmedQuery.length >= MINIMUM_QUERY_LENGTH) {
      searchLocations(trimmedQuery);
    }
  };

  const selectResult = (result) => {
    const [longitude, latitude] = result.center ?? [];
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return;

    onLocationSelect({ lat: latitude, lng: longitude });
    setQuery('');
    setResults([]);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearchError('');
  };

  return (
    <div className="relative mb-3">
      <label htmlFor="location-search" className="sr-only">
        {t('searchLocation')}
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 rtl:right-3 rtl:left-auto" aria-hidden="true" />
        <input
          id="location-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('searchLocationPlaceholder')}
          className="input h-11 ps-10 pe-10"
          autoComplete="off"
        />
        {isSearching ? (
          <LoaderCircle className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400 rtl:right-auto rtl:left-3" aria-label={t('searchingLocation')} />
        ) : query ? (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 rtl:right-auto rtl:left-2"
            aria-label={t('clearLocationSearch')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      {results.length > 0 && (
        <ul className="absolute z-[1100] mt-1 max-h-56 w-full overflow-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg" role="listbox">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => selectResult(result)}
                className="flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-start text-sm hover:bg-gray-50 focus:bg-gray-50"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{result.place_name ?? result.text}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchError && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{searchError}</p>}
    </div>
  );
}
