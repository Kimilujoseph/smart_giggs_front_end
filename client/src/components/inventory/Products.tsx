import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../../types/product';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight, Eye, X, Filter } from 'lucide-react';

interface ProductTableProps {
  getFreshUserData: () => void;
}

const ProductsTable: React.FC<ProductTableProps> = ({ getFreshUserData }) => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
    category: '',
    stockStatus: 'all', // 'all', 'inStock', 'lowStock', 'outOfStock'
    itemType: '',
  });

  // Unique values for filters
  const [uniqueValues, setUniqueValues] = useState({
    brands: new Set<string>(),
    categories: new Set<string>(),
    itemTypes: new Set<string>(),
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    if (inventory.length > 0) {
      const brands = new Set(inventory.map(item => item.brand));
      const categories = new Set(inventory.map(item => item.category));
      const itemTypes = new Set(inventory.map(item => item.itemType));
      setUniqueValues({ brands, categories, itemTypes });
    }
  }, [inventory]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/category/all`, {
        withCredentials: true,
      });
      const products = res.data.data.map((i: any) => ({ ...i, isMobile: true }));
      setInventory(products);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'outOfStock';
    if (stock < 5) return 'lowStock';
    return 'inStock';
  };

  const filterProducts = () => {
    return inventory.filter(product => {
      const searchMatch = product.itemName?.toLowerCase().includes(filters.search.toLowerCase());
      const minPriceMatch = !filters.minPrice || product.minPrice >= Number(filters.minPrice);
      const maxPriceMatch = !filters.maxPrice || product.maxPrice <= Number(filters.maxPrice);
      const brandMatch = !filters.brand || product.brand === filters.brand;
      const categoryMatch = !filters.category || product.category === filters.category;
      const itemTypeMatch = !filters.itemType || product.itemType === filters.itemType;
      const stockMatch = filters.stockStatus === 'all' || 
        (filters.stockStatus === getStockStatus(product.Items?.length || 0));

      return searchMatch && minPriceMatch && maxPriceMatch && brandMatch && 
             categoryMatch && itemTypeMatch && stockMatch;
    });
  };

  const filteredProducts = filterProducts();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const resetFilters = () => {
    setFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      category: '',
      stockStatus: 'all',
      itemType: '',
    });
    setCurrentPage(1);
  };

  const FilterInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    options?: string[];
    type?: string;
  }> = ({ label, value, onChange, options = [], type = 'text' }) => (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-black dark:text-white">{label}</label>
      {options.length > 0 ? (
        <select
          value={value}
          onChange={onChange}
          className="px-3 py-2 rounded-lg border border-stroke bg-transparent dark:bg-boxdark text-black dark:text-white focus:border-primary"
        >
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="px-3 py-2 rounded-lg border border-stroke bg-transparent text-black dark:text-white focus:border-primary"
        />
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
        <div className="w-full lg:w-1/3">
          <input
            type="text"
            placeholder="Search for specific product..."
            className="w-full px-4 py-2 rounded-lg border border-stroke bg-transparent text-black dark:text-white focus:border-primary"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke hover:bg-gray-2 dark:hover:bg-meta-4"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          
          <div className="flex items-center">
            <label className="text-sm text-black dark:text-white">Show&nbsp;</label>
            <select
              className="px-2 py-1 rounded-lg border border-stroke bg-transparent dark:bg-boxdark text-black dark:text-white focus:border-primary"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[5, 10, 20, 50].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
            <span className="text-sm text-black dark:text-white">&nbsp;entries</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="px-4 py-4 rounded-lg border border-stroke bg-white dark:bg-boxdark">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Advanced Filters</h3>
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg border border-stroke hover:bg-gray-2 dark:hover:bg-meta-4"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <FilterInput
              label="Brand"
              value={filters.brand}
              onChange={(e: any) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              options={Array.from(uniqueValues.brands)}
            />
            
            <FilterInput
              label="Category"
              value={filters.category}
              onChange={(e: any) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              options={Array.from(uniqueValues.categories)}
            />
            
            <FilterInput
              label="Item Type"
              value={filters.itemType}
              onChange={(e: any) => setFilters(prev => ({ ...prev, itemType: e.target.value }))}
              options={Array.from(uniqueValues.itemTypes)}
            />
            
            <FilterInput
              label="Stock Status"
              value={filters.stockStatus}
              onChange={(e: any) => setFilters(prev => ({ ...prev, stockStatus: e.target.value }))}
              options={['all', 'inStock', 'lowStock', 'outOfStock']}
            />
            
            <FilterInput
              label="Min Price"
              type="number"
              value={filters.minPrice}
              onChange={(e: any) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
            />
            
            <FilterInput
              label="Max Price"
              type="number"
              value={filters.maxPrice}
              onChange={(e: any) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">Item Name</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Available Stock</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Min Price</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Max Price</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Category</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Brand</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-4">
                    <div className="flex justify-center">
                      <CircularProgress size={32} />
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-black dark:text-white">
                    No items found
                  </td>
                </tr>
              ) : (
                currentItems.map((product: any) => (
                  <tr key={product.id} className="border-b border-[#eee] dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4">
                    <td className="py-3 px-4">
                      <h5 className="font-medium text-black dark:text-white">{product.itemName}</h5>
                    </td>
                    <td className="py-3 px-4">
                      <p className={`text-black dark:text-white ${
                        (product.Items?.length || 0) === 0 ? 'text-red-500' :
                        (product.Items?.length || 0) < 5 ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {product.Items?.length || 0}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-black dark:text-white">{product.minPrice}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-black dark:text-white">{product.maxPrice}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-black dark:text-white">{product.category}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-black dark:text-white">{product.brand}</p>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => navigate(`/inventory/${product.id}/${product.isMobile}`)}
                        className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-meta-4"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5 text-primary dark:text-white" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && currentItems.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
            <div className="text-sm text-black dark:text-white">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-stroke enabled:hover:bg-gray-2 enabled:dark:hover:bg-meta-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(num => num === 1 || num === totalPages || (num >= currentPage - 1 && num <= currentPage + 1))
                  .map((number) => (
                    <React.Fragment key={number}>
                      {number !== 1 && number !== currentPage - 1 && number > 2 && (
                        <span className="px-2 py-1 text-black dark:text-white">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(number)}
                        className={`min-w-[32px] px-2 py-1 rounded-lg border border-stroke ${
                          currentPage === number
                            ? 'bg-primary text-white'
                            : 'hover:bg-gray-2 dark:hover:bg-meta-4'
                        }`}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-stroke enabled:hover:bg-gray-2 enabled:dark:hover:bg-meta-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5 text-black dark:text-white" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsTable;