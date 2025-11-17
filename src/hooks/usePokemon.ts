/**
 * Pokemon Data Fetching Hooks
 * Custom React hooks for fetching Pokemon data using React Query.
 */

import { useInfiniteQuery, useQuery, useQueries } from '@tanstack/react-query';
import {
  fetchPokemonList,
  fetchPokemon,
  fetchPokemonByType,
  fetchPokemonDetail,
  fetchPokemonSpecies,
  fetchEvolutionChain,
} from '../services/api';
import type { PokemonListResponse, Pokemon, PokemonListItem, EvolutionChainItem } from '../types/pokemon';

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

/**
 * Custom hook for fetching Pokemon by multiple types.
 * Uses React Query's useQueries to fetch Pokemon for each selected type in parallel.
 * Returns intersection of Pokemon that have ALL selected types.
 * 
 * - Fetches Pokemon for each selected type in parallel
 * - Returns intersection (Pokemon that match all selected types)
 * - Automatically caches results for each type
 * 
 * @param selectedTypes - Array of Pokemon type names to filter by
 * @returns Object with filtered Pokemon list and loading/error states
 */
export function usePokemonByTypes(selectedTypes: string[]) {
  const queries = useQueries({
    queries: selectedTypes.map((type) => ({
      queryKey: ['pokemonByType', type],
      queryFn: () => fetchPokemonByType(type),
      enabled: selectedTypes.length > 0,
      staleTime: 1000 * 60 * 10, // 10 minutes
    })),
  });

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);
  const errors = queries.filter((query) => query.error).map((query) => query.error);

  // Calculate intersection of Pokemon that have ALL selected types
  let filteredPokemon: PokemonListItem[] = [];

  if (selectedTypes.length === 0) {
    // If no types selected, return empty array (will use regular list)
    filteredPokemon = [];
  } else if (queries.every((query) => query.data)) {
    const allTypeResults = queries.map((query) => query.data || []);
    
    if (allTypeResults.length > 0) {
      // Start with first type's Pokemon, then filter by subsequent types
      filteredPokemon = allTypeResults[0];
      
      for (let i = 1; i < allTypeResults.length; i++) {
        const currentTypePokemon = allTypeResults[i];
        const currentTypeNames = new Set(currentTypePokemon.map((p) => p.name));
        filteredPokemon = filteredPokemon.filter((pokemon) =>
          currentTypeNames.has(pokemon.name)
        );
      }
    }
  }

  return {
    data: filteredPokemon,
    isLoading,
    isError,
    error: errors.length > 0 ? errors[0] : null,
  };
}

/**
 * Custom hook for fetching Pokemon detail data by name.
 * Uses React Query's useQuery for efficient data fetching with caching.
 * 
 * - Fetches complete Pokemon data by name or ID
 * - Automatically caches results to avoid redundant API calls
 * - Used for Pokemon detail page
 * 
 * @param name - Pokemon name or ID (e.g., "pikachu", "25", "charizard")
 * @returns React Query query object with Pokemon data
 */
export function usePokemonDetail(name: string) {
  return useQuery<Pokemon, Error>({
    queryKey: ['pokemon', name],
    queryFn: () => fetchPokemonDetail(name),
    enabled: !!name, // Only fetch if name is provided
    staleTime: 1000 * 60 * 10, // 10 minutes (Pokemon data doesn't change often)
  });
}

/**
 * Custom hook for fetching Pokemon evolution chain.
 * Uses React Query to fetch species data first, then evolution chain.
 * 
 * - Fetches Pokemon species to get evolution chain URL
 * - Fetches evolution chain data
 * - Returns flattened evolution chain items
 * - Automatically caches results
 * 
 * @param pokemonName - Pokemon name or ID
 * @returns React Query query object with evolution chain data
 */
export function useEvolutionChain(pokemonName: string | null) {
  // First fetch species to get evolution chain URL
  const speciesQuery = useQuery({
    queryKey: ['pokemon-species', pokemonName],
    queryFn: () => fetchPokemonSpecies(pokemonName!),
    enabled: !!pokemonName,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Then fetch evolution chain using the URL from species
  const evolutionChainQuery = useQuery<EvolutionChainItem[], Error>({
    queryKey: ['evolution-chain', speciesQuery.data?.evolution_chain.url],
    queryFn: () => fetchEvolutionChain(speciesQuery.data!.evolution_chain.url),
    enabled: !!speciesQuery.data?.evolution_chain.url,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  return {
    data: evolutionChainQuery.data,
    isLoading: speciesQuery.isLoading || evolutionChainQuery.isLoading,
    isError: speciesQuery.isError || evolutionChainQuery.isError,
    error: speciesQuery.error || evolutionChainQuery.error,
  };
}
