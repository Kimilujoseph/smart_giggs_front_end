import React from 'react';
import { X } from 'lucide-react';
import FilterInput from './FilterInput';

interface LocalFilters {
  search: string;
  minPrice: string;
  maxPrice: string;
  brand: string;
  category: string;
  stockStatus: string;
  itemType: string;
}

interface AdvancedFiltersProps {
  localFilters: LocalFilters;
  onFilterChange: (key: string, value: string, applyImmediately?: boolean) => void;
  onApply: () => void;
  onReset: () => void;
  brands: Set<string>;
  categories: Set<string>;
  itemTypes: Set<string>;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  localFilters,
  onFilterChange,
  onApply,
  onReset,
  brands,
  categories,
  itemTypes,
}) => (
  <div className="px-4 py-4 rounded-lg border border-stroke bg-white dark:bg-boxdark">
    {/* Header */}
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-black dark:text-white">Advanced Filters</h3>
      <div className="flex items-center gap-2">
        <button
          onClick={onApply}
          className="flex items-center px-4 py-1 text-sm rounded-lg bg-primary text-white hover:bg-opacity-90 transition"
        >
          Apply
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg border border-stroke hover:bg-gray-2 dark:hover:bg-meta-4"
        >
          <X className="w-4 h-4" />
          Reset
        </button>
      </div>
    </div>

    {/* Filter Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <FilterInput
        label="Brand"
        value={localFilters.brand}
        onChange={(e) => onFilterChange('brand', e.target.value, true)}
        options={Array.from(brands)}
      />

      <FilterInput
        label="Category"
        value={localFilters.category}
        onChange={(e) => onFilterChange('category', e.target.value, true)}
        options={Array.from(categories)}
      />

      <FilterInput
        label="Item Type"
        value={localFilters.itemType}
        onChange={(e) => onFilterChange('itemType', e.target.value, true)}
        options={Array.from(itemTypes)}
      />

      <FilterInput
        label="Stock Status"
        value={localFilters.stockStatus}
        onChange={(e) => onFilterChange('stockStatus', e.target.value, true)}
        options={['all', 'inStock', 'lowStock', 'outOfStock']}
      />

      <FilterInput
        label="Min Price"
        type="number"
        value={localFilters.minPrice}
        onChange={(e) => onFilterChange('minPrice', e.target.value, false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onApply();
        }}
      />

      <FilterInput
        label="Max Price"
        type="number"
        value={localFilters.maxPrice}
        onChange={(e) => onFilterChange('maxPrice', e.target.value, false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onApply();
        }}
      />
    </div>
  </div>
);

export default AdvancedFilters;
