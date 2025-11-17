/**
 * Pokemon Card with Data Fetching
 * Wrapper component that fetches individual Pokemon data and renders PokemonCard.
 */

import { usePokemon } from '../hooks/usePokemon';
import { PokemonCard } from './PokemonCard';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface PokemonCardWithDataProps {
  /** Pokemon API URL from PokemonListItem */
  url: string;
  /** Pokemon name from list (used as fallback) */
  name: string;
}

/**
 * Card component that fetches individual Pokemon data and displays it.
 * Implements N+1 query pattern: each card fetches its own data.
 * 
 * - Fetches complete Pokemon data including sprites and types
 * - Shows loading spinner while fetching
 * - Displays PokemonCard with fetched data
 * - Uses React Query for efficient caching and data management
 * 
 * @param url - Pokemon API URL from PokemonListItem
 * @param name - Pokemon name (used as key and fallback)
 */
export function PokemonCardWithData({ url, name }: PokemonCardWithDataProps) {
  const { data: pokemon, isLoading, isError } = usePokemon(url);

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

  return (
    <PokemonCard
      name={pokemon.name}
      image={imageUrl}
      types={pokemon.types}
    />
  );
}
