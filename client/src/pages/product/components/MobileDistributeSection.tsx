import React, { useState, useEffect } from 'react';
import { Shuffle, List, CheckCircle, Search } from 'lucide-react';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { DecodedToken } from '@/types/decodedToken';

interface SelectedItem {
  stockId: string;
  category: string;
  quantity: number;
}

interface MobileDistributeSectionProps {
  user: DecodedToken;
  shopName: string;
  setShopName: (val: string) => void;
  quantity: number;
  setQuantity: (val: number) => void;
  outletListings: Partial<Shop>[];
  selectionMode: 'random' | 'manual';
  setSelectionMode: (mode: 'random' | 'manual') => void;
  product: Product | null;
  selectedItems: SelectedItem[];
  toggleItemSelection: (item: any) => void;
  distributeError: string;
  distributing: boolean;
  handleDistribute: (e: React.FormEvent) => void;
}

const MobileDistributeSection: React.FC<MobileDistributeSectionProps> = ({
  user,
  shopName,
  setShopName,
  quantity,
  setQuantity,
  outletListings,
  selectionMode,
  setSelectionMode,
  product,
  selectedItems,
  toggleItemSelection,
  distributeError,
  distributing,
  handleDistribute,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const availableItems = (product?.Items || []).filter(
    (available: any) =>
      available.stockStatus?.toLowerCase() === 'available' ||
      available.stockStatus?.toLowerCase() === 'ok' ||
      available.stockStatus?.toLowerCase() === 'distributed',
  );

  const filteredItems = availableItems
    .filter((item: any) => {
      const q = searchQuery.toLowerCase();
      if (!q) return true;
      return (
        item.IMEI?.toLowerCase().includes(q) ||
        item.serialNumber?.toLowerCase().includes(q) ||
        item.batchNumber?.toLowerCase().includes(q) ||
        item.ModelName?.toLowerCase().includes(q) ||
        item.modelName?.toLowerCase().includes(q) ||
        item.color?.toLowerCase().includes(q) ||
        item.id?.toString().includes(q)
      );
    })
    .sort((a: any, _b: any) =>
      selectedItems.some((i) => i.stockId === a.id) ? -1 : 1,
    );

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
      <div className="p-4 bg-gray-50 dark:bg-meta-4 border-b dark:border-strokedark">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {user.role === 'manager' ? 'Distribute Product' : 'Transfer Product'}
        </h2>
      </div>

      <form onSubmit={handleDistribute} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Shop
            </label>
            <select
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
            >
              <option value="">Select a shop</option>
              {outletListings.map((shop: Partial<Shop>) => (
                <option key={shop.id} value={shop.shopName}>
                  {shop.shopName} -- {shop.address}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </label>
            <input
              min={1}
              type="number"
              max={product?.Items?.length}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
            />
          </div>
        </div>

        <div className="flex space-x-4 items-center">
          <button
            type="button"
            onClick={() => setSelectionMode('random')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectionMode === 'random'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-meta-4 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Random Selection
          </button>
          <button
            type="button"
            onClick={() => setSelectionMode('manual')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectionMode === 'manual'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-meta-4 text-gray-700 dark:text-gray-300'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            Manual Selection
          </button>
        </div>

        {quantity > 0 && (
          <div className="mt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Selected Items ({selectedItems.length}/{quantity})
              </h3>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Model Name, IMEI, Batch Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              {paginatedItems.length === 0 ? (
                <p className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No items found
                </p>
              ) : (
                paginatedItems.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      selectionMode === 'manual' && toggleItemSelection(item)
                    }
                    className={`p-3 border rounded-lg mb-2 cursor-pointer transition-all ${
                      selectedItems.some((i) => i.stockId === item.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-strokedark'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.IMEI || item.serialNumber
                            ? `${item.IMEI || item.serialNumber} - `
                            : ''}
                          {item.ModelName || item.modelName
                            ? `${item.ModelName || item.modelName} - `
                            : ''}
                          {item.batchNumber} (Sold: {item.soldUnits ?? item.soldunit ?? 0})
                        </span>
                        {product?.category === 'mobiles' && item.isConsignment && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider">
                              CONSIGNMENT
                            </span>
                            {item.Financer && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                ({item.Financer.name})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <CheckCircle
                        className={`w-5 h-5 ${
                          selectedItems.some((i) => i.stockId === item.id)
                            ? 'text-primary'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {filteredItems.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-3 px-3 py-2 bg-gray-50 dark:bg-meta-4 rounded-lg border border-gray-200 dark:border-strokedark text-xs">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <span>
                    Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredItems.length)} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length}
                  </span>
                  <div className="flex items-center gap-1 ml-2">
                    <label>Per page:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-1.5 py-0.5 border rounded dark:bg-form-input dark:border-form-strokedark dark:text-white"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1 border rounded hover:bg-gray-100 dark:hover:bg-boxdark disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:text-white"
                  >
                    Prev
                  </button>
                  <span className="px-2 font-medium text-gray-700 dark:text-gray-300">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1 border rounded hover:bg-gray-100 dark:hover:bg-boxdark disabled:opacity-50 disabled:cursor-not-allowed dark:border-strokedark dark:text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {distributeError && (
          <div className="text-red-500 text-sm mt-2">{distributeError}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={distributing || selectedItems.length !== quantity}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {distributing
              ? 'Processing...'
              : user.role === 'manager'
              ? 'Distribute'
              : 'Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MobileDistributeSection;
