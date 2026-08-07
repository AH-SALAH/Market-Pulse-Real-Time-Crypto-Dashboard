'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { useCoins } from '@/hooks/useCoins';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { Coin } from '@/lib/coingecko';
import { coin_selected } from '@/lib/analytics/events';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/cn';
import { PriceChangeBadge } from './PriceChangeBadge';
import { Sparkline } from './Sparkline';
import { WatchlistButton } from './WatchlistButton';

function SkeletonRow() {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-slate-800" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-28 animate-pulse rounded bg-slate-800" />
        <div className="h-3 w-12 animate-pulse rounded bg-slate-800/70" />
      </div>
      <div className="h-[30px] w-24 animate-pulse rounded bg-slate-800/50" />
      <div className="h-3.5 w-16 animate-pulse rounded bg-slate-800" />
      <div className="h-5 w-12 animate-pulse rounded-full bg-slate-800/70" />
    </li>
  );
}

interface WatchlistRow {
  coinId: string;
  addedAt: string;
  coin: Coin | undefined;
}

export function WatchlistView() {
  const t = useTranslations('Watchlist');
  const watchlistQuery = useWatchlist();
  const coinsQuery = useCoins();

  const items = watchlistQuery.data ?? [];
  const coins = coinsQuery.data ?? [];

  // Resolve watchlisted ids against the live market list (React Query cache,
  // no extra request). Coins missing from the market list (e.g. the CoinGecko
  // proxy fell back to its small fallback set, or the coin fell out of the top
  // list) are still rendered so saved items never vanish from the page.
  const coinsById = new Map(coins.map((coin) => [coin.id, coin]));
  const rows: WatchlistRow[] = items.map((item) => ({
    coinId: item.coinId,
    addedAt: item.addedAt,
    coin: coinsById.get(item.coinId),
  }));

  const hasSavedItems = items.length > 0;
  const resolvedCount = rows.filter((row) => row.coin).length;
  const hasUnresolved = resolvedCount < rows.length;

  const isLoading = watchlistQuery.isLoading || coinsQuery.isLoading;

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">{t('title')}</h1>
          <p className="mt-1 text-sm text-slate-400">{t('subtitle')}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              coinsQuery.isRefetching ? 'bg-emerald-400' : 'bg-emerald-500/50',
            )}
            aria-hidden="true"
          />
          {t('live')}
        </span>
      </section>

      {isLoading ? (
        <ul role="status" aria-label={t('loadingAria')} className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </ul>
      ) : watchlistQuery.isError && !hasSavedItems ? (
        <div
          className="flex flex-col items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center"
          role="alert"
        >
          <p className="text-sm text-red-300">
            {t('loadError', { message: (watchlistQuery.error as Error).message })}
          </p>
          <button
            type="button"
            onClick={() => watchlistQuery.refetch()}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
          >
            {t('retry')}
          </button>
        </div>
      ) : !hasSavedItems ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
          <p className="text-sm font-medium text-slate-200">{t('emptyTitle')}</p>
          <p className="max-w-sm text-sm text-slate-400">{t('emptyHint')}</p>
          <Link
            href="/"
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-slate-950 transition-colors hover:bg-blue-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            {t('browseMarkets')}
          </Link>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-10 text-center">
          <p className="text-sm font-medium text-slate-200">{t('unavailableTitle')}</p>
          <p className="max-w-sm text-sm text-slate-400">{t('unavailableHint')}</p>
        </div>
      ) : (
        <>
          {hasUnresolved && (
            <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
              {t('unavailableHint')}
            </p>
          )}
          <ul className="space-y-2" aria-label={t('listAria')}>
            {rows.map(({ coinId, coin }) =>
              coin ? (
                <li key={coinId}>
                  <Link
                    href={`/coin/${coin.id}`}
                    onClick={() =>
                      coin_selected({
                        coin_id: coin.id,
                        coin_name: coin.name,
                        coin_symbol: coin.symbol,
                      })
                    }
                    className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 transition-colors hover:border-slate-600 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <Image
                      src={coin.image}
                      alt=""
                      width={32}
                      height={32}
                      className="h-8 w-8 shrink-0 rounded-full"
                    />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-slate-100">
                        {coin.name}
                      </h2>
                      <p className="font-mono text-xs uppercase tracking-wide text-slate-400">
                        {coin.symbol}
                      </p>
                    </div>

                    <Sparkline
                      data={coin.sparkline_in_7d?.price ?? []}
                      className="ms-auto hidden h-[30px] w-24 shrink-0 sm:block"
                    />

                    <div className="ms-4 flex shrink-0 flex-col items-end gap-1 sm:ms-0">
                      <span className="font-mono text-sm font-semibold tabular-nums text-slate-100">
                        {formatPrice(coin.current_price)}
                      </span>
                      <PriceChangeBadge value={coin.price_change_percentage_24h ?? 0} />
                    </div>

                    <WatchlistButton coinId={coin.id} coinName={coin.name} />
                  </Link>
                </li>
              ) : (
                <li key={coinId}>
                  <Link
                    href={`/coin/${coinId}`}
                    className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 transition-colors hover:border-slate-600 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold uppercase text-slate-300">
                      {coinId.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-slate-100">{coinId}</h2>
                      <p className="text-xs text-slate-400">{t('rowUnavailable')}</p>
                    </div>
                    <span className="ms-auto font-mono text-sm tabular-nums text-slate-400">—</span>
                    <WatchlistButton coinId={coinId} coinName={coinId} className="ms-4" />
                  </Link>
                </li>
              ),
            )}
          </ul>
        </>
      )}
    </div>
  );
}
