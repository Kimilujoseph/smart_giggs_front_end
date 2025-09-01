import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Loader, AlertTriangle } from 'lucide-react';

const MobileHistoryModal = ({ isOpen, onClose, itemId }) => {
  const [transferHistory, setTransferHistory] = useState([]);
  const [itemHistory, setItemHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && itemId) {
      const fetchHistories = async () => {
        setLoading(true);
        setError('');
        setTransferHistory([]);
        setItemHistory([]);
        try {
          const transferRes = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/inventory/mobile/item/transferhistory/${itemId}`, { withCredentials: true });
          if (transferRes.data && !transferRes.data.error) {
            setTransferHistory(transferRes.data.message);
          }

          const itemRes = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/inventory/mobile/item/history/${itemId}`, { withCredentials: true });
          if (itemRes.data && !itemRes.data.error) {
            setItemHistory(itemRes.data.message);
          }
        } catch (err) {
          setError('Failed to fetch history. Please try again.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistories();
    }
  }, [isOpen, itemId]);

  if (!isOpen) return null;

  const renderTransferHistory = () => {
    if (transferHistory.length === 0) return <p className="text-sm text-gray-500">No transfer history found.</p>;
    return (
      <ul className="space-y-3">
        {transferHistory.map((record, index) => (
          <li key={index} className="text-sm p-2 border rounded dark:border-strokedark">
            From: <span className="font-semibold">{record.shops_mobiletransferHistory_fromshopToshops?.shopName || 'N/A'}</span><br/>
            To: <span className="font-semibold">{record.shops_mobiletransferHistory_toshopToshops?.shopName || 'N/A'}</span><br/>
            By: <span className="font-semibold">{record.actors_mobiletransferHistory_transferdByToactors?.name || 'N/A'}</span><br/>
            Confirmed by: <span className="font-semibold">{record.actors_mobiletransferHistory_confirmedByToactors?.name || 'N/A'}</span>
          </li>
        ))}
      </ul>
    );
  };

  const renderItemHistory = () => {
    if (itemHistory.length === 0) return <p className="text-sm text-gray-500">No item history found.</p>;
    return (
      <ul className="space-y-3">
        {itemHistory.map((record) => (
          <li key={record.id} className="text-sm p-2 border rounded dark:border-strokedark">
            Type: <span className="font-semibold">{record.type}</span><br/>
            Shop: <span className="font-semibold">{record.shops?.shopName} ({record.shops?.address})</span><br/>
            Added by: <span className="font-semibold">{record.actors_mobileHistory_addedByToactors?.name}</span><br/>
            Date: <span className="font-semibold">{new Date(record.createdAt).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-3xl mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Item History (ID: {itemId})</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-5" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : error ? (
          <div className="flex flex-col justify-center items-center h-48 text-red-500">
            <AlertTriangle size={32} />
            <p className="mt-2">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3 text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-strokedark">Transfer History</h4>
              {renderTransferHistory()}
            </div>
            <div className="border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 border-gray-200 dark:border-strokedark">
              <h4 className="font-bold mb-3 text-gray-700 dark:text-gray-300 border-b pb-2 dark:border-strokedark">Activity History</h4>
              {renderItemHistory()}
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MobileHistoryModal;
