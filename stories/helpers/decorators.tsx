import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import filtersReducer, { type SortBy } from '@/store/slices/filtersSlice';
import { watchlistQueryKey } from '@/hooks/useWatchlist';
import { alertsQueryKey } from '@/hooks/useAlerts';

// Shared decorators for the dashboard components (all rendered on the app's
// dark slate background so the slate-* Tailwind classes read correctly).

export function DarkBackground({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100%',
        background: '#0f172a',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

// WatchlistButton (inside CoinCard) runs React Query hooks — wrap stories in a
// real QueryClient. retry:false keeps failed /api calls quiet in the iframe;
// seeding an empty watchlist cache means the query never hits the (absent)
// /api/watchlist route, so stories render without network errors.
export function QueryClientDecorator(Story: () => ReactNode) {
  const client = useMemo(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false, staleTime: Infinity },
        mutations: { retry: false },
      },
    });
    queryClient.setQueryData(watchlistQueryKey, []);
    queryClient.setQueryData(alertsQueryKey, []);
    return queryClient;
  }, []);
  return (
    <QueryClientProvider client={client}>
      <DarkBackground>
        <Story />
      </DarkBackground>
    </QueryClientProvider>
  );
}

interface ReduxOptions {
  searchQuery?: string;
  sortBy?: SortBy;
}

// Fresh per-story Redux store (real filtersSlice reducer, so the FilterBar's
// dispatch/select wiring is exercised for real, not mocked).
export function ReduxDecorator(Story: () => ReactNode, options: ReduxOptions = {}) {
  const store = useMemo(
    () =>
      configureStore({
        reducer: { filters: filtersReducer },
        preloadedState: {
          filters: { searchQuery: options.searchQuery ?? '', sortBy: options.sortBy ?? 'market_cap' },
        },
      }),
    [options.searchQuery, options.sortBy],
  );
  return (
    <Provider store={store}>
      <DarkBackground>
        <Story />
      </DarkBackground>
    </Provider>
  );
}

export function PlainDecorator(Story: () => ReactNode) {
  return (
    <DarkBackground>
      <Story />
    </DarkBackground>
  );
}
