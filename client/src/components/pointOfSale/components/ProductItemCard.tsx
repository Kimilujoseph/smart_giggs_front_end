import React, { useState } from 'react';
import {
  Smartphone, Package, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, CheckCircle, TriangleAlert,
} from 'lucide-react';
import { ITEMS_PER_PAGE } from '../constants';

interface ProductItemCardProps {
  product: any;
  isInCart: (productId: number | string, itemId?: number) => boolean;
  addToCart: (category: any, item?: any) => void;
  formatPrice: (price: number) => string;
}

export const ProductItemCard: React.FC<ProductItemCardProps> = ({ product, isInCart, addToCart, formatPrice }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [itemPage, setItemPage] = useState(1);

  const totalItems = product.items.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const currentItems = product.items.slice((itemPage - 1) * ITEMS_PER_PAGE, itemPage * ITEMS_PER_PAGE);
  const isMobile = product.categoryId.itemType === 'mobiles';

  const stop = (e: React.MouseEvent, fn: () => void) => { e.stopPropagation(); fn(); };

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 bg-white dark:bg-boxdark shadow-sm">
      {/* Header Row */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-boxdark-2/40 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isMobile ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
            {isMobile
              ? <Smartphone className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              : <Package className="w-5 h-5 text-amber-500 dark:text-amber-400" />}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{product.categoryId.itemName}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">{product.categoryId.brand} · {product.categoryId.itemModel}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-400 dark:text-slate-500">Price Range</p>
            <p className="text-sm font-medium">
              <span className="text-red-400">{formatPrice(product.categoryId.minPrice)}</span>
              <span className="text-slate-300 dark:text-slate-600 mx-1">—</span>
              <span className="text-green-500">{formatPrice(product.categoryId.maxPrice)}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Package className="w-4 h-4" />
            <span className="text-sm font-semibold">{product.quantity}</span>
          </div>
          {isExpanded
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Expandable Items */}
      {isExpanded && (
        <div className="border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/50 dark:bg-boxdark-2/30 p-3">
          {totalItems === 0 ? (
            <div className="flex items-center justify-center gap-2 py-4 text-amber-500 text-sm">
              <TriangleAlert className="w-4 h-4" />
              <span>Out of stock</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mb-3">
                {currentItems.map((item: any) => {
                  const inCart = isInCart(product.categoryId.id, item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => addToCart(product.categoryId, item)}
                      className={`relative cursor-pointer rounded-lg p-3 text-xs border transition-all hover:scale-[1.02] active:scale-[0.98] ${
                        inCart
                          ? 'border-primary/60 bg-primary/5 dark:bg-primary/10'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark hover:border-primary/40'
                      }`}
                    >
                      {inCart && <CheckCircle className="absolute top-2 right-2 w-3.5 h-3.5 text-primary" />}
                      {isMobile
                        ? <p className="font-mono text-slate-700 dark:text-slate-300 truncate">IMEI: {item.IMEI}</p>
                        : <>
                            <p className="text-slate-600 dark:text-slate-300">Batch: {item.batchNumber}</p>
                            <p className="text-slate-400 dark:text-slate-500">Qty: {item.quantity}</p>
                          </>}
                      {item.discount > 0 && (
                        <p className="text-green-500 mt-1">-{formatPrice(item.discount)}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{(itemPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(itemPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => stop(e, () => setItemPage(p => p - 1))}
                      disabled={itemPage === 1}
                      className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-boxdark-2"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => stop(e, () => setItemPage(p => p + 1))}
                      disabled={itemPage >= totalPages}
                      className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-boxdark-2"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
