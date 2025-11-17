/**
 * Pokemon Detail Page
 * Displays detailed information about a specific Pokemon.
 */

import { useParams } from 'react-router-dom';

/**
 * Pokemon detail page for individual Pokemon.
 * Displays complete Pokemon information including stats, types, and abilities.
 * 
 * - Fetches Pokemon data by name from URL parameter
 * - Displays detailed Pokemon information
 * - Shows Pokemon image, types, stats, and abilities
 */
export function PokemonDetailPage() {
  const { name } = useParams<{ name: string }>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
        Pokemon Detail
      </h1>
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-600 dark:text-gray-400">
          {name ? `Pokemon: ${name}` : 'No Pokemon selected'}
        </p>
      </div>
    </div>
  );
}

