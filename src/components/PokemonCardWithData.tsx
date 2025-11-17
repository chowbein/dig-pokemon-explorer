/**
 * Pokemon Card with Data Fetching
 * Wrapper component that fetches individual Pokemon data and renders PokemonCard.
 */

import { useQuery } from '@tanstack/react-query';
import { usePokemon } from '../hooks/usePokemon';
import { useTeam } from '../context/TeamContext';
import { PokemonCard } from './PokemonCard';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { fetchPokemonSpecies } from '../services/api';
import type { HabitatName } from '../lib/pokemonHabitats';

interface PokemonCardWithDataProps {
  /** Pokemon API URL from PokemonListItem */
  url: string;
  /** Pokemon name from list (used as fallback) */
  name: string;
}

/**
 * Card component that fetches individual Pokemon data and displays it.
 * Implements N+1 query pattern: each card fetches its own data.
 * Supports drag and drop functionality for adding Pokemon to team.
 * 
 * - Fetches complete Pokemon data including sprites and types
 * - Shows loading spinner while fetching
 * - Displays PokemonCard with fetched data
 * - Uses React Query for efficient caching and data management
 * - Makes card draggable for team management
 * 
 * @param url - Pokemon API URL from PokemonListItem
 * @param name - Pokemon name (used as key and fallback)
 */
export function PokemonCardWithData({ url, name }: PokemonCardWithDataProps) {
  const { data: pokemon, isLoading, isError } = usePokemon(url);
  const { isTeamFull, isPokemonInTeam } = useTeam();

  // Fetch species data for habitat information
  const { data: species } = useQuery({
    queryKey: ['pokemon-species', name],
    queryFn: () => fetchPokemonSpecies(name),
    enabled: !!pokemon, // Only fetch when pokemon data is available
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (isError || !pokemon) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400 text-sm">Failed to load</p>
      </div>
    );
  }

  // Use official artwork if available, otherwise use default sprite
  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    null;

  // Extract habitat name from species data
  const habitat = species?.habitat?.name as HabitatName | null || null;

  /**
   * Handles drag start event.
   * Creates a custom drag preview using the entire card element.
   * Stores Pokemon data in dataTransfer for drop handling.
   * Prevents dragging if Pokemon is already in team or team is full.
   */
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent dragging if Pokemon is already in team
    if (isPokemonInTeam(pokemon.id)) {
      e.preventDefault();
      return;
    }

    // Prevent dragging if team is full
    if (isTeamFull) {
      e.preventDefault();
      return;
    }

    const pokemonData = {
      id: pokemon.id,
      name: pokemon.name,
      imageUrl: imageUrl,
    };
    
    // Store Pokemon data as JSON in dataTransfer
    e.dataTransfer.setData('application/json', JSON.stringify(pokemonData));
    e.dataTransfer.effectAllowed = 'move';

    // Create a drag image from the entire card
    const dragElement = e.currentTarget.cloneNode(true) as HTMLElement;
    dragElement.style.position = 'absolute';
    dragElement.style.top = '-9999px';
    dragElement.style.width = e.currentTarget.offsetWidth + 'px';
    dragElement.style.opacity = '0.8';
    dragElement.style.transform = 'rotate(3deg)';
    document.body.appendChild(dragElement);
    
    e.dataTransfer.setDragImage(dragElement, e.currentTarget.offsetWidth / 2, e.currentTarget.offsetHeight / 2);
    
    // Clean up the temporary element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);
    
    // Add visual feedback during drag
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.4';
      e.currentTarget.style.transform = 'scale(0.95)';
    }
  };

  /**
   * Handles drag end event.
   * Restores card appearance after drag completes.
   */
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.transform = 'scale(1)';
    }
  };

  // Check if dragging is disabled
  const isDraggable = !isPokemonInTeam(pokemon.id) && !isTeamFull;

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`transition-all ${isDraggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
    >
      <PokemonCard
        name={pokemon.name}
        image={imageUrl}
        types={pokemon.types}
        habitat={habitat}
      />
    </div>
  );
}
