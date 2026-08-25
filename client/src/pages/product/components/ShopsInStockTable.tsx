import React from 'react';
import { Store, ShoppingBag, ArrowRight } from 'lucide-react';
import { Shop } from '@/types/shop';

export interface Outlet {
  id?: string;
  shopName?: string;
  name?: string;
  location?: string;
  contact?: string;
  address?: string;
  availableStock?: number;
}

interface ShopsInStockTableProps {
  outlets: Outlet[];
  onNavigateOutlet: (shopName: string) => void;
}

const ShopsInStockTable: React.FC<ShopsInStockTableProps> = ({
  outlets,
  onNavigateOutlet,
}) => {
  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Shops in Stock
        </h2>
      </div>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    <span>Shop Name</span>
                  </div>
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  <span>Address</span>
                </th>
                <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {!outlets || outlets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                      <p className="text-base text-gray-500 dark:text-gray-400">
                        No shops are currently in stock
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                outlets.map((shop: Partial<Shop>) => (
                  <tr
                    key={shop.shopName}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {shop.shopName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {shop.address}
                    </td>
                    <td className="whitespace-nowrap px-6 py-2 text-sm">
                      <button
                        onClick={() => onNavigateOutlet(shop.shopName!)}
                        className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors duration-200"
                      >
                        View
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopsInStockTable;
