/**
 * Team Sidebar Component
 * Displays the user's Pokemon team with 6 slots and team weaknesses/resistances.
 */

import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { useQueries } from '@tanstack/react-query';
import { fetchPokemonDetail } from '../services/api';
import { useTeamTypeAnalysis } from '../hooks/useTeamTypeAnalysis';
import { getTypeColors } from '../lib/pokemonTypeColors';
import type { TeamPokemon } from '../context/TeamContext';

/**
 * Team sidebar component displaying 6 Pokemon team slots.
 * Shows empty slots or Pokemon avatars with remove buttons.
 * Calculates and displays team weaknesses and resistances.
 * 
 * - Displays 6 team slots (empty or filled)
 * - Shows Pokemon image in filled slots
 * - Provides remove button for each filled slot
 * - Clickable Pokemon images navigate to detail page
 * - Fetches Pokemon data to get types
 * - Fetches type damage relations
 * - Aggregates weaknesses and resistances across team
 * - Displays weaknesses and resistances with colored badges
 */
export function TeamSidebar() {
  const { team, removePokemonFromTeam, addPokemonToTeam, isTeamFull, isPokemonInTeam } = useTeam();
  const [draggedOverSlot, setDraggedOverSlot] = useState<number | null>(null);
  const [isDraggingOverTeam, setIsDraggingOverTeam] = useState(false);

  // Fetch Pokemon data for each team member (needed for display and type analysis)
  const pokemonQueries = useQueries({
    queries: team.map((pokemon) => ({
      queryKey: ['pokemon', pokemon.id, pokemon.name],
      queryFn: () => fetchPokemonDetail(pokemon.name),
      staleTime: 1000 * 60 * 10, // 10 minutes
    })),
  });

  // Prepare team data for type analysis hook
  // Complex Logic: Maps Pokemon query results to format expected by useTeamTypeAnalysis
  const teamWithTypes = useMemo(() => {
    return pokemonQueries
      .map((query) => query.data)
      .filter((pokemon): pokemon is NonNullable<typeof pokemon> => !!pokemon);
  }, [pokemonQueries]);

  // Use custom hook for team type analysis
  // API Integration: Fetches type data from PokeAPI and aggregates weaknesses/resistances
  const { isLoading: isLoadingTypeAnalysis, weaknesses, resistances } =
    useTeamTypeAnalysis(teamWithTypes);

  const isLoadingPokemon = pokemonQueries.some((query) => query.isLoading);
  const isLoading = isLoadingPokemon || isLoadingTypeAnalysis;

  // Create array of 6 slots (filled or empty)
  const slots = Array.from({ length: 6 }, (_, index) => {
    return team[index] || null;
  });

  /**
   * Handles drag over event on a slot.
   * Prevents default to allow drop and provides visual feedback.
   */
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverSlot(slotIndex);
  };

  /**
   * Handles drag leave event.
   * Removes visual feedback when dragging leaves the slot.
   */
  const handleDragLeave = () => {
    setDraggedOverSlot(null);
  };

  /**
   * Handles drop event on a slot or team area.
   * Extracts Pokemon data from dataTransfer and adds to team.
   * Automatically finds the next available slot if dropped anywhere in team area.
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, _slotIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedOverSlot(null);
    setIsDraggingOverTeam(false);

    try {
      const pokemonDataJson = e.dataTransfer.getData('application/json');
      if (!pokemonDataJson) return;

      const pokemonData: TeamPokemon = JSON.parse(pokemonDataJson);

      // Validate data structure
      if (!pokemonData.id || !pokemonData.name) {
        return;
      }

      // Check if team is full
      if (isTeamFull) {
        return;
      }

      // Check if Pokemon is already in team
      if (isPokemonInTeam(pokemonData.id)) {
        return;
      }

      // Add Pokemon to team (automatically goes to next available slot)
      addPokemonToTeam(pokemonData);
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  /**
   * Handles drag over event on the team area.
   * Prevents default to allow drop and provides visual feedback.
   */
  const handleTeamDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isTeamFull) {
      e.dataTransfer.dropEffect = 'move';
      setIsDraggingOverTeam(true);
    }
  };

  /**
   * Handles drag leave event on the team area.
   * Removes visual feedback when dragging leaves the team area.
   */
  const handleTeamDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only remove feedback if we're actually leaving the team area
    // Check if we're moving to a child element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // If mouse is outside the team area, remove feedback
    if (
      x < rect.left ||
      x > rect.right ||
      y < rect.top ||
      y > rect.bottom
    ) {
      setIsDraggingOverTeam(false);
      setDraggedOverSlot(null);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        My Team ({team.length}/6)
      </h2>
      <div
        className={`grid grid-cols-3 gap-3 mb-4 p-2 rounded-lg transition-all ${
          isDraggingOverTeam && !isTeamFull
            ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 dark:ring-blue-500 ring-dashed'
            : ''
        }`}
        onDragOver={handleTeamDragOver}
        onDragLeave={handleTeamDragLeave}
        onDrop={handleDrop}
      >
        {slots.map((pokemon, index) => (
          <div
            key={index}
            className={`relative aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center overflow-hidden transition-all ${
              pokemon
                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
                : draggedOverSlot === index || (isDraggingOverTeam && !isTeamFull)
                ? 'border-blue-500 dark:border-blue-400 bg-blue-100 dark:bg-blue-900/30 border-solid'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDragOver={(e) => {
              e.stopPropagation();
              if (!pokemon) {
                handleDragOver(e, index);
              }
            }}
            onDragLeave={(e) => {
              e.stopPropagation();
              handleDragLeave();
            }}
            onDrop={(e) => {
              e.stopPropagation();
              if (!pokemon) {
                handleDrop(e, index);
              }
            }}
          >
            {pokemon ? (
              <>
                {/* Pokemon Image */}
                <Link
                  to={`/pokemon/${pokemon.name}`}
                  className="w-full h-full flex items-center justify-center p-2 hover:opacity-80 transition-opacity"
                >
                  {pokemon.imageUrl ? (
                    <img
                      src={pokemon.imageUrl}
                      alt={pokemon.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                      {pokemon.name}
                    </span>
                  )}
                </Link>
                {/* Remove Button */}
                <button
                  onClick={() => removePokemonFromTeam(pokemon.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                  aria-label={`Remove ${pokemon.name} from team`}
                  title={`Remove ${pokemon.name}`}
                >
                  ×
                </button>
                {/* Pokemon Name */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center truncate">
                  {pokemon.name}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  Empty
                </span>
                <span className="text-[10px] text-gray-300 dark:text-gray-600">
                  Drop here
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Team Weaknesses and Resistances */}
      {team.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Team Analysis
          </h3>
          
          {isLoading ? (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Analyzing...
            </div>
          ) : (
            <>
              {/* Weaknesses Section */}
              {Object.keys(weaknesses).length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                    Team Weaknesses
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(weaknesses).map(([typeName, count]) => {
                      const colors = getTypeColors(typeName);
                      return (
                        <span
                          key={typeName}
                          className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} dark:${colors.bgDark} dark:${colors.textDark}`}
                          title={`${count} team member${count > 1 ? 's' : ''} weak to ${typeName}`}
                        >
                          {typeName.charAt(0).toUpperCase() + typeName.slice(1)}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Resistances Section */}
              {Object.keys(resistances).length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                    Team Resistances
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(resistances).map(([typeName, count]) => {
                      const colors = getTypeColors(typeName);
                      return (
                        <span
                          key={typeName}
                          className={`px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} dark:${colors.bgDark} dark:${colors.textDark}`}
                          title={`${count} team member${count > 1 ? 's' : ''} resist ${typeName}`}
                        >
                          {typeName.charAt(0).toUpperCase() + typeName.slice(1)}: {count}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {Object.keys(weaknesses).length === 0 && Object.keys(resistances).length === 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No significant weaknesses or resistances
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

