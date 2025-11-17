import { POKEMON_TYPES } from '../lib/pokemonTypes';
import { getTypeColors } from '../lib/pokemonTypeColors';

interface FilterPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTypes: string[];
  toggleType: (type: string) => void;
  clearTypeFilters: () => void;
}

export function FilterPanel({
  searchQuery,
  setSearchQuery,
  selectedTypes,
  toggleType,
  clearTypeFilters,
}: FilterPanelProps) {
  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <div className="space-y-6">
        {/* Name Search Input */}
        <div>
          <label htmlFor="sidebar-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search by Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              id="sidebar-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Type Filter Checkboxes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Type
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900/50 max-h-64 overflow-y-auto">
            {POKEMON_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type);
              const typeColors = getTypeColors(type);
              const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);

              return (
                <label
                  key={type}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all border-2 ${
                    isSelected
                      ? `${typeColors.bg} ${typeColors.text} dark:${typeColors.bgDark} dark:${typeColors.textDark} border-transparent ring-2 ring-offset-1 ring-blue-500`
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-transparent hover:border-gray-400 dark:hover:border-gray-500'
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
              onClick={clearTypeFilters}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear type filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
