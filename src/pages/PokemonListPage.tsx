/**
 * Pokemon List Page
 * Displays a paginated grid of Pokemon cards with infinite scroll functionality and hybrid filtering.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInfinitePokemon, usePokemonByTypes, useFilteredPokemonByType } from '../hooks/usePokemon';
import { PokemonCardWithData } from '../components/PokemonCardWithData';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { FilterPanel } from '../components/FilterPanel';
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
  const [displayCount, setDisplayCount] = useState(20); // For paginating filtered results
  const [filtersVisible, setFiltersVisible] = useState(true);

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

  // When filters change, reset display count to 20
  useEffect(() => {
    setDisplayCount(20);
  }, [selectedTypes, urlTypes, searchQuery]);

  // For filtered results, only display the first 'displayCount' Pokemon (client-side pagination)
  // This makes filtered results behave like infinite scroll - 20 at a time
  const displayedPokemon = useMemo(() => {
    if (hasTypeFilter || hasUrlTypesFilter) {
      // When filters are active, paginate the results
      return filteredPokemon.slice(0, displayCount);
    }
    // When no filters, use all results (already paginated by infinite scroll)
    return filteredPokemon;
  }, [filteredPokemon, displayCount, hasTypeFilter, hasUrlTypesFilter]);

  // Check if there are more filtered results to load
  const hasMoreFiltered = filteredPokemon.length > displayCount;

  // Handle type checkbox toggle
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  // Ref for the sentinel element that triggers infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Intersection Observer to detect when user reaches bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          if (hasTypeFilter || hasUrlTypesFilter) {
            // For filtered results, load more from client-side pagination
            if (hasMoreFiltered) {
              setDisplayCount((prev) => prev + 20);
            }
          } else {
            // For unfiltered, use infinite scroll API pagination
            if (hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, hasTypeFilter, hasUrlTypesFilter, hasMoreFiltered]);


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
        <div className="flex items-center gap-4">
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
          <button
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            <span>{filtersVisible ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className={`lg:col-span-1 lg:order-last ${filtersVisible ? 'block' : 'hidden'}`}>
          <FilterPanel
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedTypes={selectedTypes}
            toggleType={toggleType}
            clearTypeFilters={() => setSelectedTypes([])}
          />
        </div>

        <div className={`${filtersVisible ? 'lg:col-span-3' : 'lg:col-span-4'} lg:order-first`}>
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
                Showing {displayedPokemon.length} of {filteredPokemon.length} Pokemon
                {searchQuery.trim() && ` matching "${searchQuery}"`}
                {hasTypeFilter && ` of selected types`}
              </div>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${filtersVisible ? 'xl:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-5'} gap-6 mb-8`}>
                {displayedPokemon.map((pokemon) => (
                  <PokemonCardWithData
                    key={pokemon.name}
                    url={pokemon.url}
                    name={pokemon.name}
                  />
                ))}
              </div>
            </>
          )}

          {/* Infinite Scroll Sentinel and Loading Indicator */}
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {(hasTypeFilter || hasUrlTypesFilter) ? (
              // For filtered results, show "loading more" when there are more to display
              hasMoreFiltered ? (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Loading more Pokemon...</span>
                </div>
              ) : (
                displayedPokemon.length > 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    All {filteredPokemon.length} Pokemon loaded
                  </p>
                )
              )
            ) : (
              // For unfiltered results, show API pagination status
              <>
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">Loading more Pokemon...</span>
                  </div>
                )}
                {!hasNextPage && displayedPokemon.length > 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No more Pokemon to load
                  </p>
                )}
              </>
            )}
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  );
}
