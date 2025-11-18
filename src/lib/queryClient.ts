import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client instance with default options.
 * - staleTime: 5 minutes (data considered fresh)
 * - refetchOnWindowFocus: disabled (prevents refetch on tab switch)
 * - retry: 2 (reduced retries to avoid excessive requests in incognito mode)
 * - retryDelay: exponential backoff
 * - networkMode: always (work in incognito/offline mode)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2, // Reduce from default 3 to 2 retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      networkMode: 'always', // Continue to work even when browser reports offline (incognito mode issue)
      refetchOnMount: false, // Don't refetch on mount if data is still fresh
    },
  },
});
