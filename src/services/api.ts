/**
 * Pokemon API Service
 * Separates API calls from component logic for better architecture and testability.
 */

import type { PokemonListResponse, Pokemon } from '../types/pokemon';

/** Base URL for the Pokemon API */
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Fetches a paginated list of Pokemon from the Pokemon API.
 * 
 * API Integration: https://pokeapi.co/api/v2/pokemon?limit=20&offset={pageParam}
 * - Designed for use with React Query's useInfiniteQuery hook
 * - pageParam is the offset (items to skip), defaults to 0
 * - Limit is fixed at 20 items per page
 * 
 * @param pageParam - Offset for pagination (defaults to 0)
 * @returns Promise<PokemonListResponse> with Pokemon list and pagination metadata
 */
export async function fetchPokemonList({
  pageParam = 0,
}: {
  pageParam?: number;
}): Promise<PokemonListResponse> {
  const url = `${POKEAPI_BASE_URL}/pokemon?limit=20&offset=${pageParam}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Pokemon list: ${response.status} ${response.statusText}`
      );
    }

    const data: PokemonListResponse = await response.json();

    // Validate response structure to catch API changes
    if (!data.results || !Array.isArray(data.results)) {
      throw new Error('Invalid response format from Pokemon API');
    }

    return data;
  } catch (error) {
    // Re-throw with context for React Query error handling
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error fetching Pokemon list: ${String(error)}`);
  }
}

/**
 * Fetches individual Pokemon data from the Pokemon API.
 * 
 * API Integration: Uses the URL from PokemonListItem.url
 * - Fetches complete Pokemon data including sprites and types
 * - Used for individual Pokemon cards (N+1 query pattern)
 * 
 * @param url - Pokemon API URL from PokemonListItem
 * @returns Promise<Pokemon> with complete Pokemon data
 */
export async function fetchPokemon(url: string): Promise<Pokemon> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Pokemon: ${response.status} ${response.statusText}`
      );
    }

    const data: Pokemon = await response.json();

    // Validate response structure
    if (!data.name || !data.id) {
      throw new Error('Invalid response format from Pokemon API');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error fetching Pokemon: ${String(error)}`);
  }
}
