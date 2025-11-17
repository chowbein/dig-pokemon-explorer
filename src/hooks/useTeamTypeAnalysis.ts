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
 * - Counts how many team members are weak/resistant to each attacking type
 * - Does not cancel out types that appear in both weaknesses and resistances
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
  // Complex Logic: Counts team members weak/resistant to each attacking type
  // Processes each Pokemon's types and aggregates damage relations
  // FIX: Uses Sets per Pokemon to avoid double-counting 4x weaknesses (e.g., Bug/Steel weak to Fire)
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

    // Iterate through each Pokemon in the team
    team.forEach((pokemon) => {
      if (!pokemon.types || !Array.isArray(pokemon.types)) {
        return;
      }

      // For each Pokemon, gather unique weaknesses and resistances from all its types
      // Using Sets ensures de-duplication (prevents double-counting 4x weaknesses)
      const pokemonUniqueWeaknesses = new Set<string>();
      const pokemonUniqueResistances = new Set<string>();

      // Gather all weaknesses and resistances from all of this Pokemon's types
      pokemon.types.forEach((typeObj) => {
        const typeName = typeObj?.type?.name;
        if (!typeName) {
          return;
        }

        const relations = typeDataMap.get(typeName);
        if (!relations) {
          return;
        }

        // Add weaknesses from this type (double_damage_from)
        relations.double_damage_from.forEach((type) => {
          pokemonUniqueWeaknesses.add(type.name);
        });

        // Add resistances from this type (half_damage_from)
        relations.half_damage_from.forEach((type) => {
          pokemonUniqueResistances.add(type.name);
        });

        // Add immunities from this type (no_damage_from)
        relations.no_damage_from.forEach((type) => {
          pokemonUniqueResistances.add(type.name);
        });
      });

      // Now increment the main counts using the unique sets
      // Each Pokemon contributes at most +1 per weakness/resistance type
      pokemonUniqueWeaknesses.forEach((weakness) => {
        weaknessCounts[weakness] = (weaknessCounts[weakness] || 0) + 1;
      });

      pokemonUniqueResistances.forEach((resistance) => {
        resistanceCounts[resistance] = (resistanceCounts[resistance] || 0) + 1;
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

