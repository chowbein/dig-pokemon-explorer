/**
 * Pokemon Habitat Configuration
 * Maps habitat names to background images and provides fallback colors.
 */

/**
 * Habitat names from PokeAPI species endpoint
 */
export type HabitatName = 
  | 'cave'
  | 'forest'
  | 'grassland'
  | 'mountain'
  | 'rare'
  | 'rough-terrain'
  | 'sea'
  | 'urban'
  | 'waters-edge';

/**
 * Habitat configuration with image path and fallback gradient
 */
interface HabitatConfig {
  /** Path to background image in public folder */
  image: string;
  /** Fallback CSS gradient if image is not available */
  fallbackGradient: string;
  /** Overlay opacity to ensure text readability (0-1) */
  overlayOpacity: number;
}

/**
 * Maps habitat names to their background images and fallback styles.
 * Images should be placed in public/habitats/ folder.
 */
export const HABITAT_CONFIG: Record<HabitatName, HabitatConfig> = {
  cave: {
    image: '/habitats/cave.png',
    fallbackGradient: 'linear-gradient(135deg, #434343 0%, #1a1a1a 100%)',
    overlayOpacity: 0.3,
  },
  forest: {
    image: '/habitats/forest.png',
    fallbackGradient: 'linear-gradient(135deg, #2d5016 0%, #1a3409 100%)',
    overlayOpacity: 0.3,
  },
  grassland: {
    image: '/habitats/grassland.png',
    fallbackGradient: 'linear-gradient(135deg, #9ab86c 0%, #6b8e23 100%)',
    overlayOpacity: 0.25,
  },
  mountain: {
    image: '/habitats/mountain.png',
    fallbackGradient: 'linear-gradient(135deg, #8b7355 0%, #5d4e37 100%)',
    overlayOpacity: 0.3,
  },
  rare: {
    image: '/habitats/rare.png',
    fallbackGradient: 'linear-gradient(135deg, #9333ea 0%, #581c87 100%)',
    overlayOpacity: 0.35,
  },
  'rough-terrain': {
    image: '/habitats/rough-terrain.png',
    fallbackGradient: 'linear-gradient(135deg, #a0826d 0%, #6d5d4b 100%)',
    overlayOpacity: 0.3,
  },
  sea: {
    image: '/habitats/sea.png',
    fallbackGradient: 'linear-gradient(135deg, #0077be 0%, #003d5c 100%)',
    overlayOpacity: 0.3,
  },
  urban: {
    image: '/habitats/urban.png',
    fallbackGradient: 'linear-gradient(135deg, #757575 0%, #424242 100%)',
    overlayOpacity: 0.35,
  },
  'waters-edge': {
    image: '/habitats/waters-edge.png',
    fallbackGradient: 'linear-gradient(135deg, #4fc3f7 0%, #0288d1 100%)',
    overlayOpacity: 0.25,
  },
};

/**
 * Gets the habitat background style for a given habitat name.
 * Returns image path and fallback gradient.
 */
export function getHabitatBackground(habitat: HabitatName | null): HabitatConfig | null {
  if (!habitat) return null;
  return HABITAT_CONFIG[habitat] || null;
}

/**
 * Gets CSS background style for a habitat.
 * Includes both image and fallback gradient.
 */
export function getHabitatBackgroundStyle(habitat: HabitatName | null): string {
  const config = getHabitatBackground(habitat);
  if (!config) return 'bg-gray-50 dark:bg-gray-900';
  
  // Returns CSS for background image with fallback
  return `url('${config.image}'), ${config.fallbackGradient}`;
}

