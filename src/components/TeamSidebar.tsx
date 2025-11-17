/**
 * Team Sidebar Component
 * Displays the user's Pokemon team with 6 slots and team weaknesses/resistances.
 */

import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTeam } from '../context/TeamContext';
import { useQueries } from '@tanstack/react-query';
import { fetchPokemonDetail, fetchTypeData, fetchPokemonSpecies } from '../services/api';
import { useTeamTypeAnalysis } from '../hooks/useTeamTypeAnalysis';
import { TeamSummary } from './TeamSummary';
import { PokemonCard } from './PokemonCard';
import { getTypeColors } from '../lib/pokemonTypeColors';
import { getHabitatWithInference } from '../lib/habitatInference';
import type { TeamPokemon } from '../context/TeamContext';
import type { HabitatName } from '../lib/pokemonHabitats';

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
  const [isDraggingOverTeam, setIsDraggingOverTeam] = useState(false);
  const [loadingWeakness, setLoadingWeakness] = useState<string | null>(null);
  const navigate = useNavigate();


  // Fetch Pokemon data for each team member (needed for display and type analysis)
  const pokemonQueries = useQueries({
    queries: team.map((pokemon) => ({
      queryKey: ['pokemon', pokemon.id, pokemon.name],
      queryFn: () => fetchPokemonDetail(pokemon.name),
      staleTime: 1000 * 60 * 10, // 10 minutes
    })),
  });

  // Fetch species data for each team member (needed for habitat backgrounds)
  const speciesQueries = useQueries({
    queries: team.map((pokemon) => ({
      queryKey: ['pokemon-species', pokemon.name],
      queryFn: () => fetchPokemonSpecies(pokemon.name),
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

  const pokemonDetailsMap = useMemo(() => {
    const map = new Map<number, NonNullable<typeof pokemonQueries[number]['data']>>();
    team.forEach((teamPokemon, index) => {
      const detail = pokemonQueries[index]?.data;
      if (teamPokemon && detail) {
        map.set(teamPokemon.id, detail);
      }
    });
    return map;
  }, [pokemonQueries, team]);

  const speciesMap = useMemo(() => {
    const map = new Map<number, HabitatName>();
    team.forEach((teamPokemon, index) => {
      const species = speciesQueries[index]?.data;
      const pokemonDetail = pokemonQueries[index]?.data;
      
      if (teamPokemon && pokemonDetail) {
        const apiHabitat = species?.habitat?.name as HabitatName | null;
        // Always use inference to get a habitat (uses API habitat if available)
        const inferredHabitat = getHabitatWithInference(apiHabitat || null, pokemonDetail.types);
        map.set(teamPokemon.id, inferredHabitat);
      }
    });
    return map;
  }, [speciesQueries, pokemonQueries, team]);

  // Use custom hook for team type analysis
  // API Integration: Fetches type data from PokeAPI and aggregates weaknesses/resistances
  const { isLoading: isLoadingTypeAnalysis, weaknesses, resistances } =
    useTeamTypeAnalysis(teamWithTypes);

  /**
   * Extracts counter types and navigates to filtered list.
   * Counter types are types that are offensively strong against the weakness
   * (types that deal double damage to the weakness).
   * 
   * Complex Logic: Queries the weakness type's API response and extracts double_damage_from
   * to find types that deal 2x damage to the weakness type.
   */
  const extractAndNavigate = (
    typeData: { damage_relations?: { double_damage_from?: Array<{ name: string }> } },
    weaknessName: string
  ) => {
    if (!typeData?.damage_relations) return;

    const counterTypes = new Set<string>();
    
    // Types that deal double damage to the weakness (offensively strong counters)
    // API Integration: Extracts from damage_relations.double_damage_from array
    typeData.damage_relations.double_damage_from?.forEach((type: { name: string }) => {
      counterTypes.add(type.name);
    });

    // Navigate with counter types and weakness name as URL parameters
    const typesParam = Array.from(counterTypes).join(',');
    navigate(`/?types=${typesParam}&weakness=${weaknessName}`);
  };

  /**
   * Handles "Find a Counter" button click for a specific weakness.
   * Fetches type data for the weakness and extracts counter types.
   */
  const handleFindCounter = async (weaknessName: string) => {
    if (!weaknessName) return;

    setLoadingWeakness(weaknessName);
    try {
      const typeData = await fetchTypeData(weaknessName);
      extractAndNavigate(typeData, weaknessName);
    } catch (error) {
      console.error('Failed to fetch counter types:', error);
    } finally {
      setLoadingWeakness(null);
    }
  };

  const isLoadingPokemon = pokemonQueries.some((query) => query.isLoading);
  const isLoading = isLoadingPokemon || isLoadingTypeAnalysis;

  // Create array of 6 slots (filled or empty)
  const slots = Array.from({ length: 6 }, (_, index) => {
    return team[index] || null;
  });

  /**
   * Handles drop event on the team area.
   * Extracts Pokemon data from dataTransfer and adds to team.
   * Automatically finds the next available slot.
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
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
    } else {
      e.dataTransfer.dropEffect = 'none';
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
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        My Team ({team.length}/6)
      </h2>
      <div
        className={`grid grid-cols-3 gap-0.5 items-stretch mb-4 p-0 rounded-lg transition-all ${
          isDraggingOverTeam && !isTeamFull
            ? 'bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-400 dark:ring-blue-500 ring-dashed'
            : ''
        }`}
        onDragOver={handleTeamDragOver}
        onDragLeave={handleTeamDragLeave}
        onDrop={handleDrop}
      >
        {slots.map((pokemon, index) => {
          const pokemonDetails = pokemon ? pokemonDetailsMap.get(pokemon.id) : null;
          const imageUrl = pokemonDetails
            ? pokemonDetails.sprites.other?.['official-artwork']?.front_default ||
              pokemonDetails.sprites.front_default ||
              null
            : pokemon?.imageUrl ?? null;
          // Habitat is already inferred in speciesMap (undefined if not loaded yet)
          const habitat = pokemon ? (speciesMap.get(pokemon.id) || null) : null;

          return (
            <div
              key={index}
              className={`relative rounded-lg transition-all h-full min-h-[160px] ${
                !pokemon
                  ? 'border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
                  : ''
              }`}
            >
              {pokemon ? (
                <div className="relative h-full">
                  <PokemonCard
                    name={pokemonDetails?.name || pokemon.name}
                    image={imageUrl}
                    types={pokemonDetails?.types || []}
                    compact
                    habitat={habitat}
                  />
                  <button
                    onClick={() => removePokemonFromTeam(pokemon.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold transition-colors shadow-md z-10"
                    aria-label={`Remove ${pokemon.name} from team`}
                    title={`Remove ${pokemon.name}`}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center px-2 h-full">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                    Empty Slot
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    Drag here
                  </span>
                </div>
              )}
            </div>
          );
        })}
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
              {/* Team Summary */}
              <TeamSummary weaknesses={weaknesses} resistances={resistances} />

              {/* Weaknesses and Resistances Table */}
              {(Object.keys(weaknesses).length > 0 || Object.keys(resistances).length > 0) && (
                <div className="mb-3">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead>
                        <tr>
                          <th className="text-left px-2 py-2 font-semibold text-red-600 dark:text-red-400 border-b border-gray-300 dark:border-gray-600">
                            Weaknesses
                          </th>
                          <th className="text-left px-2 py-2 font-semibold text-green-600 dark:text-green-400 border-b border-gray-300 dark:border-gray-600">
                            Resistances
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          // Sort weaknesses and resistances by count (highest first)
                          const sortedWeaknesses = Object.entries(weaknesses)
                            .sort(([, countA], [, countB]) => countB - countA);
                          const sortedResistances = Object.entries(resistances)
                            .sort(([, countA], [, countB]) => countB - countA);
                          
                          // Get max rows needed
                          const maxRows = Math.max(sortedWeaknesses.length, sortedResistances.length);
                          
                          // Create rows for table
                          return Array.from({ length: maxRows }, (_, index) => {
                            const weakness = sortedWeaknesses[index];
                            const resistance = sortedResistances[index];
                            
                            return (
                              <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                                {/* Weaknesses Column */}
                                <td className="px-2 py-1.5 text-left">
                                  {weakness ? (
                                    <div className="flex items-center justify-between gap-2">
                                      <span
                                        className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${getTypeColors(weakness[0]).bg} ${getTypeColors(weakness[0]).text} dark:${getTypeColors(weakness[0]).bgDark} dark:${getTypeColors(weakness[0]).textDark}`}
                                        title={`${weakness[1]} team member${weakness[1] > 1 ? 's' : ''} weak to ${weakness[0]}`}
                                      >
                                        {weakness[0].charAt(0).toUpperCase() + weakness[0].slice(1)}
                                        <span className="font-semibold">({weakness[1]})</span>
                                      </span>
                                      <button
                                        onClick={() => handleFindCounter(weakness[0])}
                                        disabled={loadingWeakness === weakness[0]}
                                        className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 disabled:text-gray-400 disabled:cursor-not-allowed rounded transition-colors"
                                        title={`Find Pokemon that counter ${weakness[0]}`}
                                        aria-label={`Filter counters for ${weakness[0]}`}
                                      >
                                        {loadingWeakness === weakness[0] ? (
                                          <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                        ) : (
                                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                                          </svg>
                                        )}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-600">—</span>
                                  )}
                                </td>
                                {/* Resistances Column */}
                                <td className="px-2 py-1.5 text-left">
                                  {resistance ? (
                                    <span
                                      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium ${getTypeColors(resistance[0]).bg} ${getTypeColors(resistance[0]).text} dark:${getTypeColors(resistance[0]).bgDark} dark:${getTypeColors(resistance[0]).textDark}`}
                                      title={`${resistance[1]} team member${resistance[1] > 1 ? 's' : ''} resist ${resistance[0]}`}
                                    >
                                      {resistance[0].charAt(0).toUpperCase() + resistance[0].slice(1)}
                                      <span className="font-semibold">({resistance[1]})</span>
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 dark:text-gray-600">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
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

