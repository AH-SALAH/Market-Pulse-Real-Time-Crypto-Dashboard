import type { Metadata } from 'next';
import { Header } from '@/components/Header';
import { CoinDetailView } from '@/components/dashboard/CoinDetailView';

interface CoinDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CoinDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${id.charAt(0).toUpperCase()}${id.slice(1)} · Market Pulse`,
    description: `Real-time price chart for ${id}`,
  };
}

export default async function CoinDetailPage({ params }: CoinDetailPageProps) {
  const { id } = await params;

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Header />
      <CoinDetailView coinId={id} />
    </div>
  );
}
