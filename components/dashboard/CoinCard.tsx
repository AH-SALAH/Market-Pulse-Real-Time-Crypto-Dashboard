'use client';

import Link from 'next/link';
import type { KeyboardEvent } from 'react';
import type { Coin } from '@/lib/coingecko';
import { coin_selected } from '@/lib/analytics/events';
import { PriceChangeBadge } from './PriceChangeBadge';
import { Sparkline } from './Sparkline';

interface CoinCardProps {
  coin: Coin;
  rank?: number;
}

function formatPrice(price: number): string {
  const fractionDigits =
    price >= 1000 ? 0 : price >= 1 ? 2 : price >= 0.01 ? 4 : 6;
  return price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: Math.min(2, fractionDigits),
    maximumFractionDigits: fractionDigits,
  });
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
        <div className="ml-auto flex flex-col items-end gap-1">
          <span className="font-mono text-sm font-semibold tabular-nums text-slate-100">
            {formatPrice(coin.current_price)}
          </span>
          <PriceChangeBadge value={change} />
        </div>
      </div>

      <Sparkline data={coin.sparkline_in_7d?.price ?? []} className="h-[34px] w-full" />
    </Link>
  );
}
