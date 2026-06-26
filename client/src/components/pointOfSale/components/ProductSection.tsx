import React from 'react';
import { Search } from 'lucide-react';
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
  searchTerm,
  setSearchTerm,
  selectedBrand,
  setSelectedBrand,
  brands,
  paginatedProducts,
  filteredProducts,
  currentPage,
  setCurrentPage,
  totalPages,
  isInCart,
  addToCart,
  formatPrice,
}) => {
  return (
    <div className="md:p-6 w-full mx-auto">
      {/* Header and Controls */}
      <div className="mb-6">
        <div className="flex gap-2 md:gap-4 mb-6 mx-auto pr-2">
          {/* Search */}
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 dark:bg-boxdark border border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Brand Filter */}
          <div className="w-auto md:min-w-[200px]">
            <select
              className="w-full p-2 dark:bg-boxdark border border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary/50"
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="">All Brands</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-gray-600 mb-4">
          Showing {paginatedProducts.length} of {filteredProducts.length} products
        </div>
      </div>

      {paginatedProducts.length === 0 ? (
        <SuchEmpty
          message="No products found"
          description="Try searching for a different product or brand"
          variant="emptyListing"
        />
      ) : (
        <>
          {/* Product List */}
          <div className="grid gap-4">
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

          {/* Products Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              <button
                className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
