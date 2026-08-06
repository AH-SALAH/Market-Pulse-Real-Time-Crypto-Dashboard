import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WatchlistView } from '@/components/dashboard/WatchlistView';

interface WatchlistPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: WatchlistPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'WatchlistPage' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function WatchlistPage() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <WatchlistView />
    </main>
  );
}
