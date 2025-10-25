import React from 'react';
import { SaleResponse } from '../types/types';

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
    (acc, sale) => acc + sale.soldPrice * sale.quantity,
    0,
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center font-sans z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm flex flex-col max-h-full">
        {/* Scrollable Printable Area */}
        <div id="printable-receipt" className="p-6 overflow-y-auto">
          {/* Header */}
          <div className="text-center border-b-2 border-dashed pb-4">
            <img
              src="/mutunga_dark_mode.png"
              alt="SmartOwn Digital Assets Logo"
              className="w-24 h-24 mx-auto mb-2"
            />
            <h1 className="text-2xl font-bold text-gray-800">
              SmartOwn Digital Assets
            </h1>
            <p className="text-sm text-gray-500 italic">Own Now, Pay Later</p>
            <p className="text-sm text-gray-600 mt-2">KRA PIN: P051234567X</p>
          </div>

          {/* Transaction Details */}
          <div className="my-4 text-sm text-gray-700">
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
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-semibold">Item</th>
                  <th className="py-2 text-center font-semibold">Qty</th>
                  <th className="py-2 text-right font-semibold">Price</th>
                  <th className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {saleResponse.map((sale) => (
                  <tr key={sale.id}>
                    <td className="py-2 text-left">{sale.productName}</td>
                    <td className="py-2 text-center">{sale.quantity}</td>
                    <td className="py-2 text-right">
                      {sale.soldPrice.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">
                      {(sale.soldPrice * sale.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="my-4 text-sm">
            <div className="flex justify-between font-bold text-lg text-gray-800 mt-2 pt-2 border-t">
              <span>Total:</span>
              <span>
                KES{' '}
                {total.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Customer Details */}
          <div className="border-t border-dashed pt-4 text-sm text-gray-700">
            <h3 className="font-semibold mb-2 text-center">Customer Details</h3>
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
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm">
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

      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt,
          #printable-receipt * {
            visibility: visible;
          }
          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            border: none;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Receipt;