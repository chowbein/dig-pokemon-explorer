/**
 * Team Type Analysis Hook
 * Custom React hook for analyzing team weaknesses and resistances.
 */

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchTypeData } from '../services/api';
import type { TypeDataResponse } from '../types/pokemon';

/**
 * Pokemon with types for team analysis.
 * Simplified interface that includes the types property needed for analysis.
 */
interface PokemonWithTypes {
  /** Array of Pokemon types */
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

/**
 * Team type analysis result.
 * Contains aggregated weakness and resistance counts for the team.
 */
interface TeamTypeAnalysisResult {
  /** True if any type queries are still loading */
  isLoading: boolean;
  /** Object mapping type names to count of team members weak to that type */
  weaknesses: Record<string, number>;
  /** Object mapping type names to count of team members resistant/immune to that type */
  resistances: Record<string, number>;
}

/**
 * Custom hook for analyzing team type weaknesses and resistances.
 * 
 * Fetches type data from PokeAPI and aggregates defensive matchups for the entire team.
 * - Extracts unique types from team to avoid redundant API calls
 * - Fetches type data concurrently using useQueries
 * - Calculates net effectiveness (damage multipliers) for dual-type Pokémon
 * - Counts how many team members are weak/resistant to each attacking type
 * 
 * Complex Logic: For each Pokémon, calculates the final damage multiplier against each
 * attacking type by multiplying multipliers from all of the Pokémon's types. For example,
 * a Fire/Steel type against Fire attacks: Fire type has 0.5x (half_damage_from), Steel
 * type has 2x (double_damage_from), final multiplier = 0.5 * 2 = 1x (neutral).
 * 
 * @param team - Array of Pokemon objects, each with a types property
 * @returns Object with isLoading, weaknesses, and resistances
 */
export function useTeamTypeAnalysis(team: PokemonWithTypes[]): TeamTypeAnalysisResult {
  // Extract unique types from team
  // Complex Logic: Memoized extraction of unique type names to avoid duplicate API calls
  const uniqueTypes = useMemo(() => {
    const typeSet = new Set<string>();
    
    team.forEach((pokemon) => {
      if (pokemon.types && Array.isArray(pokemon.types)) {
        pokemon.types.forEach((typeObj) => {
          if (typeObj?.type?.name) {
            typeSet.add(typeObj.type.name);
          }
        });
      }
    });
    
    return Array.from(typeSet);
  }, [team]);

  // Fetch type data concurrently for all unique types
  // API Integration: Uses useQueries to fetch from https://pokeapi.co/api/v2/type/{typeName}
  const typeQueries = useQueries({
    queries: uniqueTypes.map((typeName) => ({
      queryKey: ['type', typeName] as const,
      queryFn: () => fetchTypeData(typeName),
      enabled: uniqueTypes.length > 0,
      staleTime: 1000 * 60 * 30, // 30 minutes (type data doesn't change)
    })),
  });

  // Aggregate weaknesses and resistances
  // Complex Logic: Calculates net effectiveness (damage multipliers) for dual-type Pokémon
  // For each Pokémon and each attacking type, multiplies damage multipliers from all types
  // Example: Fire/Steel vs Fire attack = 0.5x * 2x = 1x (neutral, not counted)
  const { weaknesses, resistances } = useMemo(() => {
    // Early return if still loading or any query is missing data
    if (typeQueries.some((query) => query.isLoading) || typeQueries.some((query) => !query.data)) {
      return { weaknesses: {}, resistances: {} };
    }

    const weaknessCounts: Record<string, number> = {};
    const resistanceCounts: Record<string, number> = {};

    // Create a map of type name to damage relations for quick lookup
    const typeDataMap = new Map<string, TypeDataResponse['damage_relations']>();
    typeQueries.forEach((query) => {
      if (query.data?.damage_relations) {
        typeDataMap.set(query.data.name, query.data.damage_relations);
      }
    });

    // All 18 Pokémon types as attacking types
    const ALL_TYPES = [
      'normal',
      'fire',
      'water',
      'electric',
      'grass',
      'ice',
      'fighting',
      'poison',
      'ground',
      'flying',
      'psychic',
      'bug',
      'rock',
      'ghost',
      'dragon',
      'dark',
      'steel',
      'fairy',
    ];

    // Iterate through each Pokemon in the team
    team.forEach((pokemon) => {
      if (!pokemon.types || !Array.isArray(pokemon.types) || pokemon.types.length === 0) {
        return;
      }

      // For each pokemon, iterate through every possible ATTACKING type
      ALL_TYPES.forEach((attackingType) => {
        let finalMultiplier = 1;

        // Calculate the multiplier from all of the pokemon's types
        // Complex Logic: Multiplies damage multipliers from each type to get final effectiveness
        // Example: Fire type has 0.5x to Fire attacks, Steel type has 2x to Fire attacks
        // Final = 0.5 * 2 = 1x (neutral)
        pokemon.types.forEach((pokemonTypeInfo) => {
          const typeName = pokemonTypeInfo?.type?.name;
          if (!typeName) {
            return;
          }

          const relations = typeDataMap.get(typeName);
          if (!relations) {
            return;
          }

          // Check if attacking type deals double damage (2x multiplier)
          if (relations.double_damage_from.some((t) => t.name === attackingType)) {
            finalMultiplier *= 2;
          }

          // Check if attacking type deals half damage (0.5x multiplier)
          if (relations.half_damage_from.some((t) => t.name === attackingType)) {
            finalMultiplier *= 0.5;
          }

          // Check if attacking type deals no damage (0x multiplier, immunity)
          if (relations.no_damage_from.some((t) => t.name === attackingType)) {
            finalMultiplier *= 0;
          }
        });

        // After calculating the final multiplier for this pokemon against this attacking type
        // Count based on the net effectiveness (official Pokémon damage calculation)
        if (finalMultiplier > 1) {
          // Pokemon is weak to this attacking type (e.g., 2x, 4x)
          weaknessCounts[attackingType] = (weaknessCounts[attackingType] || 0) + 1;
        } else if (finalMultiplier < 1) {
          // Pokemon is resistant to this attacking type (e.g., 0.5x, 0.25x, 0x immune)
          resistanceCounts[attackingType] = (resistanceCounts[attackingType] || 0) + 1;
        }
        // If finalMultiplier === 1, do nothing (neutral, not counted)
      });
    });

    return {
      weaknesses: weaknessCounts,
      resistances: resistanceCounts,
    };
  }, [team, typeQueries]);

  const isLoading = typeQueries.some((query) => query.isLoading);

  return {
    isLoading,
    weaknesses,
    resistances,
  };
}

