/**
 * SearchFilterBar Component
 * 
 * Comprehensive search, filter, and sort bar that leverages QueryParams capabilities:
 * - Search input with debouncing
 * - Status/Filter dropdown
 * - Sort controls (column selection + ascending/descending)
 * - Results counter with pagination info from PaginatedResult
 * 
 * Usage:
 * ```tsx
 * const [queryParams, setQueryParams] = useState<QueryParams>({
 *   page: 1,
 *   pageSize: 10,
 *   search: '',
 *   sortBy: 'name',
 *   isDescending: false
 * });
 * 
 * <SearchFilterBar
 *   queryParams={queryParams}
 *   onQueryChange={setQueryParams}
 *   paginatedResult={result}
 *   filterOptions={[
 *     { label: 'All Status', value: 'all' },
 *     { label: 'Active', value: 'active' },
 *     { label: 'Locked', value: 'locked' }
 *   ]}
 *   sortOptions={[
 *     { label: 'Name', value: 'name' },
 *     { label: 'Email', value: 'email' },
 *     { label: 'Created Date', value: 'createdAt' }
 *   ]}
 *   currentFilter="all"
 *   onFilterChange={handleFilterChange}
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import { Search, ChevronDown, ArrowUp, ArrowDown, X } from 'lucide-react';
import { QueryParams, PaginatedResult } from '@/types/data';
import { useDebounce } from '@/hooks/useDebounce';

interface FilterOption {
  label: string;
  value: string;
}

interface SortOption {
  label: string;
  value: string;
}

interface SearchFilterBarProps<T> {
  // QueryParams management
  queryParams: QueryParams;
  onQueryChange: (params: QueryParams) => void;

  // Pagination info from API
  paginatedResult?: PaginatedResult<T>;

  // Filter dropdown
  filterOptions: FilterOption[];
  currentFilter: string;
  onFilterChange: (value: string) => void;

  // Sort options
  sortOptions: SortOption[];
  sortLabel?: string;

  // UI customization
  placeholder?: string;
  showResults?: boolean;
  dense?: boolean;
}

export function SearchFilterBar<T = any>({
  queryParams,
  onQueryChange,
  paginatedResult,
  filterOptions,
  currentFilter,
  onFilterChange,
  sortOptions,
  sortLabel = 'Sort By',
  placeholder = 'Search...',
  showResults = true,
  dense = false,
}: SearchFilterBarProps<T>) {
  const [searchInput, setSearchInput] = useState(queryParams.search || '');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update search in query params with debounce
  React.useEffect(() => {
    onQueryChange({
      ...queryParams,
      search: debouncedSearch,
      page: 1, // Reset to page 1 on search change
    });
  }, [debouncedSearch]);

  // Handle search input change (immediate for UI, debounced for API)
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  }, []);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setSearchInput('');
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortByValue: string) => {
    const currentSortBy = queryParams.sortBy;
    const isDescending =
      currentSortBy === sortByValue
        ? !queryParams.isDescending // Toggle if already sorting by this column
        : false; // Reset to ascending when changing column

    onQueryChange({
      ...queryParams,
      sortBy: sortByValue,
      isDescending,
      page: 1, // Reset to page 1
    });
    setShowSortDropdown(false);
  }, [queryParams, onQueryChange]);

  // Handle page size change
  const handlePageSizeChange = useCallback((newSize: number) => {
    onQueryChange({
      ...queryParams,
      pageSize: newSize,
      page: 1, // Reset to page 1
    });
  }, [queryParams, onQueryChange]);

  // Get current sort option label
  const currentSortOption = sortOptions.find(
    (opt) => opt.value === queryParams.sortBy
  );
  const sortButtonLabel = currentSortOption
    ? `${currentSortOption.label}${queryParams.isDescending ? ' ↓' : ' ↑'}`
    : sortLabel;

  // Format pagination info
  const getPaginationInfo = () => {
    if (!paginatedResult) return '';
    const startItem = (paginatedResult.page - 1) * paginatedResult.pageSize + 1;
    const endItem = Math.min(
      paginatedResult.page * paginatedResult.pageSize,
      paginatedResult.totalCount
    );
    return `Showing ${startItem} to ${endItem} of ${paginatedResult.totalCount}`;
  };

  const containerClass = dense
    ? 'flex flex-col gap-2 md:flex-row md:items-center md:gap-2 p-3 bg-card border border-border rounded-lg shadow-sm'
    : 'flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 bg-card border border-border rounded-lg shadow-sm';

  const inputWrapperClass = dense ? 'flex-1 min-w-[200px]' : 'flex-1 md:flex-none md:w-80';

  return (
    <div className={containerClass}>
      {/* Top row: Search + Filters + Sort */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:flex-1 md:gap-3">
        {/* Search Input */}
        <div className={`relative ${inputWrapperClass}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder" />
          <input
            type="text"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="w-full pl-10 pr-9 py-2 border border-input rounded-lg text-sm bg-card text-foreground placeholder-placeholder focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-placeholder hover:text-muted-foreground transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {filterOptions.length > 0 && (
          <div className="relative">
            <select
              value={currentFilter}
              onChange={(e) => {
                onFilterChange(e.target.value);
                onQueryChange({
                  ...queryParams,
                  page: 1, // Reset to page 1 on filter change
                });
              }}
              className="appearance-none pr-10 pl-3 py-2 border border-input rounded-lg text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-placeholder pointer-events-none" />
          </div>
        )}

        {/* Sort Dropdown */}
        {sortOptions.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center justify-between gap-2 px-3 py-2 border border-input rounded-lg text-sm bg-card text-foreground hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all w-full md:w-auto"
            >
              <span className="flex items-center gap-1">
                {queryParams.isDescending ? (
                  <ArrowDown className="w-4 h-4" />
                ) : (
                  <ArrowUp className="w-4 h-4" />
                )}
                {sortButtonLabel}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-placeholder transition-transform ${
                  showSortDropdown ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showSortDropdown && (
              <div className="absolute z-50 top-full right-0 mt-1 w-48 bg-card border border-border rounded-lg shadow-lg">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors border-b border-border last:border-b-0 ${
                      queryParams.sortBy === option.value
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {queryParams.sortBy === option.value && (
                        <span className="text-xs">
                          {queryParams.isDescending ? '↓' : '↑'}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom row: Page size + Results info */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between text-sm">
        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-muted-foreground">
            Show:
          </label>
          <select
            id="pageSize"
            value={queryParams.pageSize || 10}
            onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
            className="px-3 py-1.5 border border-input rounded text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span className="text-muted-foreground">per page</span>
        </div>

        {/* Results info */}
        {showResults && paginatedResult && (
          <div className="text-muted-foreground">
            {getPaginationInfo()}
          </div>
        )}

        {/* Active filters indicator */}
        {(queryParams.search || currentFilter !== 'all') && (
          <div className="flex items-center gap-1 text-primary-600 dark:text-primary-400 text-xs">
            <span className="px-2 py-1 bg-primary-50 dark:bg-primary-900/20 rounded">
              {queryParams.search ? `Search: "${queryParams.search}"` : ''}
              {queryParams.search && currentFilter !== 'all' && ' • '}
              {currentFilter !== 'all' ? `Filter: ${currentFilter}` : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
