import React from 'react';
import { ConsolidatedData } from '../types/ConsolidatedData';

interface ShopHeaderProps {
  shopInfo: ConsolidatedData['shopInfo'];
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ shopInfo }) => {
  return (
    <div className="mb-6 p-4 bg-bodydark1 dark:bg-boxdark rounded-lg">
      <h1 className="text-xl font-bold text-black dark:text-slate-200">
        {shopInfo.name}
      </h1>
      <p className="text-gray-600 dark:text-slate-400">
        {shopInfo.address}
      </p>
      {shopInfo.seller && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Seller: {shopInfo.seller.name} ({shopInfo.seller.phone})
          </p>
        </div>
      )}
    </div>
  );
};
