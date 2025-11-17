/**
 * Pokemon Detail Page
 * Displays detailed information about a specific Pokemon.
 */

import { useParams, Link } from 'react-router-dom';
import { usePokemonDetail } from '../hooks/usePokemon';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { getTypeColors } from '../lib/pokemonTypeColors';

/**
 * Pokemon detail page for individual Pokemon.
 * Displays complete Pokemon information including stats, types, abilities, and moves.
 * 
 * - Fetches Pokemon data by name from URL parameter
 * - Displays detailed Pokemon information
 * - Shows Pokemon image, types, stats (as bar charts), abilities, and moves
 */
export function PokemonDetailPage() {
  const { name } = useParams<{ name: string }>();
  const { data: pokemon, isLoading, isError, error } = usePokemonDetail(name || '');

  /**
   * Capitalizes the first letter of a string.
   */
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  /**
   * Formats stat name for display.
   * Converts kebab-case to Title Case (e.g., "special-attack" -> "Special Attack").
   */
  const formatStatName = (statName: string): string => {
    return statName
      .split('-')
      .map((word) => capitalize(word))
      .join(' ');
  };

  /**
   * Gets color for stat bar based on stat value.
   * Returns different colors based on stat ranges.
   */
  const getStatBarColor = (value: number): string => {
    if (value >= 150) return 'bg-red-500';
    if (value >= 120) return 'bg-orange-500';
    if (value >= 90) return 'bg-yellow-500';
    if (value >= 60) return 'bg-green-500';
    if (value >= 30) return 'bg-blue-500';
    return 'bg-gray-400';
  };

  /**
   * Calculates percentage for stat bar width.
   * Pokemon stats range from 1-255, using 255 as max for visualization.
   */
  const getStatPercentage = (value: number): number => {
    const max = 255;
    return Math.min((value / max) * 100, 100);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading Pokemon details..." />
        </div>
      </div>
    );
  }

  if (isError || !pokemon) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold">
            Error loading Pokemon
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {error?.message || 'Pokemon not found'}
          </p>
          <Link
            to="/"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to Pokemon List
          </Link>
        </div>
      </div>
    );
  }

  // Get Pokemon image (prefer official artwork)
  const imageUrl =
    pokemon.sprites.other?.['official-artwork']?.front_default ||
    pokemon.sprites.front_default ||
    null;

  const capitalizedName = capitalize(pokemon.name);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6"
      >
        ← Back to Pokemon List
      </Link>

      {/* Pokemon Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          {/* Pokemon Image */}
          <div className="flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={pokemon.name}
                className="w-64 h-64 object-contain"
              />
            ) : (
              <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-600">No image</span>
              </div>
            )}
          </div>

          {/* Pokemon Basic Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {capitalizedName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              #{String(pokemon.id).padStart(3, '0')}
            </p>

            {/* Pokemon Types */}
            <div className="flex flex-wrap gap-2 mb-4">
              {pokemon.types.map((type, index) => {
                const typeColors = getTypeColors(type.type.name);
                const capitalizedType = capitalize(type.type.name);

                return (
                  <span
                    key={index}
                    className={`px-4 py-2 text-sm font-medium rounded-full ${typeColors.bg} ${typeColors.text} dark:${typeColors.bgDark} dark:${typeColors.textDark}`}
                  >
                    {capitalizedType}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Base Stats
        </h2>
        <div className="space-y-4">
          {pokemon.stats.map((stat, index) => {
            const statName = formatStatName(stat.stat.name);
            const statValue = stat.base_stat;
            const percentage = getStatPercentage(statValue);
            const barColor = getStatBarColor(statValue);

            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-32">
                    {statName}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-12 text-right">
                    {statValue}
                  </span>
                </div>
                {/* Horizontal Bar Chart */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={statValue}
                    aria-valuemin={0}
                    aria-valuemax={255}
                    aria-label={`${statName}: ${statValue}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abilities Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Abilities
        </h2>
        <div className="flex flex-wrap gap-2">
          {pokemon.abilities.map((ability, index) => {
            const abilityName = ability.ability.name
              .split('-')
              .map((word) => capitalize(word))
              .join(' ');

            return (
              <div
                key={index}
                className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm font-medium"
              >
                {abilityName}
                {ability.is_hidden && (
                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                    (Hidden)
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Moves Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          Moves ({pokemon.moves.length})
        </h2>
        <div className="max-h-96 overflow-y-auto">
          <div className="flex flex-wrap gap-2">
            {pokemon.moves.map((move, index) => {
              const moveName = move.move.name
                .split('-')
                .map((word) => capitalize(word))
                .join(' ');

              return (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-sm"
                >
                  {moveName}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
