import React, { useState } from 'react';
import {
  Smartphone,
  ChevronUp,
  ChevronDown,
  Package,
  ChevronLeft,
  ChevronRight,
  TriangleAlert,
  CheckCircle,
} from 'lucide-react';
import { ITEMS_PER_PAGE } from '../constants';

interface ProductItemCardProps {
  product: any;
  isInCart: (productId: number | string, itemId?: number) => boolean;
  addToCart: (category: any, item?: any) => void;
  formatPrice: (price: number) => string;
}

export const ProductItemCard: React.FC<ProductItemCardProps> = ({
  product,
  isInCart,
  addToCart,
  formatPrice,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemPage, setItemPage] = useState(1);

  const totalItems = product.items.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handlePrevPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemPage > 1) {
      setItemPage((prev) => prev - 1);
    }
  };

  const handleNextPage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (itemPage < totalPages) {
      setItemPage((prev) => prev + 1);
    }
  };

  const currentItems = product.items.slice(
    (itemPage - 1) * ITEMS_PER_PAGE,
    itemPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="overflow-hidden rounded-md">
      <div
        className="cursor-pointer bg-bodydark/50 p-3 dark:bg-boxdark text-black transition-all duration-500 rounded-lg shadow-sm border dark:border-slate-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex flex-col justify-start">
          <div className="w-full flex justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-bodydark/40 dark:bg-boxdark-2/40 p-2 rounded-lg">
                <Smartphone className="w-6 h-6 text-primary dark:text-blue-600" />
              </div>
              <div className="text-gray-500 dark:text-slate-200">
                <h2 className="md:text-xl font-semibold">
                  {product.categoryId.itemName}
                </h2>
                <h3 className="text-sm text-gray-500 dark:text-slate-400">
                  {product.stock.batchNumber}
                </h3>
                <p className="text-gray-500 dark:text-slate-400">
                  {product.categoryId.brand} - {product.categoryId.itemModel}
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-boxdark-2 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-boxdark-2 dark:text-gray-400" />
            )}
          </div>
          <div className="w-full flex justify-between items-center mt-4">
            <div className="text-right flex gap-2 text-xs md:text-base text-gray-600">
              <p className="hidden md:block text-gray-600 dark:text-slate-400">
                Price Range
              </p>
              <div className="font-medium text-slate-400">
                <span className="text-red-600 dark:text-red-400/70">
                  {formatPrice(product.categoryId.minPrice)}
                </span>{' '}
                /{' '}
                <span className="text-green-600 dark:text-green-400/70">
                  {Number(product.categoryId.maxPrice).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 dark:text-gray-400 md:text-lg">
              <Package className="w-5 h-5" />
              <span className="font-medium">{product.quantity}</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`bg-bodydark1 dark:bg-boxdark/60 p-2 transition-all duration-500 ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        {/* Items Pagination */}
        {totalItems > 0 && (
          <div className="flex justify-between items-center mb-4 text-gray-600 dark:text-slate-400">
            <p className="text-sm">
              Showing items {(itemPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
              {Math.min(itemPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}
            </p>
            <div className="flex gap-2 dark:text-slate-400">
              <button
                className="px-3 py-1 text-xs md:text-base border border-primary/40 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-500"
                disabled={itemPage === 1}
                onClick={handlePrevPage}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="px-3 py-1 text-xs md:text-base border border-primary/40 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-500"
                disabled={itemPage * ITEMS_PER_PAGE >= totalItems}
                onClick={handleNextPage}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Items List */}
        {totalItems === 0 ? (
          <div className="w-full h-12 flex justify-center items-center gap-4 text-yellow-500">
            <TriangleAlert />
            <span>This product is out of stock</span>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-3">
            {currentItems.map((item: any) => (
              <div
                key={item.id}
                onClick={() => addToCart(product.categoryId, item)}
                className={`relative cursor-pointer bg-bodydark/50 dark:bg-boxdark p-4 rounded-lg shadow-sm flex justify-between items-center border hover:scale-110 transition-transform duration-300 ${
                  isInCart(product.categoryId.id, item.id)
                    ? 'border-primary/70'
                    : 'dark:border-slate-700'
                }`}
              >
                {isInCart(product.categoryId.id, item.id) && (
                  <CheckCircle className="text-primary absolute top-2 right-2 h-4 w-4" />
                )}
                <div className="text-xs">
                  {product.categoryId.itemType === 'mobiles' ? (
                    <p className="font-medium text-black dark:text-slate-300">
                      IMEI: {item.IMEI}
                    </p>
                  ) : (
                    <div className="font-medium text-black dark:text-slate-300">
                      <p>Batch: {item.batchNumber}</p>
                      <p>Stock: {item.quantity}</p>
                    </div>
                  )}
                  <div className="text-sm dark:text-slate-400 mt-1">
                    {item.discount > 0 && (
                      <p className="text-green-600">
                        Discount: {formatPrice(item.discount)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
