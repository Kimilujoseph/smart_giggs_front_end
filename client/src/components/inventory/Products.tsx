import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Product } from '../../types/product';
import axios from 'axios';
import { createCategory, updateCategory } from '../../api/category_manager';
import CategoryModal from './CategoryModal';
import { useAppContext } from '../../context/AppContext';

// Sub-components
import SearchAndControls from './SearchAndControls';
import AdvancedFilters from './AdvancedFilters';
import ProductsTableContent from './ProductsTableContent';
import Pagination from './Pagination';

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

  // Row highlight state (restored from sessionStorage after navigation)
  const [highlightedId, setHighlightedId] = useState<number | null>(null);

  // ── URL-driven state ──────────────────────────────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();

  const currentPage = Number(searchParams.get('page')) || 1;
  const itemsPerPage = Number(searchParams.get('limit')) || 10;
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const filters = useMemo(
    () => ({
      search: searchParams.get('search') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      brand: searchParams.get('brand') || '',
      category: searchParams.get('category') || '',
      stockStatus: searchParams.get('stockStatus') || 'all',
      itemType: searchParams.get('itemType') || '',
    }),
    [searchParams],
  );

  // Buffered local filter state (avoids lag on text input)
  const [localFilters, setLocalFilters] = useState(filters);

  // Keep local filters in sync when URL params change (e.g. on Reset)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Unique dropdown options derived from current inventory page
  const [uniqueValues, setUniqueValues] = useState({
    brands: new Set<string>(),
    categories: new Set<string>(),
    itemTypes: new Set<string>(),
  });

  // ── URL helpers ───────────────────────────────────────────────────────────
  const setCurrentPage = (pageVal: number | ((prev: number) => number)) => {
    const nextPage = typeof pageVal === 'function' ? pageVal(currentPage) : pageVal;
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(nextPage));
    setSearchParams(newParams);
  };

  const setItemsPerPage = (limitVal: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('limit', String(limitVal));
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // ── Derive dropdown options from inventory ────────────────────────────────
  useEffect(() => {
    if (inventory.length > 0) {
      setUniqueValues({
        brands: new Set(inventory.map((item) => item.brand)),
        categories: new Set(inventory.map((item) => item.category)),
        itemTypes: new Set(inventory.map((item) => item.itemType ?? '')),
      });
    }
  }, [inventory]);

  // ── API calls ─────────────────────────────────────────────────────────────
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(itemsPerPage),
      });
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value);
      });

      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/category/all?${params.toString()}`,
        { withCredentials: true },
      );
      const { data, totalPages: newTotalPages, totalItems: newTotalItems } = res.data;
      const products: Product[] = data.map((i: any) => ({ ...i, isMobile: true }));

      // Auto-correct page if it exceeds total after deletion/filter change
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

  const performSearch = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/search/products`,
        { category: filters.category || 'category', searchItem: filters.search },
        { withCredentials: true },
      );
      const { data } = res.data;
      const products: Product[] = data.map((i: any) => ({ ...i, isMobile: true }));
      setInventory(products);
      setTotalPages(1);
      setTotalItems(products.length);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Central fetch trigger driven by URL params
  useEffect(() => {
    if (filters.search) {
      performSearch();
    } else {
      fetchInventory();
    }
  }, [currentPage, itemsPerPage, filters]);

  // Restore & highlight last-viewed row after back-navigation
  useEffect(() => {
    if (inventory.length > 0) {
      const lastId = sessionStorage.getItem('lastViewedProductId');
      if (lastId) {
        const idNum = Number(lastId);
        setHighlightedId(idNum);
        sessionStorage.removeItem('lastViewedProductId');

        setTimeout(() => {
          document.getElementById(`product-row-${idNum}`)?.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 150);

        const timer = setTimeout(() => setHighlightedId(null), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [inventory]);

  // ── Filter handlers ───────────────────────────────────────────────────────
  const handleLocalFilterChange = (key: string, value: string, applyImmediately = false) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
    if (applyImmediately) {
      const newParams = new URLSearchParams(searchParams);
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
  };

  const applyTextFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(localFilters).forEach(([key, value]) => {
      if (key === 'search') return; // Search is applied via Enter in SearchAndControls
      if (value && value !== 'all') {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    newParams.set('page', '1');
    setSearchParams(newParams);
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

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleAdd = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const handleEdit = (category: Product) => {
    setEditingCategory(category);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await updateCategory(id, { status: 'DELETED' });
      filters.search ? performSearch() : fetchInventory();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category.');
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
      filters.search ? performSearch() : fetchInventory();
      handleModalClose();
    } catch (error: any) {
      console.error('Error saving category:', error);
      const message = error?.response?.data?.message;
      alert(message ? `Failed to save category: ${message}` : 'Failed to save category.');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* 1. Search Bar & Controls */}
      <SearchAndControls
        searchValue={localFilters.search}
        onSearchChange={(val) => handleLocalFilterChange('search', val, false)}
        onSearchSubmit={() => handleLocalFilterChange('search', localFilters.search, true)}
        onAddCategory={handleAdd}
        onToggleFilters={() => setShowFilters((prev) => !prev)}
        showFilters={showFilters}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* 2. Collapsible Advanced Filters */}
      {showFilters && (
        <AdvancedFilters
          localFilters={localFilters}
          onFilterChange={handleLocalFilterChange}
          onApply={applyTextFilters}
          onReset={resetFilters}
          brands={uniqueValues.brands}
          categories={uniqueValues.categories}
          itemTypes={uniqueValues.itemTypes}
        />
      )}

      {/* 3. Table + Pagination */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <ProductsTableContent
          loading={loading}
          inventory={inventory}
          highlightedId={highlightedId}
          onViewDetails={(product) => {
            sessionStorage.setItem('lastViewedProductId', String(product.id));
            navigate(`/inventory/${product.id}/${product.isMobile}`);
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          userRole={user?.role}
        />

        {/* 4. Footer Pagination */}
        {!loading && inventory.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Category Add/Edit Modal */}
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