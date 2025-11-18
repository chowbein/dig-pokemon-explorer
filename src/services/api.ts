/**
 * Pokemon API Service
 * Separates API calls from component logic for better architecture and testability.
 */

import type {
  PokemonListResponse,
  Pokemon,
  PokemonTypeResponse,
  PokemonListItem,
  PokemonSpecies,
  EvolutionChainResponse,
  EvolutionChainItem,
  TypeDataResponse,
} from '../types/pokemon';

/** Base URL for the Pokemon API */
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/**
 * Custom error class for Pokemon API failures.
 * Provides user-friendly error messages for different failure scenarios.
 */
export class PokemonAPIError extends Error {
  public readonly statusCode?: number;
  public readonly isServerError: boolean;
  public readonly userMessage: string;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'PokemonAPIError';
    this.statusCode = statusCode;
    this.isServerError = statusCode ? statusCode >= 500 : false;
    
    // Provide user-friendly messages
    if (this.isServerError) {
      this.userMessage = 'The PokeAPI service is currently experiencing issues. Please try again later.';
    } else if (statusCode === 404) {
      this.userMessage = 'The requested Pokemon data was not found.';
    } else if (!statusCode) {
      this.userMessage = 'Unable to connect to the Pokemon API. Please check your internet connection and try again.';
    } else {
      this.userMessage = 'An error occurred while fetching Pokemon data. Please try again.';
    }
  }
}

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
      throw new PokemonAPIError(
        `Failed to fetch Pokemon list: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: PokemonListResponse = await response.json();

    // Validate response structure to catch API changes
    if (!data.results || !Array.isArray(data.results)) {
      throw new PokemonAPIError('Invalid response format from Pokemon API');
    }

    return data;
  } catch (error) {
    // Re-throw PokemonAPIError as-is
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    // Network errors or other failures
    if (error instanceof Error) {
      throw new PokemonAPIError(error.message);
    }
    throw new PokemonAPIError(`Unexpected error fetching Pokemon list: ${String(error)}`);
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
      throw new PokemonAPIError(
        `Failed to fetch Pokemon: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: Pokemon = await response.json();

    // Validate response structure
    if (!data.name || !data.id) {
      throw new PokemonAPIError('Invalid response format from Pokemon API');
    }

    return data;
  } catch (error) {
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new PokemonAPIError(error.message);
    }
    throw new PokemonAPIError(`Unexpected error fetching Pokemon: ${String(error)}`);
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
      throw new PokemonAPIError(
        `Failed to fetch Pokemon by type: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: PokemonTypeResponse = await response.json();

    // Extract Pokemon items from the type response
    if (!data.pokemon || !Array.isArray(data.pokemon)) {
      throw new PokemonAPIError('Invalid response format from Pokemon Type API');
    }

    return data.pokemon.map((entry) => entry.pokemon);
  } catch (error) {
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new PokemonAPIError(error.message);
    }
    throw new PokemonAPIError(`Unexpected error fetching Pokemon by type: ${String(error)}`);
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
      throw new PokemonAPIError(
        `Failed to fetch Pokemon detail: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: Pokemon = await response.json();

    // Validate response structure
    if (!data.name || !data.id) {
      throw new PokemonAPIError('Invalid response format from Pokemon API');
    }

    return data;
  } catch (error) {
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new PokemonAPIError(error.message);
    }
    throw new PokemonAPIError(`Unexpected error fetching Pokemon detail: ${String(error)}`);
  }
}

/**
 * Fetches Pokemon species data from the Pokemon API.
 * 
 * API Integration: https://pokeapi.co/api/v2/pokemon-species/{name}
 * - Fetches species data including evolution chain URL
 * - Used to get evolution chain information
 * 
 * @param name - Pokemon name or ID
 * @returns Promise<PokemonSpecies> with species data including evolution chain URL
 */
export async function fetchPokemonSpecies(name: string): Promise<PokemonSpecies> {
  try {
    const url = `${POKEAPI_BASE_URL}/pokemon-species/${name.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new PokemonAPIError(
        `Failed to fetch Pokemon species: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: PokemonSpecies = await response.json();

    // Validate response structure
    if (!data.name || !data.evolution_chain) {
      throw new PokemonAPIError('Invalid response format from Pokemon Species API');
    }

    return data;
  } catch (error) {
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new PokemonAPIError(error.message);
    }
    throw new PokemonAPIError(`Unexpected error fetching Pokemon species: ${String(error)}`);
  }
}

