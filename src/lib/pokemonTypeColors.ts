/**
 * Pokemon Type Color Utilities
 * Maps Pokemon types to Tailwind CSS color classes for consistent styling.
 */

/**
 * Gets Tailwind CSS classes for Pokemon type badges.
 * Returns background and text color classes based on Pokemon type name.
 * 
 * @param typeName - Pokemon type name (e.g., "fire", "water", "grass")
 * @returns Object with background and text color classes for light and dark modes
 */
export function getTypeColors(typeName: string): {
  bg: string;
  text: string;
  bgDark: string;
  textDark: string;
} {
  const type = typeName.toLowerCase();

  // Map each Pokemon type to its color scheme
  const typeColorMap: Record<string, { bg: string; text: string; bgDark: string; textDark: string }> = {
    normal: { bg: 'bg-gray-100', text: 'text-gray-800', bgDark: 'bg-gray-700', textDark: 'text-gray-200' },
    fire: { bg: 'bg-red-100', text: 'text-red-800', bgDark: 'bg-red-900', textDark: 'text-red-200' },
    water: { bg: 'bg-blue-100', text: 'text-blue-800', bgDark: 'bg-blue-900', textDark: 'text-blue-200' },
    electric: { bg: 'bg-yellow-100', text: 'text-yellow-800', bgDark: 'bg-yellow-900', textDark: 'text-yellow-200' },
    grass: { bg: 'bg-green-100', text: 'text-green-800', bgDark: 'bg-green-900', textDark: 'text-green-200' },
    ice: { bg: 'bg-cyan-100', text: 'text-cyan-800', bgDark: 'bg-cyan-900', textDark: 'text-cyan-200' },
    fighting: { bg: 'bg-orange-100', text: 'text-orange-800', bgDark: 'bg-orange-900', textDark: 'text-orange-200' },
    poison: { bg: 'bg-purple-100', text: 'text-purple-800', bgDark: 'bg-purple-900', textDark: 'text-purple-200' },
    ground: { bg: 'bg-amber-100', text: 'text-amber-800', bgDark: 'bg-amber-900', textDark: 'text-amber-200' },
    flying: { bg: 'bg-sky-100', text: 'text-sky-800', bgDark: 'bg-sky-900', textDark: 'text-sky-200' },
    psychic: { bg: 'bg-pink-100', text: 'text-pink-800', bgDark: 'bg-pink-900', textDark: 'text-pink-200' },
    bug: { bg: 'bg-lime-100', text: 'text-lime-800', bgDark: 'bg-lime-900', textDark: 'text-lime-200' },
    rock: { bg: 'bg-stone-100', text: 'text-stone-800', bgDark: 'bg-stone-900', textDark: 'text-stone-200' },
    ghost: { bg: 'bg-violet-100', text: 'text-violet-800', bgDark: 'bg-violet-900', textDark: 'text-violet-200' },
    dragon: { bg: 'bg-indigo-100', text: 'text-indigo-800', bgDark: 'bg-indigo-900', textDark: 'text-indigo-200' },
    dark: { bg: 'bg-gray-700', text: 'text-gray-200', bgDark: 'bg-gray-800', textDark: 'text-gray-300' },
    steel: { bg: 'bg-slate-200', text: 'text-slate-900', bgDark: 'bg-slate-600', textDark: 'text-slate-100' },
    fairy: { bg: 'bg-rose-100', text: 'text-rose-800', bgDark: 'bg-rose-900', textDark: 'text-rose-200' },
  };

  // Return mapped colors or default if type not found
  return typeColorMap[type] || {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    bgDark: 'bg-gray-700',
    textDark: 'text-gray-200',
  };
}

