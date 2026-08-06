import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { WatchlistView } from '@/components/dashboard/WatchlistView';

export const metadata: Metadata = {
  title: 'Watchlist · Market Pulse',
  description: 'Coins you are tracking, refreshed live.',
};

export default function WatchlistPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
        <WatchlistView />
      </main>
    </div>
  );
}
