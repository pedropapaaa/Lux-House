import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 2 minutes default stale time — most data doesn't change often
      staleTime: 1000 * 60 * 2,
      // Keep unused data in cache for 5 minutes
      gcTime: 1000 * 60 * 5,
      retry: 1,
      // Don't refetch when window regains focus on payment/ticket pages (sensitive flows)
      refetchOnWindowFocus: false,
    },
  },
});
