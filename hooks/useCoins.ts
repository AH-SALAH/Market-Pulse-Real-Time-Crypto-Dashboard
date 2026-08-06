'use client';

import { useQuery } from '@tanstack/react-query';
import { getCoins, type Coin } from '@/lib/coingecko';

export function useCoins() {
  return useQuery<Coin[]>({
    queryKey: ['coins'],
    queryFn: getCoins,
    refetchInterval: 60000, // Poll every 60 seconds for real-time feel
    staleTime: 30000,
  });
}