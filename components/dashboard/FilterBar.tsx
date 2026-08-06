'use client';

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslations } from 'next-intl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
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
      <Select<SortBy>
        id="sort-by"
        value={sortBy}
        onChange={(event) => handleSortChange(event.target.value as SortBy)}
        size="small"
        className="min-w-32"
        inputProps={{ 'aria-label': t('sortBy') }}
        MenuProps={{
          slotProps: {
            paper: {
              className: 'mt-1 rounded-lg shadow-xl',
            },
          },
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>

      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <label htmlFor="search-coins" className="sr-only">
          {t('search')}
        </label>
        <TextField
          id="search-coins"
          type="text"
          value={searchQuery}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={t('search')}
          autoComplete="off"
          size="small"
          fullWidth
          slotProps={{
            htmlInput: { 'aria-label': t('search') },
            input: {
              className: 'text-sm pe-1.5',
              endAdornment: searchQuery ? (
                <IconButton
                  type="button"
                  onClick={clearSearch}
                  aria-label={t('clearSearch')}
                  className="text-slate-500 hover:text-slate-200"
                  size="small"
                >
                  <CloseIcon sx={{ fontSize: 16 }} aria-hidden="true" />
                </IconButton>
              ) : undefined,
            },
          }}
        />
      </div>
    </div>
  );
}
