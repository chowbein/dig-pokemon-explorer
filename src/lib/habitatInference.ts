/**
 * Pokemon Habitat Inference
 * Infers habitat for Pokemon that don't have habitat data in the API.
 * Based on type patterns and common sense associations.
 */

import type { HabitatName } from './pokemonHabitats';

/**
 * Type combinations and their most likely habitats.
 * Based on patterns observed in Gen 1-4 Pokemon that have habitat data.
 */
const TYPE_HABITAT_PATTERNS: Record<string, HabitatName> = {
  // Water types
  water: 'sea',
  
  // Cave dwellers
  rock: 'cave',
  ground: 'cave',
  
  // Forest dwellers
  grass: 'forest',
  bug: 'forest',
  
  // Mountain dwellers
  flying: 'mountain',
  dragon: 'mountain',
  
  // Urban dwellers
  electric: 'urban',
  steel: 'urban',
  psychic: 'urban',
  
  // Grassland
  normal: 'grassland',
  
  // Rough terrain
  fighting: 'rough-terrain',
  
  // Rare/special
  fairy: 'rare',
  ghost: 'rare',
  
  // Ice types
  ice: 'mountain',
  
  // Poison types (often urban or forest)
  poison: 'urban',
  
  // Fire types (often mountain or rough-terrain)
  fire: 'rough-terrain',
  
  // Dark types (often urban or cave)
  dark: 'urban',
};

/**
 * Special habitat rules for specific type combinations.
 * These take priority over single-type patterns.
 */
const COMBINATION_PATTERNS: Array<{
  types: string[];
  habitat: HabitatName;
  priority: number;
}> = [
  // Water combinations
  { types: ['water', 'flying'], habitat: 'waters-edge', priority: 10 },
  { types: ['water', 'ground'], habitat: 'waters-edge', priority: 10 },
  { types: ['water', 'grass'], habitat: 'waters-edge', priority: 9 },
  { types: ['water', 'bug'], habitat: 'waters-edge', priority: 9 },
  { types: ['water', 'ice'], habitat: 'sea', priority: 9 },
  { types: ['water', 'dragon'], habitat: 'sea', priority: 9 },
  { types: ['water', 'psychic'], habitat: 'sea', priority: 8 },
  { types: ['water', 'dark'], habitat: 'sea', priority: 8 },
  { types: ['water', 'steel'], habitat: 'sea', priority: 8 },
  { types: ['water', 'rock'], habitat: 'waters-edge', priority: 9 },
  { types: ['water', 'poison'], habitat: 'sea', priority: 8 },
  
  // Rock/Ground combinations (caves)
  { types: ['rock', 'ground'], habitat: 'cave', priority: 10 },
  { types: ['rock', 'dark'], habitat: 'cave', priority: 9 },
  { types: ['rock', 'steel'], habitat: 'cave', priority: 9 },
  { types: ['ground', 'dark'], habitat: 'cave', priority: 8 },
  { types: ['ground', 'steel'], habitat: 'cave', priority: 8 },
  { types: ['rock', 'psychic'], habitat: 'mountain', priority: 8 },
  
  // Grass/Bug combinations (forest)
  { types: ['grass', 'bug'], habitat: 'forest', priority: 10 },
  { types: ['grass', 'poison'], habitat: 'forest', priority: 10 },
  { types: ['grass', 'flying'], habitat: 'forest', priority: 9 },
  { types: ['grass', 'fairy'], habitat: 'forest', priority: 9 },
  { types: ['bug', 'poison'], habitat: 'forest', priority: 9 },
  { types: ['bug', 'flying'], habitat: 'forest', priority: 9 },
  { types: ['bug', 'steel'], habitat: 'forest', priority: 8 },
  
  // Flying/Dragon (mountain)
  { types: ['flying', 'dragon'], habitat: 'mountain', priority: 10 },
  { types: ['flying', 'psychic'], habitat: 'mountain', priority: 8 },
  { types: ['flying', 'steel'], habitat: 'mountain', priority: 8 },
  { types: ['dragon', 'ground'], habitat: 'mountain', priority: 9 },
  
  // Electric/Steel (urban)
  { types: ['electric', 'steel'], habitat: 'urban', priority: 10 },
  { types: ['electric', 'flying'], habitat: 'urban', priority: 8 },
  { types: ['steel', 'psychic'], habitat: 'urban', priority: 9 },
  { types: ['steel', 'fairy'], habitat: 'urban', priority: 8 },
  
  // Fighting types (rough-terrain)
  { types: ['fighting', 'rock'], habitat: 'rough-terrain', priority: 9 },
  { types: ['fighting', 'ground'], habitat: 'rough-terrain', priority: 9 },
  { types: ['fighting', 'steel'], habitat: 'rough-terrain', priority: 8 },
  { types: ['fighting', 'dark'], habitat: 'rough-terrain', priority: 8 },
  
  // Ghost/Fairy/Psychic (rare)
  { types: ['ghost', 'fairy'], habitat: 'rare', priority: 10 },
  { types: ['ghost', 'psychic'], habitat: 'rare', priority: 9 },
  { types: ['fairy', 'psychic'], habitat: 'rare', priority: 9 },
  { types: ['dragon', 'psychic'], habitat: 'rare', priority: 8 },
  { types: ['dragon', 'fairy'], habitat: 'rare', priority: 9 },
  
  // Fire combinations
  { types: ['fire', 'flying'], habitat: 'mountain', priority: 9 },
  { types: ['fire', 'rock'], habitat: 'mountain', priority: 9 },
  { types: ['fire', 'ground'], habitat: 'rough-terrain', priority: 8 },
  { types: ['fire', 'fighting'], habitat: 'rough-terrain', priority: 9 },
  { types: ['fire', 'steel'], habitat: 'rough-terrain', priority: 8 },
  { types: ['fire', 'dragon'], habitat: 'mountain', priority: 9 },
  
  // Ice combinations
  { types: ['ice', 'flying'], habitat: 'mountain', priority: 9 },
  { types: ['ice', 'psychic'], habitat: 'mountain', priority: 8 },
  { types: ['ice', 'steel'], habitat: 'mountain', priority: 8 },
  { types: ['ice', 'ground'], habitat: 'mountain', priority: 9 },
  
  // Dark/Poison (urban)
  { types: ['dark', 'poison'], habitat: 'urban', priority: 8 },
  { types: ['dark', 'steel'], habitat: 'urban', priority: 9 },
  { types: ['dark', 'flying'], habitat: 'urban', priority: 7 },
  { types: ['poison', 'flying'], habitat: 'urban', priority: 7 },
  
  // Normal combinations (grassland)
  { types: ['normal', 'flying'], habitat: 'grassland', priority: 9 },
  { types: ['normal', 'fairy'], habitat: 'grassland', priority: 8 },
  { types: ['normal', 'psychic'], habitat: 'grassland', priority: 7 },
];

