'use client';

import { useCoins } from '@/hooks/useCoins';

export default function Home() {
  const { data, isLoading, isError, error, dataUpdatedAt } = useCoins();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="animate-pulse text-slate-400">Loading coin data...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="text-red-400">Error: {(error as Error).message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-slate-950 text-slate-50">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Market Pulse — Phase 2 Test</h1>
        <p className="text-slate-400 mt-1">Live coin data from CoinGecko via React Query (polling 60s)</p>
      </header>

      <div className="mb-4 text-sm text-slate-400">
        <p>Last updated: {dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString() : '—'}</p>
        <p>Coins loaded: {data?.length ?? 0}</p>
      </div>

      <pre className="bg-slate-900 border border-slate-700 rounded-lg p-4 overflow-x-auto text-xs text-slate-200 max-h-[70vh]">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}