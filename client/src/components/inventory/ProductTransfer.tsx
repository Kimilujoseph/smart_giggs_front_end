
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Shop } from '../../types/shop';
import { CheckCircle, X } from 'lucide-react';

const ProductTransfer = ({ currentUser, mobileItems, accessoryItems, refreshData }) => {
  const [shopName, setShopName] = useState('');
  const [selectedMobiles, setSelectedMobiles] = useState([]);
  const [selectedAccessories, setSelectedAccessories] = useState([]);
  const [outlets, setOutlets] = useState<Shop[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [transferCategory, setTransferCategory] = useState('mobiles');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);

  const fetchOutlets = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/all`,
        { withCredentials: true },
      );
      if (res.data) {
        const filteredOutlets = res.data.shops.filter(
          (shop: Shop) => shop.shopName !== currentUser?.assignedShop?.shopName
        );
        setOutlets(filteredOutlets);
      }
    } catch (err) {
      setError("Failed to fetch outlets.");
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchOutlets();
    }
  }, [currentUser, fetchOutlets]);

  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/searchproducts/${currentUser.assignedShop.shopName}?productName=${searchTerm}`,
        { withCredentials: true },
      );
      setSearchResults(response.data.products);
    } catch (error) {
      console.error("Failed to search products", error);
      setError("Failed to search products.");
    }
  };

  const toggleMobileSelection = (item) => {
    const productItemId = item.id; 
    const productId = item.mobileID;
    const transferId = item.transferId;

    const payload = { productId, productItemId, transferId };

    setSelectedMobiles(prev => 
      prev.find(i => i.productItemId === productItemId)
        ? prev.filter(i => i.productItemId !== productItemId)
        : [...prev, payload]
    );
  };

  const handleAccessoryQuantityChange = (item, quantity) => {
    const productItemId = item.id;
    const productId = item.accessoryID;
    const transferId = item.transferId;
    const newQuantity = Math.max(0, Math.min(item.quantity, quantity));
    
    const payload = { productId, productItemId, transferId, quantity: newQuantity };

    setSelectedAccessories(prev => {
      const existing = prev.find(i => i.productItemId === productItemId);
      if (newQuantity === 0) {
        return prev.filter(i => i.productItemId !== productItemId);
      }
      if (existing) {
        return prev.map(i => i.productItemId === productItemId ? { ...i, quantity: newQuantity } : i);
      } else {
        return [...prev, payload];
      }
    });
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    const selectedItems = transferCategory === 'mobiles' ? selectedMobiles : selectedAccessories;
    if (!shopName || selectedItems.length === 0) {
      setError('Please select a destination shop and at least one item.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/transfer/bulk-transfer`,
        {
          shopDetails: {
            mainShop: currentUser.assignedShop.shopName,
            distributedShop: shopName,
          },
          category: transferCategory,
          bulkDistribution: selectedItems,
        },
        { withCredentials: true },
      );

      const { successfulDistributions, failedDistributions, error, details } = response.data;

      if (error || failedDistributions > 0) {
        const errorReasons = details.map(d => d.reason).join(' ');
        setError(`Transfer failed: ${errorReasons}`);
        setMessage('');
      } else {
        setMessage(`Transfer successful! ${successfulDistributions} items transferred.`);
        setError('');
        setSelectedMobiles([]);
        setSelectedAccessories([]);
        if(refreshData) refreshData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during transfer.');
    } finally {
      setLoading(false);
    }
  };

  const itemsToDisplay = searchResults 
    ? (transferCategory === 'mobiles' ? searchResults.phoneItems : searchResults.stockItems)
    : (transferCategory === 'mobiles' ? mobileItems : accessoryItems);

  const renderItemList = (items, type) => {
    if (!items || !items.items || items.items.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 py-4">No {type} available for transfer.</p>;
    }

    return (
      <div className="max-h-96 overflow-y-auto">
        {items.items.map(item => {
          const details = type === 'mobiles' ? item.mobiles : item.accessories;
          const productItemId = item.id;
          const isSelected = type === 'mobiles' 
            ? selectedMobiles.some(i => i.productItemId === productItemId)
            : selectedAccessories.some(i => i.productItemId === productItemId);
          
          return (
            <div
              key={productItemId}
              onClick={() => type === 'mobiles' && toggleMobileSelection(item)}
              className={`p-3 border rounded-lg mb-2 cursor-pointer ${isSelected ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-strokedark'}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{details.categories.itemName} {details.categories.itemModel}</p>
                  <p className="text-sm text-gray-500">{type === 'mobiles' ? `IMEI: ${details.IMEI}` : `Batch: ${details.batchNumber}`}</p>
                </div>
                {type === 'mobiles' ? (
                  <CheckCircle className={`w-5 h-5 ${isSelected ? 'text-primary' : 'text-gray-300 dark:text-gray-600'}`} />
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      value={selectedAccessories.find(i => i.productItemId === productItemId)?.quantity || 0}
                      onChange={(e) => handleAccessoryQuantityChange(item, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border rounded-lg dark:bg-form-input dark:border-form-strokedark"
                    />
                    <span className="text-sm text-gray-500">/ {item.quantity}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
      <div className="p-4 bg-gray-50 dark:bg-meta-4 border-b dark:border-strokedark">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create a Transfer</h2>
      </div>
      
      <div className="p-4 flex justify-between items-center">
        <div className="flex space-x-1 rounded-lg bg-gray-200 dark:bg-meta-4 p-1">
          <button onClick={() => setTransferCategory('mobiles')} className={`px-4 py-2 text-sm font-medium rounded-md ${transferCategory === 'mobiles' ? 'bg-white dark:bg-boxdark text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Mobiles</button>
          <button onClick={() => setTransferCategory('accessories')} className={`px-4 py-2 text-sm font-medium rounded-md ${transferCategory === 'accessories' ? 'bg-white dark:bg-boxdark text-primary' : 'text-gray-600 dark:text-gray-300'}`}>Accessories</button>
        </div>
        <div className="flex items-center space-x-2">
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search..." className="p-2 border rounded-lg dark:bg-form-input dark:border-form-strokedark" />
          <button onClick={handleSearch} className="px-4 py-2 rounded-lg bg-primary text-white">Search</button>
        </div>
      </div>

      <form onSubmit={handleTransfer} className="p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Select Items to Transfer</h3>
          {renderItemList(itemsToDisplay, transferCategory)}
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Transfer to Shop
          </label>
          <select
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
            required
          >
            <option value="">Select a destination shop</option>
            {outlets.map((shop) => (
              <option key={shop.id} value={shop.shopName}>
                {shop.shopName} - {shop.address}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-500 text-sm">{message}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Transferring...' : 'Confirm Transfer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductTransfer;
