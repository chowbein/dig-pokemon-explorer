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
 * Pokemon Stat
 * Represents a Pokemon stat (HP, Attack, Defense, etc.).
 */
export interface PokemonStat {
  /** Base stat value (e.g., 80 for HP) */
  base_stat: number;
  /** Effort value (EV) gained when defeating this Pokemon */
  effort: number;
  stat: {
    /** Stat name (e.g., "hp", "attack", "defense") */
    name: string;
    /** API URL for detailed stat information */
    url: string;
  };
}

/**
 * Pokemon Ability
 * Represents a Pokemon ability.
 */
export interface PokemonAbility {
  /** Whether this is a hidden ability */
  is_hidden: boolean;
  /** Slot number (1-3) */
  slot: number;
  ability: {
    /** Ability name (e.g., "static", "lightning-rod") */
    name: string;
    /** API URL for detailed ability information */
    url: string;
  };
}

/**
 * Pokemon Move
 * Represents a move that a Pokemon can learn.
 */
export interface PokemonMove {
  move: {
    /** Move name (e.g., "thunderbolt", "quick-attack") */
    name: string;
    /** API URL for detailed move information */
    url: string;
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
  /** Height in decimeters (divide by 10 for meters) */
  height: number;
  /** Weight in hectograms (divide by 10 for kilograms) */
  weight: number;
  /** Array of stats (HP, Attack, Defense, etc.) */
  stats: PokemonStat[];
  /** Array of abilities */
  abilities: PokemonAbility[];
  /** Array of moves this Pokemon can learn */
  moves: PokemonMove[];
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

/**
 * Pokemon Species
 * Species data from the Pokemon API species endpoint.
 */
export interface PokemonSpecies {
  /** Pokemon species name */
  name: string;
  /** Evolution chain URL */
  evolution_chain: {
    url: string;
  };
  /** Habitat information */
  habitat: {
    name: string;
    url: string;
  } | null;
}

/**
 * Evolution Chain Link
 * Represents a Pokemon in the evolution chain.
 */
export interface EvolutionChainLink {
  /** Species information */
  species: {
    name: string;
    url: string;
  };
  /** Evolution details (how to evolve) */
  evolution_details: Array<{
    min_level: number | null;
    trigger: {
      name: string;
      url: string;
    };
    item: {
      name: string;
      url: string;
    } | null;
    held_item: {
      name: string;
      url: string;
    } | null;
    time_of_day: string | null;
    gender: number | null;
  }>;
  /** Pokemon this evolves into */
  evolves_to: EvolutionChainLink[];
}

/**
 * Evolution Chain Response
 * Response from the evolution chain endpoint.
 */
export interface EvolutionChainResponse {
  id: number;
  chain: EvolutionChainLink;
}

/**
 * Flattened Evolution Chain Item
 * Simplified evolution chain item for display.
 */
export interface EvolutionChainItem {
  /** Pokemon name */
  name: string;
  /** Pokemon species URL (used to extract ID for images) */
  speciesUrl: string;
  /** Evolution level (if applicable) */
  min_level: number | null;
  /** Evolution trigger name */
  trigger: string;
  /** Evolution method details */
  method: string;
}

/**
 * Type Damage Relations
 * Damage relations from Pokemon API type endpoint.
 * API: https://pokeapi.co/api/v2/type/{type_name}
 */
export interface TypeDamageRelations {
  /** Types that deal double damage to this type */
  double_damage_from: Array<{
    name: string;
    url: string;
  }>;
  /** Types that deal half damage to this type */
  half_damage_from: Array<{
    name: string;
    url: string;
  }>;
  /** Types that deal no damage to this type */
  no_damage_from: Array<{
    name: string;
    url: string;
  }>;
  /** Types that this type deals half damage to (counter types) */
  half_damage_to: Array<{
    name: string;
    url: string;
  }>;
  /** Types that this type deals no damage to (immune counter types) */
  no_damage_to: Array<{
    name: string;
    url: string;
  }>;
}

/**
 * Type Data Response
 * Complete type data from Pokemon API type endpoint.
 */
export interface TypeDataResponse {
  name: string;
  damage_relations: TypeDamageRelations;
}
