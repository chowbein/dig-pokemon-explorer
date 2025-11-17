/**
 * Pokemon Data Fetching Hooks
 * Custom React hooks for fetching Pokemon data using React Query.
 */

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchPokemonList, fetchPokemon } from '../services/api';
import type { PokemonListResponse, Pokemon } from '../types/pokemon';

/**
 * Custom hook for infinite scrolling Pokemon list.
 * Uses React Query's useInfiniteQuery for efficient pagination.
 * 
 * - Fetches paginated Pokemon lists with automatic page management
 * - getNextPageParam extracts offset from API's next URL for pagination
 * - Query key: ['pokemonList'], uses fetchPokemonList service
 * - Each page contains 20 Pokemon items (limit=20)
 * 
 * @returns React Query infinite query object with Pokemon data and controls
 */
export function useInfinitePokemon() {
  return useInfiniteQuery<PokemonListResponse, Error>({
    queryKey: ['pokemonList'],
    queryFn: ({ pageParam }) => fetchPokemonList({ pageParam: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // Extract offset from next URL for infinite scrolling
      // API returns URLs like: https://pokeapi.co/api/v2/pokemon?limit=20&offset=20
      if (!lastPage.next) {
        return undefined; // No more pages
      }

      try {
        const url = new URL(lastPage.next);
        const offset = url.searchParams.get('offset');
        return offset ? parseInt(offset, 10) : undefined;
      } catch {
        // Fallback: calculate offset from current results length
        // This handles edge cases where URL parsing fails
        return undefined;
      }
    },
  });
}

/**
 * Custom hook for fetching individual Pokemon data.
 * Uses React Query's useQuery for efficient data fetching with caching.
 * 
 * - Fetches complete Pokemon data including sprites and types
 * - Automatically caches results to avoid redundant API calls
 * - Used for individual Pokemon cards (N+1 query pattern)
 * 
 * @param url - Pokemon API URL from PokemonListItem
 * @returns React Query query object with Pokemon data
 */
export function usePokemon(url: string | null) {
  return useQuery<Pokemon, Error>({
    queryKey: ['pokemon', url],
    queryFn: () => fetchPokemon(url!),
    enabled: !!url, // Only fetch if URL is provided
    staleTime: 1000 * 60 * 10, // 10 minutes (Pokemon data doesn't change often)
  });
}
