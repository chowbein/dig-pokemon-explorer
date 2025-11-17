/**
 * Pokemon Type Definitions
 * TypeScript interfaces for Pokemon API data structures.
 */

/**
 * Represents a single Pokemon type (e.g., "fire", "water").
 * Nested within Pokemon.types array.
 */
export interface PokemonType {
  /** Slot number (1 or 2) indicating type position */
  slot: number;
  type: {
    /** Type name (e.g., "fire", "water", "electric") */
    name: string;
    /** API URL for detailed type information */
    url: string;
  };
}

/**
 * Sprite image URLs for a Pokemon.
 * API provides default/shiny variants and front/back orientations.
 */
export interface PokemonSprites {
  front_default: string | null;
  back_default: string | null;
  front_shiny: string | null;
  back_shiny: string | null;
  /** Official artwork (highest quality) */
  other?: {
    'official-artwork'?: {
      front_default: string | null;
      front_shiny: string | null;
    };
  };
}

/**
 * Complete Pokemon data from the Pokemon API.
 * API: https://pokeapi.co/api/v2/pokemon/{id}
 */
export interface Pokemon {
  id: number;
  name: string;
  sprites: PokemonSprites;
  /** Array of types (most Pokemon have 1-2 types) */
  types: PokemonType[];
}

/**
 * Minimal Pokemon entry from list endpoint.
 * API: https://pokeapi.co/api/v2/pokemon?offset=0&limit=20
 * Used for paginated lists. url field can fetch full Pokemon details.
 */
export interface PokemonListItem {
  name: string;
  /** API URL to fetch complete Pokemon data */
  url: string;
}

/**
 * Paginated Pokemon list response with pagination metadata.
 */
export interface PokemonListResponse {
  /** Total count of Pokemon in API */
  count: number;
  /** Next page URL (null if last page) */
  next: string | null;
  /** Previous page URL (null if first page) */
  previous: string | null;
  /** Array of Pokemon items for current page */
  results: PokemonListItem[];
}

/**
 * Pokemon Type API Response
 * Response from the type endpoint: https://pokeapi.co/api/v2/type/{id}/
 */
export interface PokemonTypeResponse {
  /** Array of Pokemon with this type */
  pokemon: Array<{
    slot: number;
    pokemon: PokemonListItem;
  }>;
}
