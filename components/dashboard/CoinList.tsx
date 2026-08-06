'use client';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import type { Coin } from '@/lib/coingecko';
import { cn } from '@/lib/cn';
import { useCoins } from '@/hooks/useCoins';
import { CoinCard } from './CoinCard';

const NO_COINS: Coin[] = [];

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-slate-800" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 w-24 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-10 animate-pulse rounded bg-slate-800/70" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-3.5 w-16 animate-pulse rounded bg-slate-800" />
          <div className="h-5 w-12 animate-pulse rounded-full bg-slate-800/70" />
        </div>
      </div>
      <div className="h-[34px] w-full animate-pulse rounded bg-slate-800/50" />
    </div>
  );
}

export function CoinList() {
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
        aria-label="Loading coin list"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <SkeletonCard key={i} />
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
          Failed to load coin data: {(error as Error).message}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn('h-1.5 w-1.5 rounded-full', isRefetching ? 'bg-emerald-400' : 'bg-emerald-500/50')}
            aria-hidden="true"
          />
          Live · polled every 60s
        </span>
        <span className="flex items-center gap-3">
          {searchQuery && (
            <span>
              {visibleCoins.length} of {coins.length} coins
            </span>
          )}
          <span className="font-mono tabular-nums">
            {dataUpdatedAt
              ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}`
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
            No coins match{' '}
            <span className="font-medium text-slate-200">&ldquo;{searchQuery}&rdquo;</span>
          </p>
          <p className="text-xs text-slate-600">Try a different name or ticker symbol.</p>
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
