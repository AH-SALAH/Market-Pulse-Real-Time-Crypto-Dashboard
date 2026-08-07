'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addToWatchlist as apiAdd,
  getWatchlist,
  removeFromWatchlist as apiRemove,
  type WatchlistItem,
} from '@/lib/watchlist';
import { loadWatchlist, saveWatchlist } from '@/lib/watchlistStorage';
import { watchlist_added, watchlist_removed } from '@/lib/analytics/events';

export const watchlistQueryKey = ['watchlist'] as const;

export interface WatchlistMutationVariables {
  coinId: string;
  coinName: string;
}

// Server is the source of truth when it has items. The localStorage copy only
// kicks in when the server comes back empty (e.g. dev-server restart wiped the
// in-memory store) — then the list is re-pushed to the server so it heals.
async function fetchWatchlistWithCache(): Promise<WatchlistItem[]> {
  const server = await getWatchlist();
  if (server.length === 0) {
    const cached = loadWatchlist();
    if (cached && cached.length > 0) {
      try {
        for (const item of cached) {
          await apiAdd(item.coinId);
        }
      } catch (error) {
        console.warn('Watchlist server heal failed — using local cache:', error);
      }
      return cached;
    }
  }
  saveWatchlist(server);
  return server;
}

export function useWatchlist() {
  return useQuery<WatchlistItem[]>({
    queryKey: watchlistQueryKey,
    queryFn: fetchWatchlistWithCache,
    refetchInterval: 60000, // Poll every 60 seconds for real-time feel
    staleTime: 30000,
  });
}

interface MutationContext {
  previous?: WatchlistItem[];
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  return useMutation<WatchlistItem[], Error, WatchlistMutationVariables, MutationContext>({
    mutationFn: ({ coinId }) => apiAdd(coinId),
    onMutate: async ({ coinId }) => {
      await queryClient.cancelQueries({ queryKey: watchlistQueryKey });
      const previous = queryClient.getQueryData<WatchlistItem[]>(watchlistQueryKey);
      // Optimistic update: show the coin as saved instantly (no spinner wait).
      queryClient.setQueryData<WatchlistItem[]>(watchlistQueryKey, (old) => [
        { coinId, addedAt: new Date().toISOString() },
        ...(old ?? []).filter((item) => item.coinId !== coinId),
      ]);
      return { previous };
    },
    onSuccess: (_items, variables) => {
      watchlist_added({ coin_id: variables.coinId, coin_name: variables.coinName });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(watchlistQueryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistQueryKey });
    },
  });
}

export function useRemoveFromWatchlist() {
  const queryClient = useQueryClient();
  return useMutation<WatchlistItem[], Error, WatchlistMutationVariables, MutationContext>({
    mutationFn: ({ coinId }) => apiRemove(coinId),
    onMutate: async ({ coinId }) => {
      await queryClient.cancelQueries({ queryKey: watchlistQueryKey });
      const previous = queryClient.getQueryData<WatchlistItem[]>(watchlistQueryKey);
      // Optimistic update: remove instantly, roll back on error.
      queryClient.setQueryData<WatchlistItem[]>(watchlistQueryKey, (old) =>
        (old ?? []).filter((item) => item.coinId !== coinId),
      );
      return { previous };
    },
    onSuccess: (_items, variables) => {
      watchlist_removed({ coin_id: variables.coinId, coin_name: variables.coinName });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(watchlistQueryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: watchlistQueryKey });
    },
  });
}
