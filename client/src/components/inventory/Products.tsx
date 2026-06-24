import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Product } from '../../types/product';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight, Eye, X, Filter, Edit, Trash2, Plus } from 'lucide-react';
import { createCategory, updateCategory } from '../../api/category_manager';
import CategoryModal from './CategoryModal';
import { useAppContext } from '../../context/AppContext';

interface ProductTableProps {
  getFreshUserData: () => void;
}

const ProductsTable: React.FC<ProductTableProps> = ({ getFreshUserData }) => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();
  const { user } = useAppContext();

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Product | null>(null);

  // Row Highlighting state
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  // URL state management
  const [searchParams, setSearchParams] = useSearchParams();

  // Derive pagination from URL search params
  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = Number(searchParams.get('limit')) || 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Derive active filters from URL search params
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    brand: searchParams.get('brand') || '',
    category: searchParams.get('category') || '',
    stockStatus: searchParams.get('stockStatus') || 'all',
    itemType: searchParams.get('itemType') || '',
  }), [searchParams]);

  // Local state for filter inputs (buffered for text fields to avoid lag)
  const [localFilters, setLocalFilters] = useState(filters);

  // Synchronize local filters when searchParams/filters change (e.g. on Reset)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Unique filter values derived from inventory
  const [uniqueValues, setUniqueValues] = useState({
    brands: new Set<string>(),
    categories: new Set<string>(),
    itemTypes: new Set<string>(),
  });

  // Helper page triggers updating the URL params
  const setCurrentPage = (pageVal: number | ((prev: number) => number)) => {
    const nextPage = typeof pageVal === 'function' ? pageVal(currentPage) : pageVal;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(nextPage));
    setSearchParams(newParams);
  };

  const setItemsPerPage = (limitVal: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', String(limitVal));
    newParams.set('page', '1'); // Reset to page 1 on limit change
    setSearchParams(newParams);
  };

  // Sync brand/category unique filter choices when inventory is loaded
  useEffect(() => {
    if (inventory.length > 0) {
      const brands = new Set(inventory.map(item => item.brand));
      const categories = new Set(inventory.map(item => item.category));
      const itemTypes = new Set(inventory.map(item => item.itemType));
      setUniqueValues({ brands, categories, itemTypes });
    }
  }, [inventory]);

  // API Call: Fetch Inventory List
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });

      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value);
        }
      });

      const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/category/all?${params.toString()}`, {
        withCredentials: true,
      });
      const { data, totalPages: newTotalPages, totalItems: newTotalItems } = res.data;
      const products = data.map((i: any) => ({ ...i, isMobile: true }));

      // Auto-correct page if current page exceeds the total page count after deletion/filter updates
      if (newTotalPages > 0 && currentPage > newTotalPages) {
        setCurrentPage(newTotalPages);
        return;
      }

      setInventory(products);
      setTotalPages(newTotalPages);
      setTotalItems(newTotalItems);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // API Call: Search Products (POST endpoint)
  const performSearch = async () => {
    try {
      setLoading(true);
      const requestBody = {
        category: filters.category || 'category',
        searchItem: filters.search,
      };
      const res = await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/search/products`, requestBody, {
        withCredentials: true,
      });
      const { data } = res.data;
      const products = data.map((i: any) => ({ ...i, isMobile: true }));
      setInventory(products);
      setTotalPages(1); // Search results are returned as a single list page
      setTotalItems(products.length);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Centralized Fetch trigger based on URL search query parameter configuration
  useEffect(() => {
    if (filters.search) {
      performSearch();
    } else {
      fetchInventory();
    }
  }, [currentPage, itemsPerPage, filters]);

  // Row selection preservation & highlighting on mount
  useEffect(() => {
    if (inventory.length > 0) {
      const lastId = sessionStorage.getItem('lastViewedProductId');
      if (lastId) {
        const idNum = Number(lastId);
        setHighlightedId(idNum);
        sessionStorage.removeItem('lastViewedProductId');

        // Scroll to highlighted row
        setTimeout(() => {
          const el = document.getElementById(`product-row-${idNum}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);

        // Clear row pulse styling after 3 seconds
        const timer = setTimeout(() => {
          setHighlightedId(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [inventory]);

  // Handle updates to specific filter keys
  const handleLocalFilterChange = (key: string, value: string, applyImmediately = false) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    if (applyImmediately) {
      const newParams = new URLSearchParams(searchParams);
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      newParams.set('page', '1'); // Go to page 1 on filter update
      setSearchParams(newParams);
    }
  };

  // Manual Trigger: Apply text fields (minPrice, maxPrice) to the URL
  const applyTextFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(localFilters).forEach(([key, value]) => {
      // Exclude text search because it is applied via Enter in the main search bar
      if (key === 'search') return;

      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category: Product) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await updateCategory(id, { status: 'DELETED' });
        // Refresh preserving active page
        if (filters.search) {
          performSearch();
        } else {
          fetchInventory();
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category.');
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleModalSave = async (categoryData: any) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await createCategory(categoryData);
      }
      // Reload matching active filters
      if (filters.search) {
        performSearch();
      } else {
        fetchInventory();
      }
      handleModalClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`Failed to save category: ${error.response.data.message}`);
      } else {
        alert('Failed to save category.');
      }
    }
  };

  const resetFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    newParams.set('limit', String(itemsPerPage));
    setSearchParams(newParams);
    setLocalFilters({
      search: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
      category: '',
      stockStatus: 'all',
      itemType: '',
    });
  };

  const FilterInput: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    options?: string[];
    type?: string;
  }> = ({ label, value, onChange, onKeyDown, options = [], type = 'text' }) => (
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
          onKeyDown={onKeyDown}
          className="px-3 py-2 rounded-lg border border-stroke bg-transparent text-black dark:text-white focus:border-primary"
        />
      )}
    </div>
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="space-y-4">
      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 px-4">
        <div className="w-full lg:w-1/3">
          <input
            type="text"
            placeholder="Search for specific product..."
            className="w-full px-4 py-2 rounded-lg border border-stroke bg-transparent text-black dark:text-white focus:border-primary"
            value={localFilters.search}
            onChange={(e) => handleLocalFilterChange('search', e.target.value, false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLocalFilterChange('search', localFilters.search, true);
              }
            }}
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke hover:bg-gray-2 dark:hover:bg-meta-4"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
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
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
            <div className="flex items-center gap-2">
              <button
                onClick={applyTextFilters}
                className="flex items-center px-4 py-1 text-sm rounded-lg bg-primary text-white hover:bg-opacity-90 transition"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg border border-stroke hover:bg-gray-2 dark:hover:bg-meta-4"
              >
                <X className="w-4 h-4" />
                Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <FilterInput
              label="Brand"
              value={localFilters.brand}
              onChange={(e: any) => handleLocalFilterChange('brand', e.target.value, true)}
              options={Array.from(uniqueValues.brands)}
            />

            <FilterInput
              label="Category"
              value={localFilters.category}
              onChange={(e: any) => handleLocalFilterChange('category', e.target.value, true)}
              options={Array.from(uniqueValues.categories)}
            />

            <FilterInput
              label="Item Type"
              value={localFilters.itemType}
              onChange={(e: any) => handleLocalFilterChange('itemType', e.target.value, true)}
              options={Array.from(uniqueValues.itemTypes)}
            />

            <FilterInput
              label="Stock Status"
              value={localFilters.stockStatus}
              onChange={(e: any) => handleLocalFilterChange('stockStatus', e.target.value, true)}
              options={['all', 'inStock', 'lowStock', 'outOfStock']}
            />

            <FilterInput
              label="Min Price"
              type="number"
              value={localFilters.minPrice}
              onChange={(e: any) => handleLocalFilterChange('minPrice', e.target.value, false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyTextFilters();
              }}
            />

            <FilterInput
              label="Max Price"
              type="number"
              value={localFilters.maxPrice}
              onChange={(e: any) => handleLocalFilterChange('maxPrice', e.target.value, false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') applyTextFilters();
              }}
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
                <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-4">
                    <div className="flex justify-center">
                      <CircularProgress size={32} />
                    </div>
                  </td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 text-center text-black dark:text-white">
                    No items found
                  </td>
                </tr>
              ) : (
                inventory.map((product: Product) => (
                  <tr
                    key={product.id}
                    id={`product-row-${product.id}`}
                    className={`border-b border-[#eee] dark:border-strokedark hover:bg-gray-1 dark:hover:bg-meta-4 transition-colors ${
                      highlightedId === product.id ? 'bg-yellow-100 dark:bg-yellow-950/40 animate-pulse' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <h5 className="font-medium text-black dark:text-white">{product.itemName}</h5>
                    </td>
                    <td className="py-3 px-4">
                      <p className={`text-black dark:text-white ${(product.availableStock) === 0 ? 'text-red-500' :
                        (product.availableStock) < 5 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                        {product.availableStock}
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
                      <p
                        className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${product.status === 'AVAILABLE'
                          ? 'bg-success text-success'
                          : product.status === 'DELETED'
                            ? 'bg-danger text-danger'
                            : product.status === 'SUSPENDED'
                              ? 'bg-warning text-warning'
                              : 'bg-primary text-primary'
                          }`}
                      >
                        {product.status}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3.5">
                        <button
                          onClick={() => {
                            sessionStorage.setItem('lastViewedProductId', String(product.id));
                            navigate(`/inventory/${product.id}/${product.isMobile}`);
                          }}
                          className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-meta-4"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5 text-primary" />
                        </button>
                        <button
                          onClick={() => handleEdit(product)}
                          className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-meta-4"
                          title="Edit Category"
                        >
                          <Edit className="w-5 h-5 text-yellow-500" />
                        </button>
                        {user?.role === 'superuser' && (
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 rounded-lg hover:bg-gray-2 dark:hover:bg-meta-4"
                            title="Delete Category"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && inventory.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
            <div className="text-sm text-black dark:text-white">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
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
                  .map((number, index, arr) => (
                    <React.Fragment key={number}>
                      {index > 0 && number > arr[index - 1] + 1 && (
                        <span className="px-2 py-1 text-black dark:text-white">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(number)}
                        className={`min-w-[32px] px-2 py-1 rounded-lg border border-stroke ${currentPage === number
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
      <CategoryModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleModalSave}
        category={editingCategory}
      />
    </div>
  );
};

export default ProductsTable;