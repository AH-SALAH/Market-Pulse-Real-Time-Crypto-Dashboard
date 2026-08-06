'use client';

import { useState } from 'react';
import { useFormatter, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useCoinDetail } from '@/hooks/useCoinDetail';
import { useCoins } from '@/hooks/useCoins';
import { formatPrice } from '@/lib/format';
import { PriceChart } from './PriceChart';
import { RangeSelector } from './RangeSelector';
import { PriceChangeBadge } from './PriceChangeBadge';
import { WatchlistButton } from './WatchlistButton';

interface CoinDetailViewProps {
  coinId: string;
}

export function CoinDetailView({ coinId }: CoinDetailViewProps) {
  const t = useTranslations('CoinDetail');
  const format = useFormatter();
  const [days, setDays] = useState(7);
  const { data, isLoading, isError, error, refetch, dataUpdatedAt, isRefetching } =
    useCoinDetail(coinId, days);

  // Reuse the already-cached coin list from the dashboard (React Query cache,
  // no extra network request) just to resolve name/symbol/icon/current price.
  const coinsQuery = useCoins();
  const coin = coinsQuery.data?.find((c) => c.id === coinId);

  return (
    <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-slate-200"
      >
        <span aria-hidden="true" className="rtl:flip inline-block">
          &larr;
        </span>{' '}
        {t('back')}
      </Link>

      <section className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coin?.image}
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-full"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                {coin?.name ?? coinId.charAt(0).toUpperCase() + coinId.slice(1)}
              </h1>
              {coin && (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-slate-400">
                  {coin.symbol}
                </span>
              )}
            </div>
            {coin && (
              <div className="mt-1 flex items-center gap-2 text-sm">
                <span className="font-mono tabular-nums text-slate-200">
                  {formatPrice(coin.current_price)}
                </span>
                <PriceChangeBadge value={coin.price_change_percentage_24h ?? 0} />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <WatchlistButton coinId={coinId} coinName={coin?.name ?? coinId} label={t('watchlistLabel')} />
          <RangeSelector coinId={coinId} value={days} onChange={setDays} />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${isRefetching ? 'bg-emerald-400' : 'bg-emerald-500/50'}`}
            aria-hidden="true"
          />
          {t('live')}
        </span>
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
      </div>

      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        {isLoading ? (
          <div className="h-[320px] w-full animate-pulse rounded bg-slate-800/50" role="status" aria-label={t('chartLoading')} />
        ) : isError ? (
          <div
            className="flex flex-col items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-8 text-center"
            role="alert"
          >
            <p className="text-sm text-red-300">
              {t('chartError', { message: (error as Error).message })}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-500/20"
            >
              {t('retry')}
            </button>
          </div>
        ) : (
          <PriceChart prices={data?.prices ?? []} days={days} />
        )}
      </div>
    </div>
  );
}
