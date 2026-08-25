import React, { useState, useEffect } from 'react';
import { Shuffle, List, X, Search } from 'lucide-react';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { DecodedToken } from '@/types/decodedToken';

interface SelectedItem {
  stockId: string;
  category: string;
  quantity: number;
}

interface AccessoriesDistributeSectionProps {
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
  handleQuantityChange: (stockId: string, newQuantity: number) => void;
  openHistories: Record<string, boolean>;
  toggleHistory: (batchId: string) => void;
  distributeError: string;
  distributing: boolean;
  handleDistribute: (e: React.FormEvent) => void;
}

const AccessoriesDistributeSection: React.FC<AccessoriesDistributeSectionProps> = ({
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
  handleQuantityChange,
  openHistories,
  toggleHistory,
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
    (item: any) => (item.availableStock || 0) > 0,
  );

  const filteredItems = availableItems.filter((item: any) => {
    const q = searchQuery.toLowerCase();
    if (!q) return true;
    return (
      item.batchNumber?.toLowerCase().includes(q) ||
      item.serialNumber?.toLowerCase().includes(q) ||
      item.ModelName?.toLowerCase().includes(q) ||
      item.modelName?.toLowerCase().includes(q) ||
      item.color?.toLowerCase().includes(q) ||
      item.id?.toString().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
      <div className="p-4 bg-gray-50 dark:bg-meta-4 border-b dark:border-strokedark">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {user.role === 'manager'
            ? 'Distribute Accessories'
            : 'Transfer Accessories'}
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
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Selected Items (
              {selectedItems.reduce((sum, item) => sum + item.quantity, 0)}/
              {quantity})
            </h3>

            {/* Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Model Name, Batch Number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
              />
            </div>

            <div className="max-h-72 overflow-y-auto">
              {paginatedItems.length === 0 ? (
                <p className="p-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                  No items found
                </p>
              ) : (
                paginatedItems.map((item: any) => {
                  const selectedItem = selectedItems.find(
                    (i) => i.stockId === item.id,
                  );
                  const isSelected = !!selectedItem;
                  return (
                    <div
                      key={item.id}
                      className={`border rounded-lg mb-2 transition-all duration-300 ${
                        isSelected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-strokedark'
                      }`}
                    >
                      <div
                        onClick={() =>
                          selectionMode === 'manual' && toggleItemSelection(item)
                        }
                        className="p-3 cursor-pointer flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {item.ModelName || item.modelName
                            ? `${item.ModelName || item.modelName} - `
                            : ''}
                          Batch: {item.batchNumber || item.serialNumber} - Stock:{' '}
                          {item.availableStock} (Sold: {item.soldUnits ?? item.soldunit ?? 0})
                        </span>
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={selectedItem.quantity}
                                min={1}
                                max={item.availableStock}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleQuantityChange(
                                    item.id,
                                    parseInt(e.target.value),
                                  );
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-20 px-2 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItemSelection(item);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                          {user.role !== 'seller' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleHistory(item.id);
                              }}
                              className="p-1 text-gray-500 hover:text-primary"
                            >
                              <List className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      {user.role !== 'seller' && openHistories[item.id] && (
                        <div className="px-3 pb-3 mt-2 border-t border-gray-200 dark:border-strokedark">
                          <h4 className="text-sm font-semibold my-2 text-gray-800 dark:text-white">
                            Distribution History
                          </h4>
                          {item.accessoryItems &&
                          item.accessoryItems.length > 0 ? (
                            <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                              {item.accessoryItems.map(
                                (dist: any, index: number) => (
                                  <li
                                    key={index}
                                    className="flex justify-between"
                                  >
                                    <span>
                                      {dist.quantity} units to{' '}
                                      <strong>{dist.shops.shopName}</strong>
                                    </span>
                                    <span className="text-gray-500">
                                      {new Date(
                                        dist.createdAt,
                                      ).toLocaleDateString()}{' '}
                                      - {dist.status}
                                    </span>
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              No distribution history for this batch.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
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
            disabled={
              distributing ||
              selectedItems.reduce((sum, item) => sum + item.quantity, 0) !==
                quantity
            }
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

export default AccessoriesDistributeSection;
