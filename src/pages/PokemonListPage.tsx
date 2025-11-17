/**
 * Pokemon List Page
 * Displays a paginated grid of Pokemon cards with infinite scroll functionality.
 */

import { useEffect, useRef } from 'react';
import { useInfinitePokemon } from '../hooks/usePokemon';
import { PokemonCardWithData } from '../components/PokemonCardWithData';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

/**
 * Pokemon list page with infinite scrolling.
 * Uses useInfinitePokemon hook to fetch paginated Pokemon data.
 * Displays Pokemon cards in a grid layout with infinite scroll functionality.
 * 
 * - Shows loading spinner during initial fetch
 * - Displays error message if fetch fails
 * - Maps over all pages to render Pokemon cards
 * - Each card fetches its own data (N+1 query pattern) for complete Pokemon info
 * - Automatically fetches next page when user scrolls to bottom (infinite scroll)
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

  // Ref for the sentinel element that triggers infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when user reaches bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // If sentinel is visible, has next page, and not currently fetching, load more
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null, // Use viewport as root
        rootMargin: '100px', // Trigger 100px before reaching bottom
        threshold: 0.1,
      }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);


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
        {allPokemon.map((pokemon) => (
          <PokemonCardWithData
            key={pokemon.name}
            url={pokemon.url}
            name={pokemon.name}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel and Loading Indicator */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isFetchingNextPage && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <LoadingSpinner size="sm" />
            <span className="text-sm">Loading more Pokemon...</span>
          </div>
        )}
        {!hasNextPage && allPokemon.length > 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No more Pokemon to load
          </p>
        )}
      </div>
    </div>
  );
}
