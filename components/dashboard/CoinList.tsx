'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useFormatter, useTranslations } from 'next-intl';
import type { RootState } from '@/store';
import type { Coin } from '@/lib/coingecko';
import { cn } from '@/lib/cn';
import { useCoins } from '@/hooks/useCoins';
import { CoinCard, CoinCardSkeleton } from './CoinCard';

const NO_COINS: Coin[] = [];

export function CoinList() {
  const t = useTranslations('CoinList');
  const format = useFormatter();
  const { data, isLoading, isError, error, refetch, isRefetching, dataUpdatedAt } = useCoins();

  // ==== Redux / React Query boundary (PLAN.md §4.3) ====
  // React Query (useCoins above) owns the server-fetched coin array.
  // Redux (filtersSlice) owns the ephemeral filter/sort state. The client-side
  // sort/filter below runs on the cached array with NO network refetch.
  const coins = data ?? NO_COINS;
  const searchQuery = useSelector((state: RootState) => state.filters.searchQuery);
  const sortBy = useSelector((state: RootState) => state.filters.sortBy);

  const visibleCoins = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? coins.filter(
          (coin) =>
            coin.name.toLowerCase().includes(query) ||
            coin.symbol.toLowerCase().includes(query),
        )
      : coins;

    if (sortBy === 'market_cap') return filtered;

    return [...filtered].sort((a, b) => {
      if (sortBy === 'price') return b.current_price - a.current_price;
      return (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0);
    });
  }, [coins, searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        role="status"
        aria-label={t('loadingAria')}
      >
        {Array.from({ length: 8 }, (_, i) => (
          <CoinCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center"
        role="alert"
      >
        <p className="text-sm text-red-300">
          {t('loadError', { message: (error as Error).message })}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn('h-1.5 w-1.5 rounded-full', isRefetching ? 'bg-emerald-400' : 'bg-emerald-500/50')}
            aria-hidden="true"
          />
          {t('live')}
        </span>
        <span className="flex items-center gap-3">
          {searchQuery && (
            <span>
              {t('count', { count: visibleCoins.length, total: coins.length })}
            </span>
          )}
          <span className="font-mono tabular-nums">
            {dataUpdatedAt
              ? t('updated', {
                  time: format.dateTime(new Date(dataUpdatedAt), {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }),
                })
              : '—'}
          </span>
        </span>
      </div>

      {visibleCoins.length === 0 ? (
        <div
          className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center"
          role="status"
        >
          <p className="text-sm text-slate-400">
            {t('noMatches')}{' '}
            <span className="font-medium text-slate-200">&ldquo;{searchQuery}&rdquo;</span>
          </p>
          <p className="text-xs text-slate-600">{t('noMatchesHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleCoins.map((coin, index) => (
            <CoinCard key={coin.id} coin={coin} rank={index + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
