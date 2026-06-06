import React from 'react';
import { SaleResponse } from '../types/types';
import './Receipt.css';

interface ReceiptProps {
  saleResponse: SaleResponse[];
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ saleResponse, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // Calculate totals
  const total = saleResponse.reduce(
    (acc, sale) => acc + Number(sale.soldPrice),
    0,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center font-sans z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Scrollable Printable Area */}
        <div id="printable-receipt" className="receipt-container">
          {/* Header */}
          <div className="receipt-header">
            <img
              src={import.meta.env.VITE_RECEIPT_LOGO_PATH}
              alt="SmartOwn Digital Assets Logo"
              className="w-24 h-24 mx-auto mb-2"
            />
            <h1>
              {import.meta.env.VITE_RECEIPT_COMPANY_NAME}
            </h1>
            <p>{import.meta.env.VITE_RECEIPT_SLOGAN}</p>
            <p>KRA PIN: {import.meta.env.VITE_RECEIPT_KRA_PIN}</p>
          </div>

          {/* Transaction Details */}
          <div className="receipt-section">
            <div className="flex justify-between">
              <span>Shop:</span>
              <span>{saleResponse[0]?.shopName}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>
                {new Date(saleResponse[0]?.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Served by:</span>
              <span>{saleResponse[0]?.sellerName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="receipt-items receipt-section">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {saleResponse.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.productName}</td>
                    <td>{sale.quantity}</td>
                    <td>
                      {(sale.soldPrice / sale.quantity).toLocaleString()}
                    </td>
                    <td>
                      {sale.soldPrice.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="receipt-totals receipt-section">
            <div className="total-line">
              <span>Total:</span>
              <span>
                KES{' '}
                {+total}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="receipt-section">
            <h2>Customer Details</h2>
            <div className="flex justify-between">
              <span>Name:</span>
              <span>{saleResponse[0]?.customerName || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{saleResponse[0]?.customerphoneNumber || 'N/A'}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="receipt-footer">
            <p>
              Thank you for your business!
            </p>
            {/* Placeholder for a QR code or barcode */}
            <div className="w-24 h-24 bg-gray-200 mx-auto mt-4 flex items-center justify-center">
              <p className="text-xs text-gray-500">QR Code</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print p-4 border-t flex justify-around bg-gray-50 rounded-b-lg">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export { Receipt };