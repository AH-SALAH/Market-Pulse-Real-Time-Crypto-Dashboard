'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAlert as apiCreate,
  deleteAlert as apiDelete,
  getAlerts,
  type AlertItem,
  type CreateAlertInput,
} from '@/lib/alerts';
import { price_alert_created } from '@/lib/analytics/events';

export const alertsQueryKey = ['alerts'] as const;

export function useAlerts() {
  return useQuery<AlertItem[]>({
    queryKey: alertsQueryKey,
    queryFn: getAlerts,
    refetchInterval: 60000, // Poll every 60 seconds for real-time feel
    staleTime: 30000,
  });
}

interface MutationContext {
  previous?: AlertItem[];
}

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation<AlertItem, Error, CreateAlertInput, MutationContext>({
    mutationFn: apiCreate,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: alertsQueryKey });
      const previous = queryClient.getQueryData<AlertItem[]>(alertsQueryKey);
      // Optimistic update: show the alert immediately (no spinner wait).
      queryClient.setQueryData<AlertItem[]>(alertsQueryKey, (old) => [
        {
          id: crypto.randomUUID(),
          coinId: input.coinId,
          coinName: input.coinName,
          targetPrice: input.targetPrice,
          note: input.note,
          createdAt: new Date().toISOString(),
        },
        ...(old ?? []),
      ]);
      return { previous };
    },
    onSuccess: (_alert, variables) => {
      price_alert_created({
        coin_id: variables.coinId,
        target_price: variables.targetPrice,
        note: variables.note,
      });
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(alertsQueryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: alertsQueryKey });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation<AlertItem[], Error, string, MutationContext>({
    mutationFn: apiDelete,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: alertsQueryKey });
      const previous = queryClient.getQueryData<AlertItem[]>(alertsQueryKey);
      // Optimistic update: remove instantly, roll back on error.
      queryClient.setQueryData<AlertItem[]>(alertsQueryKey, (old) =>
        (old ?? []).filter((item) => item.id !== id),
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(alertsQueryKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: alertsQueryKey });
    },
  });
}
