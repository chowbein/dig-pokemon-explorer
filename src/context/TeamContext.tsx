/**
 * Pokemon Team Context
 * Manages user's Pokemon team with a maximum of 6 Pokemon.
 */

import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Team Pokemon Item
 * Simplified Pokemon data stored in team.
 */
export interface TeamPokemon {
  /** Pokemon ID */
  id: number;
  /** Pokemon name */
  name: string;
  /** Pokemon image URL for display */
  imageUrl: string | null;
}

/**
 * Team Context Value
 * Provides team state and management functions.
 */
interface TeamContextValue {
  /** Array of Pokemon in the team (max 6) */
  team: TeamPokemon[];
  /** Add a Pokemon to the team (if not full and not already added) */
  addPokemonToTeam: (pokemon: TeamPokemon) => boolean;
  /** Remove a Pokemon from the team by ID */
  removePokemonFromTeam: (pokemonId: number) => void;
  /** Check if team is full (6 Pokemon) */
  isTeamFull: boolean;
  /** Check if a Pokemon is already in the team */
  isPokemonInTeam: (pokemonId: number) => boolean;
}

/**
 * Team Context
 * React context for Pokemon team management.
 */
const TeamContext = createContext<TeamContextValue | undefined>(undefined);

/**
 * Maximum number of Pokemon allowed in a team.
 */
const MAX_TEAM_SIZE = 6;

/**
 * Team Provider Props
 */
interface TeamProviderProps {
  children: ReactNode;
}

/**
 * Team Provider component.
 * Provides team state and management functions to children components.
 * 
 * - Maintains team state (max 6 Pokemon)
 * - Prevents adding duplicate Pokemon
 * - Prevents adding when team is full
 * - Provides functions to add/remove Pokemon
 */
export function TeamProvider({ children }: TeamProviderProps) {
  const [team, setTeam] = useState<TeamPokemon[]>([]);

  /**
   * Adds a Pokemon to the team.
   * - Prevents adding if team is full (6 Pokemon)
   * - Prevents adding duplicate Pokemon
   * - Returns true if successfully added, false otherwise
   */
  const addPokemonToTeam = (pokemon: TeamPokemon): boolean => {
    // Check if team is full
    if (team.length >= MAX_TEAM_SIZE) {
      return false;
    }

    // Check if Pokemon is already in team
    if (team.some((p) => p.id === pokemon.id)) {
      return false;
    }

    // Add Pokemon to team
    setTeam((prev) => [...prev, pokemon]);
    return true;
  };

  /**
   * Removes a Pokemon from the team by ID.
   */
  const removePokemonFromTeam = (pokemonId: number): void => {
    setTeam((prev) => prev.filter((pokemon) => pokemon.id !== pokemonId));
  };

  /**
   * Checks if team is full (6 Pokemon).
   */
  const isTeamFull = team.length >= MAX_TEAM_SIZE;

  /**
   * Checks if a Pokemon is already in the team.
   */
  const isPokemonInTeam = (pokemonId: number): boolean => {
    return team.some((pokemon) => pokemon.id === pokemonId);
  };

  const value: TeamContextValue = {
    team,
    addPokemonToTeam,
    removePokemonFromTeam,
    isTeamFull,
    isPokemonInTeam,
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

/**
 * Custom hook to access team context.
 * Throws error if used outside TeamProvider.
 * 
 * @returns Team context value with team state and management functions
 */
export function useTeam(): TeamContextValue {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}

