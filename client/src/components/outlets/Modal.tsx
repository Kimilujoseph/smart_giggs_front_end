import React, { useState } from 'react';
import { Shop } from '../../types/shop';
import ForwardTwoToneIcon from '@mui/icons-material/ForwardTwoTone';
import axios from 'axios';
import { X } from 'lucide-react';
import ClickOutside from '../ClickOutside';
import Message from '../alerts/Message';

interface ProductItem {
  transferId: any;
  id: React.Key;
  productID: {
    id: any;
    itemName: string;
    itemModel: string;
    minprice: string;
    maxprice: string;
  };
  stock?: {
    id: any;
    itemName: string;
    itemModel: string;
    minprice: string;
    maxprice: string;
  };
  quantity: number;
  status?: string;
  itemType?: 'phone' | 'accessory';
}

interface ModalProps {
  message: string;
  onClose: () => void;
  refreshShopData: () => void;
  shopData: Shop;
}

const Modal: React.FC<ModalProps> = ({ onClose, shopData, refreshShopData }) => {
  const [filter, setFilter] = useState<'phone' | 'accessory'>('phone');
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const handleFilterChange = (filterType: 'phone' | 'accessory') => {
    setFilter(filterType);
  };

  const handleApprove = async (item: any) => {
    try {
      const token = localStorage.getItem('tk');
      if (!token) return;

      const endpoint =
        filter === 'phone'
          ? `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/confirm/phone`
          : `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/confirm/accessory/`;

      const payload =
        filter === 'phone'
          ? {
            productId: item.mobileID,
            transferId: item.transferId,
            shopname: shopData.name,
          }
          : {
            id: item.id,
            productId: item.accessoryID,
            transferId: item.transferId,
            shopname: shopData.name,
            quantity: String(item.quantity),
          };

      const res = await axios.post(endpoint, payload, { withCredentials: true });

      if (res.status === 200) {
        setMessage({ text: 'Product approved successfully!', type: 'success' });
        refreshShopData();
      }
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to approve product',
        type: error.response?.status === 404 ? 'warning' : 'error',
      });
    }
  };

  const renderItems = () => {
    const items = filter === 'phone'
      ? shopData.pendingMobiles || []
      : shopData.pendingAccessories || [];
    //console.log("@@#@3434", items)
    return items.map((item: ProductItem | any, index: number) => {
      const details = filter === 'phone' ? item.mobiles : item.accessories;
      const category = details.categories;
      const imeiOrBatch = filter === 'phone' ? details.IMEI : details.batchNumber;

      return (
        <tr
          key={index}
          className="border-b border-[#eee] dark:border-strokedark w-full text-center *:p-2"
        >
          <td>{category.itemModel}</td>
          <td>{category.itemName}</td>
          <td>{imeiOrBatch}</td>
          <td>{filter === 'accessory' ? item.quantity : '-'}</td>
          <td>
            <span
              className={`${item.status === 'confirmed' ? 'bg-success/60' : 'bg-warning/60'
                } px-2 rounded-full text-center`}
            >
              {item.status}
            </span>
          </td>
          <td>
            <span className="text-danger">{category.minPrice}</span> /{' '}
            <span className="text-primary">{category.maxPrice}</span>
          </td>
          <td>
            <button
              className="px-2 text-sm tracking-wide text-black text-center dark:text-white flex items-center justify-center"
              onClick={() => handleApprove(item)}
            >
              <span className="bg-success px-2 rounded">Approve</span>
            </button>
          </td>
        </tr>
      )
    });
  };

  return (
    <div className="relative w-full overflow-y-auto md:w-3/4 xl:w-1/2 z-9999 bg-white dark:bg-boxdark shadow my-8 p-4 border border-bodydark1 dark:border-primary/40 rounded-lg">
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      <ClickOutside onClick={onClose}>
        <div className="absolute right-2 top-2 rounded-lg">
          <X
            onClick={onClose}
            className="cursor-pointer rounded-full hover:bg-red-500 hover:text-white p-1 w-8 h-8 transition-all duration-300 ease-in-out"
          />
        </div>
        <div className="mx-auto max-w-screen-lg overflow-y-auto">
          <div className="flex items-center space-x-4 mb-6">
            <ForwardTwoToneIcon className="text-success " fontSize="medium" />
            <button className="text-sm md:text-base lg:text-lg font-bold text-graydark dark:text-white">
              Incoming Stock Receiving
            </button>
          </div>
          <div className="flex items-center justify-between md:justify-start gap-2 mb-4 w-full">
            <button
              className={`w-full md:w-1/4 px-4 py-2 rounded outline-none ${filter === 'phone' ? 'bg-primary text-white' : 'bg-gray-300'
                }`}
              onClick={() => handleFilterChange('phone')}
            >
              Phones
            </button>
            <button
              className={`w-full md:w-1/4 px-4 py-2 rounded outline-none ${filter === 'accessory'
                ? 'bg-primary text-white'
                : 'bg-gray-300 dark:text-boxdark-2'
                }`}
              onClick={() => handleFilterChange('accessory')}
            >
              Accessories
            </button>
          </div>
          {!shopData?.pendingMobiles?.length &&
            !shopData?.pendingAccessories?.length ? (
            <div className="text-center text-base text-gray-500 dark:text-gray-400 flex items-center justify-center h-32">
              No new items yet.
            </div>
          ) : (
            <div className="flex flex-col items-end">
              <button
                onClick={() => {
                  const items = filter === 'phone'
                    ? shopData.pendingMobiles
                    : shopData.pendingAccessories;

                  items.forEach((item: any) => {
                    handleApprove(item);
                  });
                }}
                className="bg-primary/70 text-bold p-1 px-2 rounded-md text-boxdark-2 m-2"
              >
                Approve All
              </button>
              <table className="w-full">
                <thead className="bg-boxdark dark:bg-boxdark-2">
                  <tr className="text-center *:py-3">
                    <th>Model</th>
                    <th>Product</th>
                    <th>{filter === 'phone' ? 'IMEI' : 'Batch'}</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Price Range</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>{renderItems()}</tbody>
              </table>
            </div>
          )}
        </div>
      </ClickOutside>
    </div>
  );
};

export default Modal;