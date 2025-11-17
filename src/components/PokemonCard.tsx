/**
 * Pokemon Card Component
 * Displays Pokemon information in a card format with image, name, and types.
 */

import { Link } from 'react-router-dom';
import { getTypeColors } from '../lib/pokemonTypeColors';

interface PokemonCardProps {
  /** Pokemon name */
  name: string;
  /** Pokemon image URL (sprite or artwork) */
  image: string | null;
  /** Array of Pokemon types with type information */
  types: Array<{
    type: {
      name: string;
    };
  }>;
}

/**
 * Card component displaying Pokemon information.
 * Features hover effect for better interactivity.
 * Wrapped with Link for navigation to Pokemon detail page.
 * 
 * @param name - Pokemon name (capitalized)
 * @param image - Image URL for Pokemon sprite/artwork
 * @param types - Array of Pokemon types to display as badges
 */
export function PokemonCard({ name, image, types }: PokemonCardProps) {
  // Capitalize first letter of Pokemon name
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <Link
      to={`/pokemon/${name}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 hover:scale-105 transition-transform cursor-pointer border border-gray-200 dark:border-gray-700 no-underline"
    >
      {/* Pokemon Image */}
      <div className="flex justify-center items-center h-40 mb-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
        {image ? (
          <img
            src={image}
            alt={name}
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-gray-400 dark:text-gray-600">No image</span>
        )}
      </div>

      {/* Pokemon Name */}
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 text-center">
        {capitalizedName}
      </h3>

      {/* Pokemon Types */}
      <div className="flex flex-wrap gap-2 justify-center">
        {types.map((type, index) => {
          const typeColors = getTypeColors(type.type.name);
          const capitalizedType = type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1);

          return (
            <span
              key={index}
              className={`px-3 py-1 text-xs font-medium rounded-full ${typeColors.bg} ${typeColors.text} dark:${typeColors.bgDark} dark:${typeColors.textDark}`}
            >
              {capitalizedType}
            </span>
          );
        })}
      </div>
    </Link>
  );
}
