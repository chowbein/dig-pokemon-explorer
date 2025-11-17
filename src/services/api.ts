/**
 * Pokemon API Service
 * Separates API calls from component logic for better architecture and testability.
 */

import type { PokemonListResponse, Pokemon, PokemonTypeResponse, PokemonListItem } from '../types/pokemon';

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

/**
 * Fetches all Pokemon of a specific type from the Pokemon API.
 * 
 * API Integration: https://pokeapi.co/api/v2/type/{type-name}/
 * - Fetches all Pokemon that have the specified type
 * - Returns Pokemon list items with name and URL
 * 
 * @param typeName - Pokemon type name (e.g., "fire", "water", "grass")
 * @returns Promise<PokemonListItem[]> with all Pokemon of the specified type
 */
export async function fetchPokemonByType(typeName: string): Promise<PokemonListItem[]> {
  try {
    const url = `${POKEAPI_BASE_URL}/type/${typeName.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Pokemon by type: ${response.status} ${response.statusText}`
      );
    }

    const data: PokemonTypeResponse = await response.json();

    // Extract Pokemon items from the type response
    if (!data.pokemon || !Array.isArray(data.pokemon)) {
      throw new Error('Invalid response format from Pokemon Type API');
    }

    return data.pokemon.map((entry) => entry.pokemon);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Unexpected error fetching Pokemon by type: ${String(error)}`);
  }
}

/**
 * Fetches Pokemon detail data by name from the Pokemon API.
 * 
 * API Integration: https://pokeapi.co/api/v2/pokemon/{name}
 * - Fetches complete Pokemon data including sprites, types, stats, and abilities
 * - Uses Pokemon name (can be ID or name string)
 * - Used for Pokemon detail page
 * 
 * @param name - Pokemon name or ID (e.g., "pikachu", "25", "charizard")
 * @returns Promise<Pokemon> with complete Pokemon data
 */
export async function fetchPokemonDetail(name: string): Promise<Pokemon> {
  try {
    const url = `${POKEAPI_BASE_URL}/pokemon/${name.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch Pokemon detail: ${response.status} ${response.statusText}`
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
    throw new Error(`Unexpected error fetching Pokemon detail: ${String(error)}`);
  }
}
