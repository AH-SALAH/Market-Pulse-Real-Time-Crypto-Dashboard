'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import type { AppDispatch, RootState } from '@/store';
import { setSearchQuery, setSortBy, type SortBy } from '@/store/slices/filtersSlice';
import { filter_applied, search_performed } from '@/lib/analytics/events';

const SEARCH_DEBOUNCE_MS = 300;

export function FilterBar() {
  const dispatch = useDispatch<AppDispatch>();
  const t = useTranslations('FilterBar');
  const sortBy = useSelector((state: RootState) => state.filters.sortBy);
  const searchQuery = useSelector((state: RootState) => state.filters.searchQuery);
  const lastReportedSearch = useRef('');

  const SORT_OPTIONS: Array<{ value: SortBy; label: string }> = [
    { value: 'market_cap', label: t('marketCap') },
    { value: 'price', label: t('price') },
    { value: 'change24h', label: t('change24h') },
  ];

  function handleSortChange(value: SortBy) {
    if (value === sortBy) return;
    dispatch(setSortBy(value));
    filter_applied({ filter_type: 'sort', filter_value: value });
  }

  function handleSearchChange(value: string) {
    dispatch(setSearchQuery(value));
  }

  function clearSearch() {
    dispatch(setSearchQuery(''));
  }

  // Debounced analytics: fire `search_performed` 300ms after the user stops typing.
  useEffect(() => {
    if (!searchQuery) {
      lastReportedSearch.current = '';
      return;
    }
    const timer = window.setTimeout(() => {
      if (searchQuery === lastReportedSearch.current) return;
      lastReportedSearch.current = searchQuery;
      search_performed({ search_term: searchQuery });
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="flex flex-wrap items-center gap-3" role="search">
      <label htmlFor="sort-by" className="text-sm font-medium text-slate-400">
        {t('sortBy')}
      </label>
      <select
        id="sort-by"
        value={sortBy}
        onChange={(event) => handleSortChange(event.target.value as SortBy)}
        className="h-9 rounded-lg border border-slate-800 bg-slate-900 px-3 text-sm text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} className="bg-slate-900">
            {option.label}
          </option>
        ))}
      </select>

      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <label htmlFor="search-coins" className="sr-only">
          {t('search')}
        </label>
        <input
          id="search-coins"
          type="text"
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={t('search')}
          autoComplete="off"
          className="h-9 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 pe-9 text-sm text-slate-200 placeholder:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label={t('clearSearch')}
            className="absolute end-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-slate-500 transition-colors hover:text-slate-200"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  );
}
