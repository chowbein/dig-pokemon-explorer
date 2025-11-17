/**
 * Pokemon List Page
 * Displays a paginated grid of Pokemon cards with infinite scroll functionality.
 */

import { useInfinitePokemon } from '../hooks/usePokemon';
import { PokemonCard } from '../components/PokemonCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * Pokemon list page with infinite scrolling.
 * Uses useInfinitePokemon hook to fetch paginated Pokemon data.
 * Displays Pokemon cards in a grid layout with load more functionality.
 * 
 * - Shows loading spinner during initial fetch
 * - Displays error message if fetch fails
 * - Maps over all pages to render Pokemon cards
 * - Extracts Pokemon ID from API URL to construct image URLs
 * - Load More button fetches next page and disables during fetch or when no more pages
 */
export function PokemonListPage() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePokemon();

  /**
   * Extracts Pokemon ID from API URL.
   * Pokemon API URLs format: https://pokeapi.co/api/v2/pokemon/{id}/
   */
  const extractPokemonId = (url: string): number => {
    const match = url.match(/\/pokemon\/(\d+)\//);
    return match ? parseInt(match[1], 10) : 0;
  };

  /**
   * Constructs Pokemon sprite image URL from ID.
   * Uses official artwork sprite from PokeAPI CDN.
   */
  const getPokemonImageUrl = (id: number): string => {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading Pokemon..." />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen gap-4">
        <div className="text-red-600 dark:text-red-400 text-lg font-semibold">
          Error loading Pokemon
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  if (!data || !data.pages.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 dark:text-gray-400">No Pokemon found</p>
      </div>
    );
  }

  // Flatten all Pokemon from all pages
  const allPokemon = data.pages.flatMap((page) => page.results);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8 text-center">
        Pokemon Explorer
      </h1>

      {/* Pokemon Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
        {allPokemon.map((pokemon) => {
          const pokemonId = extractPokemonId(pokemon.url);
          const imageUrl = getPokemonImageUrl(pokemonId);

          return (
            <PokemonCard
              key={pokemon.name}
              name={pokemon.name}
              image={imageUrl}
              types={[]} // Types not available from list endpoint, would need individual fetch
            />
          );
        })}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
              isFetchingNextPage
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
          {isFetchingNextPage ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            'Load More'
          )}
          </button>
        </div>
      )}
    </div>
  );
}
