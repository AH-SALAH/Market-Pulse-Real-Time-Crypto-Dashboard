'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from './muiTheme';

// Module-scoped singleton so the cache survives locale navigation. Providers
// lives under app/[locale]/layout, and Next may remount it when the [locale]
// segment changes — a useState-created client would be rebuilt (cache wiped,
// watchlist flashes empty). Module state persists across those remounts.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}