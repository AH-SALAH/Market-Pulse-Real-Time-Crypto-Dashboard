'use client';

import { Header } from '@/components/Header';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { CoinList } from '@/components/dashboard/CoinList';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <section className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Markets</h1>
          <p className="mt-1 text-sm text-slate-400">Top cryptocurrencies by market cap, refreshed live.</p>
        </section>
        <div className="mb-6">
          <FilterBar />
        </div>
        <CoinList />
      </main>
    </div>
  );
}
