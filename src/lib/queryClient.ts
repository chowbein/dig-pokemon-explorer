import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client instance with default options.
 * - staleTime: 5 minutes (data considered fresh)
 * - refetchOnWindowFocus: disabled (prevents refetch on tab switch)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
