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
  const { weaknesses, resistances } = useMemo(() => {
    const weaknessCounts: Record<string, number> = {};
    const resistanceCounts: Record<string, number> = {};

    // Create a map of type name to type data for quick lookup
    const typeDataMap = new Map<string, TypeDataResponse>();
    typeQueries.forEach((query) => {
      if (query.data) {
        typeDataMap.set(query.data.name, query.data);
      }
    });

    // Iterate through each Pokemon in the team
    team.forEach((pokemon) => {
      if (!pokemon.types || !Array.isArray(pokemon.types)) {
        return;
      }

      // For each of the Pokemon's types, analyze damage relations
      pokemon.types.forEach((typeObj) => {
        const typeName = typeObj?.type?.name;
        if (!typeName) {
          return;
        }

        const typeData = typeDataMap.get(typeName);
        if (!typeData?.damage_relations) {
          return;
        }

        const relations = typeData.damage_relations;

        // Count weaknesses (double_damage_from)
        relations.double_damage_from.forEach((type) => {
          weaknessCounts[type.name] = (weaknessCounts[type.name] || 0) + 1;
        });

        // Count resistances (half_damage_from)
        relations.half_damage_from.forEach((type) => {
          resistanceCounts[type.name] = (resistanceCounts[type.name] || 0) + 1;
        });

        // Count immunities (no_damage_from)
        relations.no_damage_from.forEach((type) => {
          resistanceCounts[type.name] = (resistanceCounts[type.name] || 0) + 1;
        });
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

