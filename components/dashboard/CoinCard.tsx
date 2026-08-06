'use client';

import Link from 'next/link';
import type { KeyboardEvent } from 'react';
import type { Coin } from '@/lib/coingecko';
import { coin_selected } from '@/lib/analytics/events';
import { formatPrice } from '@/lib/format';
import { PriceChangeBadge } from './PriceChangeBadge';
import { Sparkline } from './Sparkline';
import { WatchlistButton } from './WatchlistButton';

interface CoinCardProps {
  coin: Coin;
  rank?: number;
}

export function CoinCard({ coin, rank }: CoinCardProps) {
  const change = coin.price_change_percentage_24h ?? 0;

  function handleSelect() {
    coin_selected({
      coin_id: coin.id,
      coin_name: coin.name,
      coin_symbol: coin.symbol,
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLAnchorElement>) {
    // <Link> only activates on Enter; make Space work like a native button too.
    if (event.key === ' ') {
      event.preventDefault();
      event.currentTarget.click();
    }
  }

  return (
    <Link
      href={`/coin/${coin.id}`}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
      className="group flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors hover:border-slate-600 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
    >
      <div className="flex items-center gap-3">
        {rank !== undefined && (
          <span className="w-5 shrink-0 text-right font-mono text-sm font-semibold tabular-nums text-slate-600">
            {rank}
          </span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coin.image}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 shrink-0 rounded-full"
          loading="lazy"
        />
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-100">{coin.name}</h3>
          <p className="font-mono text-xs uppercase tracking-wide text-slate-500">{coin.symbol}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <WatchlistButton coinId={coin.id} coinName={coin.name} />
          <div className="flex flex-col items-end gap-1">
            <span className="font-mono text-sm font-semibold tabular-nums text-slate-100">
              {formatPrice(coin.current_price)}
            </span>
            <PriceChangeBadge value={change} />
          </div>
        </div>
      </div>

      <Sparkline data={coin.sparkline_in_7d?.price ?? []} className="h-[34px] w-full" />
    </Link>
  );
}

// Loading placeholder matching CoinCard's layout — used by CoinList and the
// CoinCard Storybook story so the skeleton lives beside the component it stands in for.
export function CoinCardSkeleton() {
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