/**
 * Infers a habitat for a Pokemon based on its types.
 * 
 * Algorithm:
 * 1. Check if any type combination matches the combination patterns (highest priority)
 * 2. Fall back to single type patterns
 * 3. Default to 'grassland' if no match
 * 
 * @param types - Array of Pokemon types
 * @returns Inferred habitat name
 */
export function inferHabitatFromTypes(
  types: Array<{ type: { name: string } }>
): HabitatName {
  if (!types || types.length === 0) {
    return 'grassland'; // Default fallback
  }

  const typeNames = types.map(t => t.type.name.toLowerCase()).sort();

  // Check combination patterns first (higher accuracy)
  let bestMatch: { habitat: HabitatName; priority: number } | null = null;
  
  for (const pattern of COMBINATION_PATTERNS) {
    const patternTypes = pattern.types.sort();
    
    // Check if all pattern types are present in the Pokemon's types
    const matches = patternTypes.every(patternType => 
      typeNames.includes(patternType)
    );
    
    if (matches) {
      if (!bestMatch || pattern.priority > bestMatch.priority) {
        bestMatch = { habitat: pattern.habitat, priority: pattern.priority };
      }
    }
  }

  if (bestMatch) {
    return bestMatch.habitat;
  }

  // Fall back to single type patterns (primary type first)
  for (const type of typeNames) {
    if (TYPE_HABITAT_PATTERNS[type]) {
      return TYPE_HABITAT_PATTERNS[type];
    }
  }

  // Ultimate fallback
  return 'grassland';
}

/**
 * Gets habitat with inference fallback.
 * Returns the API habitat if available, otherwise infers from types.
 * 
 * @param apiHabitat - Habitat from Pokemon species API (may be null)
 * @param types - Pokemon types for inference
 * @returns Habitat name (never null)
 */
export function getHabitatWithInference(
  apiHabitat: HabitatName | null,
  types: Array<{ type: { name: string } }>
): HabitatName {
  // Use API habitat if available
  if (apiHabitat) {
    return apiHabitat;
  }

  // Infer from types
  return inferHabitatFromTypes(types);
}

