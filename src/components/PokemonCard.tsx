/**
 * Pokemon Card Component
 * Displays Pokemon information in a card format with image, name, and types.
 */

import { Link } from 'react-router-dom';
import { getTypeColors } from '../lib/pokemonTypeColors';
import { getHabitatBackground, type HabitatName } from '../lib/pokemonHabitats';

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
  /** Optional compact variant for smaller displays */
  compact?: boolean;
  /** Optional habitat for background image */
  habitat?: HabitatName | null;
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
export function PokemonCard({ name, image, types, compact = false, habitat = null }: PokemonCardProps) {
  // Capitalize first letter of Pokemon name
  const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);

  const cardPadding = compact ? 'p-2' : 'p-3 md:p-4';
  const imageHeight = compact ? 'h-20 mb-2' : 'h-32 md:h-40 mb-2 md:mb-4';
  const nameClasses = compact
    ? 'text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5 text-center'
    : 'text-base md:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 md:mb-3 text-center';

  // Get habitat background configuration
  const habitatConfig = habitat ? getHabitatBackground(habitat) : null;

  // Build inline styles for habitat background (only for image container)
  const habitatStyle = habitatConfig
    ? {
        backgroundImage: `linear-gradient(rgba(255, 255, 255, ${habitatConfig.overlayOpacity}), rgba(255, 255, 255, ${habitatConfig.overlayOpacity})), url('${habitatConfig.image}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : undefined;

  return (
    <Link
      to={`/pokemon/${name}`}
      className={`block bg-white dark:bg-gray-800 rounded-lg shadow-md ${cardPadding} hover:scale-105 transition-transform cursor-pointer border border-gray-200 dark:border-gray-700 no-underline h-full flex flex-col`}
    >
      {/* Pokemon Image */}
      <div 
        className={`flex justify-center items-center ${imageHeight} ${habitatConfig ? '' : 'bg-gray-50 dark:bg-gray-900'} rounded-lg`}
        style={habitatStyle}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            className="max-h-full max-w-full object-contain"
            draggable={false}
          />
        ) : (
          <span className="text-gray-400 dark:text-gray-600">No image</span>
        )}
      </div>

      {/* Pokemon Name */}
      <h3 className={nameClasses}>
        {capitalizedName}
      </h3>

      {/* Pokemon Types */}
      <div
        className={`flex flex-wrap ${compact ? 'gap-1' : 'gap-1 md:gap-2'} justify-center ${
          compact ? 'mt-0.5' : 'mt-auto'
        }`}
      >
        {types.map((type, index) => {
          const typeColors = getTypeColors(type.type.name);
          const capitalizedType = type.type.name.charAt(0).toUpperCase() + type.type.name.slice(1);

          return (
            <span
              key={index}
              className={`${compact ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-0.5 md:px-3 md:py-1 text-[10px] md:text-xs'} font-medium rounded-full ${typeColors.bg} ${typeColors.text} dark:${typeColors.bgDark} dark:${typeColors.textDark}`}
            >
              {capitalizedType}
            </span>
          );
        })}
      </div>
    </Link>
  );
}
