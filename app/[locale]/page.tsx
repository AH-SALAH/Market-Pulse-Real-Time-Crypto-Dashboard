import { getTranslations } from 'next-intl/server';
import { FilterBar } from '@/components/dashboard/FilterBar';
import { CoinList } from '@/components/dashboard/CoinList';

export default async function MarketsPage() {
  const t = await getTranslations('MarketsPage');

  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <section className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-100">{t('title')}</h1>
        <p className="mt-1 text-sm text-slate-400">{t('subtitle')}</p>
      </section>
      <div className="mb-6">
        <FilterBar />
      </div>
      <CoinList />
    </main>
  );
}
