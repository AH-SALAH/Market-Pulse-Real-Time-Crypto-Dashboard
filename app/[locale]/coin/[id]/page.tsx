import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { CoinDetailView } from '@/components/dashboard/CoinDetailView';

interface CoinDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

function capitalize(id: string): string {
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export async function generateMetadata({ params }: CoinDetailPageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'CoinDetail' });
  return {
    title: t('title', { coin: capitalize(id) }),
    description: t('description', { coin: id }),
  };
}

export default async function CoinDetailPage({ params }: CoinDetailPageProps) {
  const { id } = await params;

  return <CoinDetailView coinId={id} />;
}