/**
 * Fetches evolution chain data from the Pokemon API.
 * 
 * API Integration: Uses evolution chain URL from Pokemon species
 * - Fetches nested evolution chain structure
 * - Returns flattened evolution chain items for easier display
 * 
 * @param evolutionChainUrl - Evolution chain URL from Pokemon species
 * @returns Promise<EvolutionChainItem[]> with flattened evolution chain
 */
export async function fetchEvolutionChain(
  evolutionChainUrl: string
): Promise<EvolutionChainItem[]> {
  try {
    const response = await fetch(evolutionChainUrl);

    if (!response.ok) {
      throw new PokemonAPIError(
        `Failed to fetch evolution chain: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: EvolutionChainResponse = await response.json();

    // Flatten the nested evolution chain structure
    const evolutionChain: EvolutionChainItem[] = [];

    /**
     * Recursively traverses the evolution chain tree to flatten it.
     * Processes each evolution link and its evolves_to branches.
     */
    const traverseChain = (chain: EvolutionChainResponse['chain'], level: number = 0) => {
      if (!chain) return;

      // Get evolution details from the first evolution_detail entry
      const evolutionDetail = chain.evolution_details?.[0];
      const minLevel = evolutionDetail?.min_level || null;
      const trigger = evolutionDetail?.trigger?.name || 'base';
      const item = evolutionDetail?.item?.name || null;
      const heldItem = evolutionDetail?.held_item?.name || null;
      const timeOfDay = evolutionDetail?.time_of_day || null;

      // Build method description
      let method = '';
      if (level === 0) {
        method = 'Base form';
      } else {
        const methodParts: string[] = [];
        if (minLevel) methodParts.push(`Level ${minLevel}`);
        if (item) methodParts.push(`using ${item}`);
        if (heldItem) methodParts.push(`holding ${heldItem}`);
        if (timeOfDay) methodParts.push(`during ${timeOfDay}`);
        if (trigger && trigger !== 'level-up') methodParts.push(trigger);
        method = methodParts.join(' + ') || trigger || 'Evolve';
      }

      evolutionChain.push({
        name: chain.species.name,
        speciesUrl: chain.species.url,
        min_level: minLevel,
        trigger: trigger,
        method: method,
      });

      // Recursively process evolves_to (next evolution stage)
      if (chain.evolves_to && chain.evolves_to.length > 0) {
        chain.evolves_to.forEach((nextEvolution) => {
          traverseChain(nextEvolution, level + 1);
        });
      }
    };

    traverseChain(data.chain);

    return evolutionChain;
  } catch (error) {
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new PokemonAPIError(error.message);
    }
    throw new PokemonAPIError(`Unexpected error fetching evolution chain: ${String(error)}`);
  }
}

/**
 * Fetches type damage relations data from the Pokemon API.
 * 
 * API Integration: https://pokeapi.co/api/v2/type/{type_name}
 * - Fetches type data including damage relations (weaknesses, resistances)
 * - Used to calculate team weaknesses and resistances
 * 
 * @param typeName - Pokemon type name (e.g., "fire", "water", "grass")
 * @returns Promise<TypeDataResponse> with type data including damage relations
 */
export async function fetchTypeData(typeName: string): Promise<TypeDataResponse> {
  try {
    const url = `${POKEAPI_BASE_URL}/type/${typeName.toLowerCase()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new PokemonAPIError(
        `Failed to fetch type data: ${response.status} ${response.statusText}`,
        response.status
      );
    }

    const data: TypeDataResponse = await response.json();

    // Validate response structure
    if (!data.name || !data.damage_relations) {
      throw new PokemonAPIError('Invalid response format from Pokemon Type API');
    }

    return data;
  } catch (error) {
    if (error instanceof PokemonAPIError) {
      throw error;
    }
    if (error instanceof Error) {
      throw new PokemonAPIError(error.message);
    }
    throw new PokemonAPIError(`Unexpected error fetching type data: ${String(error)}`);
  }
}
