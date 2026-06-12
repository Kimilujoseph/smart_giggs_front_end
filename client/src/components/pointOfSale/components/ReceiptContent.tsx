import React from 'react';
import { SaleResponse, Payment } from '../types/types';

interface ReceiptContentProps {
  saleResponse: SaleResponse[];
  paymentDetails: Payment[];
}

const ReceiptContent: React.FC<ReceiptContentProps> = ({ saleResponse, paymentDetails }) => {
  // Assuming all sales in saleResponse share the same general details for the header
  const receiptId = saleResponse[0]?.id;
  const createdAt = saleResponse[0]?.createdAt;
  const shopName = saleResponse[0]?.shopName;
  const sellerName = saleResponse[0]?.sellerName;
  const customerName = saleResponse[0]?.customerName;
  const customerPhone = saleResponse[0]?.customerphoneNumber;
  
  const formattedDate = new Date(createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Calculate totals
  const totalAmount = saleResponse.reduce(
    (acc, sale) => acc + Number(sale.soldPrice),
    0,
  );

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header with Large Logo */}
      <div className="grid grid-cols-2 gap-4 items-start border-b pb-6 mb-6">
        {/* Left - Logo (Now Larger!) */}
        <div className="flex flex-col items-start">
          <img 
            src={import.meta.env.VITE_RECEIPT_LOGO_PATH} 
            alt="Captech Logo" 
            className="h-16 md:h-20 w-auto object-contain mb-2"
          />
          <h2 className="text-base md:text-lg font-bold text-gray-800">
            Captech Enterprise
          </h2>
          <p className="text-xs text-gray-500">Nairobi, Kenya</p>
        </div>

        {/* Right - Title & Metadata */}
        <div className="text-right">
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            SALES RECEIPT
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            #{receiptId} • {formattedDate}
          </p>
          <p className="text-sm text-gray-500">{shopName}</p>
          <p className="text-xs text-gray-400 mt-1">Served by: {sellerName}</p>
        </div>
      </div>

      {/* Customer & IMEI Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500">Customer Name</p>
            <p className="font-medium">{customerName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone Number</p>
            <p className="font-medium">{customerPhone || 'N/A'}</p>
          </div>
        </div>
        {saleResponse.map((sale) => sale.batchIMEI && (
          <div key={sale.id} className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500">IMEI Number</p>
            <p className="font-mono text-sm bg-white p-2 rounded break-all font-semibold">
              📱 {sale.batchIMEI}
            </p>
          </div>
        ))}
      </div>

      {/* Product Details - Flexible Layout */}
      <div className="border rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Item Details</h3>
        <div className="space-y-2">
          {saleResponse.map((sale) => (
            <div key={sale.id} className="border-b border-gray-100 last:border-b-0 pb-2 mb-2 last:mb-0">
              <div className="flex flex-wrap justify-between gap-2">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium text-right break-words flex-1">{sale.productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Brand / Model:</span>
                <span>{sale.brand} • {sale.productModel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span>{sale.quantity}</span>
              </div>
              <div className="flex justify-between font-semibold mt-2">
                <span>Price:</span>
                <span>
                  {new Intl.NumberFormat('en-KE', {
                    style: 'currency',
                    currency: 'KES',
                  }).format(sale.soldPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Payment Method:</span>
          <span className="font-medium">
            {paymentDetails && paymentDetails.length > 0 ? (
              paymentDetails.map(p => p.paymentMethod).join(', ')
            ) : 'Cash'}
          </span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount:</span>
          <span className="text-blue-600">
            {new Intl.NumberFormat('en-KE', {
              style: 'currency',
              currency: 'KES',
            }).format(totalAmount)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 border-t pt-6">
        <p className="font-medium text-gray-700">Thank you for shopping with us!</p>
        <p className="text-xs mt-1">Items sold are not returnable after 7 days</p>
        <p className="text-xs mt-1">This is a computer-generated receipt, no signature required.</p>
        <p className="text-xs text-gray-400 mt-4">Receipt ID: #{receiptId}</p>
      </div>
    </div>
  );
};

export default ReceiptContent;