import React, { useState } from 'react';
import { payCommission } from '../../api/sales_dashboard_manager';

interface PayCommissionModalProps {
  sale: any;
  onClose: () => void;
  onSuccess: () => void;
}

const PayCommissionModal: React.FC<PayCommissionModalProps> = ({ sale, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amountPaid, setAmountPaid] = useState<number>(sale.commission - sale.commissionpaid);

  const handlePayCommission = async () => {
    setLoading(true);
    setError(null);

    const commissionData = {
      sellerId: sale._id.sellerId,
      amountPaid: amountPaid,
      paymentDate: new Date().toISOString(),
      // TODO: These dates should be handled properly based on the commission period
      periodStartDate: new Date().toISOString(), 
      periodEndDate: new Date().toISOString(),
      salesIds: [
        {
          salesId: sale.saleId,
          type: sale.category.toLowerCase() === 'mobiles' ? 'mobile' : 'accessory'
        }
      ]
    };

    try {
      await payCommission(commissionData);
      onSuccess();
    } catch (error) {
      setError('Failed to pay commission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white dark:bg-boxdark p-6 rounded-lg shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Pay Commission</h2>
        <div className="mb-4 text-black dark:text-white">
          <p><strong>Product:</strong> {sale.productname}</p>
          <p><strong>Seller:</strong> {sale.sellername}</p>
          <p><strong>Total Commission:</strong> ${sale.commission.toLocaleString()}</p>
          <p><strong>Commission Paid:</strong> ${sale.commissionpaid.toLocaleString()}</p>
          <p><strong>Remaining Commission:</strong> ${(sale.commission - sale.commissionpaid).toLocaleString()}</p>
        </div>
        <div className="mb-4">
          <label htmlFor="amountPaid" className="block text-sm font-medium text-black dark:text-white">Amount to Pay</label>
          <input 
            type="number"
            id="amountPaid"
            value={amountPaid}
            onChange={(e) => setAmountPaid(Number(e.target.value))}
            max={sale.commission - sale.commissionpaid}
            min={0}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-strokedark shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-transparent dark:text-white"
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-500 text-black dark:text-white">Cancel</button>
          <button onClick={handlePayCommission} className="px-4 py-2 rounded-md bg-primary text-white" disabled={loading || amountPaid <= 0 || amountPaid > (sale.commission - sale.commissionpaid)}>
            {loading ? 'Paying...' : 'Pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayCommissionModal;
