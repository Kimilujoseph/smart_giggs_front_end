import React from 'react';
import { Filter, Plus } from 'lucide-react';

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
  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
    {/* Search Input */}
    <div className="w-full lg:w-1/3">
      <input
        type="text"
        placeholder="Search for specific product..."
        className="w-full px-4 py-2 rounded-lg border border-stroke bg-transparent text-black dark:text-white focus:border-primary"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSearchSubmit();
        }}
      />
    </div>

    {/* Action Buttons & Entries Selector */}
    <div className="flex items-center gap-4 w-full lg:w-auto">
      {/* Add Category */}
      <button
        onClick={onAddCategory}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke hover:bg-gray-2 dark:hover:bg-meta-4"
      >
        <Plus className="w-4 h-4" />
        <span>Add Category</span>
      </button>

      {/* Toggle Filters */}
      <button
        onClick={onToggleFilters}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke transition-colors ${
          showFilters
            ? 'bg-primary text-white border-primary'
            : 'hover:bg-gray-2 dark:hover:bg-meta-4'
        }`}
      >
        <Filter className="w-4 h-4" />
        <span>Filters</span>
      </button>

      {/* Entries per page */}
      <div className="flex items-center">
        <label className="text-sm text-black dark:text-white">Show&nbsp;</label>
        <select
          className="px-2 py-1 rounded-lg border border-stroke bg-transparent dark:bg-boxdark text-black dark:text-white focus:border-primary"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          {[5, 10, 20, 50].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
        <span className="text-sm text-black dark:text-white">&nbsp;entries</span>
      </div>
    </div>
  </div>
);

export default SearchAndControls;
