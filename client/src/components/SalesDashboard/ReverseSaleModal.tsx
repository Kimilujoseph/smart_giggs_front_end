import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sale } from '../../pages/Dashboard/SalesDashboard';

interface ReverseSaleModalProps {
  sale: Sale;
  onClose: () => void;
  onSuccess: () => void;
}

const ReverseSaleModal: React.FC<ReverseSaleModalProps> = ({ sale, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [refundAmount, setRefundAmount] = useState(0);
  const [restock, setRestock] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saleType, setSaleType] = useState('pos');

  useEffect(() => {
    setRefundAmount(sale.soldprice);
    setQuantity(sale.totalsoldunits);
    const category = sale.category.toLowerCase();
    if (category.includes('mobile') || category.includes('phone')) {
      setSaleType('mobile');
    } else if (category.includes('accessor')) { // accessory, accessories
      setSaleType('accessory');
    } else {
      setSaleType('pos'); // A sensible default
    }
  }, [sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      saleId: sale.saleId,
      saleType,
      reason,
      refundAmount: Number(refundAmount),
      restock,
      quantity: Number(quantity),
    };

    try {
      await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/returns/`, payload, { withCredentials: true });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reverse sale.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-md flex flex-col max-h-[90vh]">
        <h2 className="text-xl font-bold p-6 flex-shrink-0 border-b border-stroke dark:border-strokedark">Reverse Sale</h2>
        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden flex-grow">
            <div className="overflow-y-auto p-6">
                
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Reason</label>
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} required className="w-full p-2 border rounded dark:bg-boxdark" />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Quantity to Return</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} min="1" max={sale.totalsoldunits} required className="w-full p-2 border rounded dark:bg-boxdark" />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-sm font-medium">Refund Amount</label>
                  <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(Number(e.target.value))} required className="w-full p-2 border rounded dark:bg-boxdark" />
                </div>
                <div className="mb-4 flex items-center">
                  <input type="checkbox" checked={restock} onChange={(e) => setRestock(e.target.checked)} className="mr-2" />
                  <label>Restock Product</label>
                </div>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            </div>
            <div className="p-6 flex justify-end gap-4 flex-shrink-0 border-t border-stroke dark:border-strokedark">
                <button type="button" onClick={onClose} className="py-2 px-4 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                Cancel
                </button>
                <button type="submit" disabled={loading} className="py-2 px-4 rounded bg-primary text-white hover:bg-primary-dark disabled:bg-gray-400">
                {loading ? 'Reversing...' : 'Reverse Sale'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default ReverseSaleModal;
