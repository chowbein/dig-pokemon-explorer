/**
 * Pokemon List Page
 * Displays a paginated grid of Pokemon cards with infinite scroll functionality and hybrid filtering.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfinitePokemon, usePokemonByTypes, useFilteredPokemonByType } from '../hooks/usePokemon';
import { PokemonCardWithData } from '../components/PokemonCardWithData';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { POKEMON_TYPES } from '../lib/pokemonTypes';
import { getTypeColors } from '../lib/pokemonTypeColors';
import type { PokemonListItem } from '../types/pokemon';

/**
 * Pokemon list page with infinite scrolling and hybrid filtering.
 * Uses useInfinitePokemon hook for paginated data and usePokemonByTypes for type filtering.
 * Displays Pokemon cards in a grid layout with infinite scroll functionality.
 * 
 * - Shows loading spinner during initial fetch
 * - Displays error message if fetch fails
 * - Maps over all pages to render Pokemon cards
 * - Each card fetches its own data (N+1 query pattern) for complete Pokemon info
 * - Type filtering: Multi-select checkboxes that fetch from type-specific API endpoints
 * - Name search: Client-side filtering on currently displayed results
 * - Filters work together: Type filter affects API calls, name search filters displayed results
 * - Automatically fetches next page when user scrolls to bottom (when not type-filtering)
 */
export function PokemonListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Read types and weakness from URL search parameter
  // API Integration: Reads counter types and weakness from URL query string (?types=water,rock&weakness=fire)
  const urlTypesParam = searchParams.get('types');
  const weaknessParam = searchParams.get('weakness');
  const urlTypes = useMemo(() => {
    if (urlTypesParam) {
      return urlTypesParam.split(',').filter((type) => type.trim().length > 0);
    }
    return [];
  }, [urlTypesParam]);

  const hasUrlTypesFilter = urlTypes.length > 0;

  /**
   * Capitalizes the first letter of a string.
   */
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Fetch Pokemon filtered by URL types (counter recommendations)
  const {
    data: urlFilteredData,
    isLoading: isLoadingUrlFilter,
  } = useFilteredPokemonByType(urlTypes);

  // Regular infinite query for all Pokemon
  const {
    data: infiniteData,
    isLoading: isLoadingInfinite,
    isError: isErrorInfinite,
    error: errorInfinite,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePokemon();

  // Type-filtered Pokemon (fetches when types are selected)
  const {
    data: typeFilteredData,
    isLoading: isLoadingTypes,
    isError: isErrorTypes,
    error: errorTypes,
  } = usePokemonByTypes(selectedTypes);

  /**
   * Clears the URL types filter and returns to main list.
   */
  const clearUrlFilter = () => {
    setSearchParams({});
  };

  // Determine which data source to use (priority: URL filter > checkbox filter > infinite scroll)
  const hasTypeFilter = selectedTypes.length > 0;
  const isLoading = hasUrlTypesFilter
    ? isLoadingUrlFilter
    : hasTypeFilter
    ? isLoadingTypes
    : isLoadingInfinite;
  const isError = hasTypeFilter ? isErrorTypes : isErrorInfinite;
  const error = hasTypeFilter ? errorTypes : errorInfinite;

  // Get base Pokemon list (priority: URL filter > checkbox filter > infinite scroll)
  const basePokemon = useMemo(() => {
    if (hasUrlTypesFilter) {
      return urlFilteredData || [];
    }
    if (hasTypeFilter) {
      return typeFilteredData || [];
    }
    return infiniteData?.pages.flatMap((page) => page.results) || [];
  }, [hasUrlTypesFilter, urlFilteredData, hasTypeFilter, typeFilteredData, infiniteData]);

  // Apply client-side name search filter
  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) {
      return basePokemon;
    }
    const query = searchQuery.toLowerCase().trim();
    return basePokemon.filter((pokemon: PokemonListItem) =>
      pokemon.name.toLowerCase().includes(query)
    );
  }, [basePokemon, searchQuery]);

  // Handle type checkbox toggle
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  // Ref for the sentinel element that triggers infinite scroll (only when not type-filtering)
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when user reaches bottom (only when not type-filtering)
  useEffect(() => {
    // Disable infinite scroll when type filtering or URL filtering (type endpoint returns all results at once)
    if (hasTypeFilter || hasUrlTypesFilter) {
      return;
    }

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, hasTypeFilter, hasUrlTypesFilter]);


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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Pokemon Explorer
        </h1>
        {hasUrlTypesFilter && weaknessParam && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing counters for{' '}
              <span className="font-semibold text-red-600 dark:text-red-400">
                {capitalize(weaknessParam)}
              </span>{' '}
              <span className="text-gray-500 dark:text-gray-500">
                ({urlTypes.map((type) => capitalize(type)).join(', ')})
              </span>
            </div>
            <button
              onClick={clearUrlFilter}
              className="px-4 py-2 text-sm font-medium bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Filters Section */}
      <div className="mb-8 space-y-4">
        {/* Name Search Input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search by Name
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Pokemon by name..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Type Filter Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Type (select multiple)
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 max-h-48 overflow-y-auto">
            {POKEMON_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type);
              const typeColors = getTypeColors(type);
              const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

              return (
                <label
                  key={type}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                    isSelected
                      ? `${typeColors.bg} ${typeColors.text} dark:${typeColors.bgDark} dark:${typeColors.textDark} ring-2 ring-offset-2 ring-blue-500`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleType(type)}
                    className="sr-only"
                  />
                  {capitalizedType}
                </label>
              );
            })}
          </div>
          {selectedTypes.length > 0 && (
            <button
              onClick={() => setSelectedTypes([])}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear type filters
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Loading Pokemon..." />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="flex flex-col justify-center items-center min-h-[400px] gap-4">
          <div className="text-red-600 dark:text-red-400 text-lg font-semibold">
            Error loading Pokemon
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      )}

      {/* Pokemon Grid */}
      {!isLoading && !isError && (
        <>
          {filteredPokemon.length === 0 ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery.trim()
                  ? `No Pokemon found matching "${searchQuery}"`
                  : 'No Pokemon found'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredPokemon.length} Pokemon
                {searchQuery.trim() && ` matching "${searchQuery}"`}
                {hasTypeFilter && ` of selected types`}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                {filteredPokemon.map((pokemon) => (
                  <PokemonCardWithData
                    key={pokemon.name}
                    url={pokemon.url}
                    name={pokemon.name}
                  />
                ))}
              </div>
            </>
          )}

          {/* Infinite Scroll Sentinel and Loading Indicator (only when not type-filtering) */}
          {!hasTypeFilter && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isFetchingNextPage && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Loading more Pokemon...</span>
                </div>
              )}
              {!hasNextPage && filteredPokemon.length > 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No more Pokemon to load
                </p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
