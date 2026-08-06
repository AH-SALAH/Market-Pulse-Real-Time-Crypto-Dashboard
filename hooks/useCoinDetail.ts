'use client';

import { useQuery } from '@tanstack/react-query';
import { getCoinChart, type CoinChartData } from '@/lib/coingecko';

export function useCoinDetail(coinId: string, days: number) {
  return useQuery<CoinChartData>({
    queryKey: ['coin', coinId, days],
    queryFn: () => getCoinChart(coinId, days),
    refetchInterval: 60000, // Poll every 60 seconds for real-time feel
    staleTime: 30000,
    enabled: Boolean(coinId),
  });
}
