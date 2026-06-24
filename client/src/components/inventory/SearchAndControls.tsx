import React from 'react';
import { Filter, Plus, Search, ChevronDown } from 'lucide-react';

interface SearchAndControlsProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  onAddCategory: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  itemsPerPage: number;
  onItemsPerPageChange: (limit: number) => void;
}

const SearchAndControls: React.FC<SearchAndControlsProps> = ({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onAddCategory,
  onToggleFilters,
  showFilters,
  itemsPerPage,
  onItemsPerPageChange,
}) => (
  <div className="flex flex-col gap-3 px-4 sm:gap-4">

    {/* ── Row 1: Search bar – full width on every screen ── */}
    <div className="relative w-full group">
      {/* Left search icon */}
      <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-bodydark2 group-focus-within:text-primary transition-colors duration-200">
        <Search className="w-4 h-4" />
      </span>

      <input
        type="text"
        id="inventory-search"
        placeholder="Search product, brand, category…"
        className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-stroke bg-white dark:bg-boxdark text-sm text-black dark:text-white placeholder-bodydark2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearchSubmit();
        }}
      />

      {/* Inline Search button nestled inside the input */}
      <button
        onClick={onSearchSubmit}
        aria-label="Run search"
        className="absolute inset-y-1 right-1 flex items-center gap-1.5 px-3 rounded-lg bg-primary hover:bg-opacity-90 text-white text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95"
      >
        <Search className="w-3 h-3" />
        <span className="hidden sm:inline">Search</span>
      </button>
    </div>

    {/* ── Row 2: Action buttons + entries selector ── */}
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">

      {/* Add Product Model */}
      <button
        id="add-product-model-btn"
        onClick={onAddCategory}
        className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary hover:to-blue-600 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 whitespace-nowrap"
      >
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/20">
          <Plus className="w-3.5 h-3.5" />
        </span>
        <span className="hidden xs:inline">Add Product Model</span>
        <span className="xs:hidden sm:hidden">Add</span>
      </button>

      {/* Toggle Filters */}
      <button
        id="toggle-filters-btn"
        onClick={onToggleFilters}
        className={`inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-semibold shadow-sm transition-all duration-200 active:scale-95 whitespace-nowrap ${
          showFilters
            ? 'bg-primary border-primary text-white shadow-md'
            : 'bg-white dark:bg-boxdark border-stroke dark:border-strokedark text-black dark:text-white hover:border-primary hover:text-primary dark:hover:border-primary dark:hover:text-primary'
        }`}
      >
        <Filter className="w-3.5 h-3.5 flex-shrink-0" />
        <span>Filters</span>
        {showFilters && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white/25 text-[10px] font-bold">
            ✓
          </span>
        )}
      </button>

      {/* Spacer – pushes entries selector to the far right on wider screens */}
      <div className="flex-1 hidden sm:block" />

      {/* Entries per page */}
      <div className="inline-flex items-center gap-2 ml-auto sm:ml-0">
        <span className="text-xs sm:text-sm text-bodydark2 dark:text-bodydark whitespace-nowrap">
          Show
        </span>
        <div className="relative">
          <select
            id="items-per-page-select"
            className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-stroke dark:border-strokedark bg-white dark:bg-boxdark text-xs sm:text-sm text-black dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 cursor-pointer"
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
          {/* Custom chevron icon */}
          <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-bodydark2">
            <ChevronDown className="w-3.5 h-3.5" />
          </span>
        </div>
        <span className="text-xs sm:text-sm text-bodydark2 dark:text-bodydark whitespace-nowrap">
          entries
        </span>
      </div>

    </div>
  </div>
);

export default SearchAndControls;
