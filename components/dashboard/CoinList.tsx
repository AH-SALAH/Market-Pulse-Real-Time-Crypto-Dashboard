'use client';

import { cn } from '@/lib/cn';
import { useCoins } from '@/hooks/useCoins';
import { CoinCard } from './CoinCard';

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

  const coins = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={cn('h-1.5 w-1.5 rounded-full', isRefetching ? 'bg-emerald-400' : 'bg-emerald-500/50')}
            aria-hidden="true"
          />
          Live · polled every 60s
        </span>
        <span className="font-mono tabular-nums">
          {dataUpdatedAt
            ? `Updated ${new Date(dataUpdatedAt).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}`
            : '—'}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coins.map((coin, index) => (
          <CoinCard key={coin.id} coin={coin} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
