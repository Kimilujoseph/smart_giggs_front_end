import React from 'react';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import SuchEmpty from '../../suchEmpty';
import { ProductItemCard } from './ProductItemCard';

interface ProductSectionProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  brands: string[];
  paginatedProducts: any[];
  filteredProducts: any[];
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  isInCart: (productId: number | string, itemId?: number) => boolean;
  addToCart: (category: any, item?: any) => void;
  formatPrice: (price: number) => string;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  searchTerm, setSearchTerm, selectedBrand, setSelectedBrand, brands,
  paginatedProducts, filteredProducts, currentPage, setCurrentPage,
  totalPages, isInCart, addToCart, formatPrice,
}) => (
  <div className="w-full max-w-3xl mx-auto px-2 pb-10">
    {/* Search & Filter Bar */}
    <div className="flex gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, brand, model or IMEI…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark outline-none focus:ring-2 focus:ring-primary/30 transition text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
      </div>

      <div className="relative">
        <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark outline-none focus:ring-2 focus:ring-primary/30 transition text-slate-800 dark:text-slate-200 appearance-none cursor-pointer"
        >
          <option value="">All Brands</option>
          {brands.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>
    </div>

    {/* Count */}
    <p className="text-xs text-slate-400 dark:text-slate-500 mb-3 px-1">
      {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
      {selectedBrand && ` · ${selectedBrand}`}
    </p>

    {/* Product List */}
    {paginatedProducts.length === 0 ? (
      <SuchEmpty
        message="No products found"
        description="Try adjusting your search or brand filter"
        variant="emptyListing"
      />
    ) : (
      <>
        <div className="flex flex-col gap-3">
          {paginatedProducts.map((product: any) => (
            <ProductItemCard
              key={product.categoryId.id}
              product={product}
              isInCart={isInCart}
              addToCart={addToCart}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 text-sm text-slate-500 dark:text-slate-400">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-boxdark-2 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-boxdark-2 disabled:opacity-30 disabled:cursor-not-allowed transition text-xs"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </>
    )}
  </div>
);
