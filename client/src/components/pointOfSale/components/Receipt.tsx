import React from 'react';
import { SaleResponse } from '../types/types';

interface Payment {
  id: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  mobileSaleId: number | null;
  accessorySaleId: number | null;
}

interface ReceiptProps {
  saleResponse: SaleResponse[];
  paymentDetails: Payment[];
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ saleResponse, paymentDetails, onClose }) => {
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
          <div className="bg-white shadow-lg rounded-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Scrollable Printable Area */}
            <div id="printable-receipt" className="font-sans bg-white p-3 md:p-6 text-gray-800 leading-relaxed w-full">
                      <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 gap-2 items-start border-b border-dashed border-gray-300 pb-4 mb-4">
                          {/* Left Column - Logo & Company */}
                          <div>
                            <img src="/captech_backgroundless.png" alt="Captech Enterprise Logo" className="h-10 md:h-12 w-auto" />
                            <div className="font-bold text-xs md:text-sm mt-1">Captech</div>
                            <div className="text-[10px] text-gray-400 hidden sm:block">Nairobi, Kenya</div>
                          </div>

                          {/* Right Column - Title & Metadata */}
                          <div className="text-right">
                            <div className="font-black text-sm md:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                              RECEIPT
                            </div>
                            <div className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                              #{saleResponse[0]?.id} • {new Date(saleResponse[0]?.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                            </div>
                            <div className="text-[10px] text-gray-400 truncate">
                              {saleResponse[0]?.shopName}
                            </div>
                            <div className="text-[10px] text-gray-400 mt-0.5">
                              {saleResponse[0]?.sellerName}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                          {/* Left Column */}
                          <div className="space-y-4">
                            {/* Transaction Details */}
                            <div className="pb-4 border-b border-dashed border-gray-200 text-sm">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Receipt ID:</span>
                                <span>#{saleResponse[0]?.id}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Date & Time:</span>
                                <span>
                                  {new Date(saleResponse[0]?.createdAt).toLocaleString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Shop:</span>
                                <span className="break-words text-right">{saleResponse[0]?.shopName}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Served by:</span>
                                <span className="break-words text-right">{saleResponse[0]?.sellerName}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span className="font-medium">Customer Name:</span>
                                <span className="break-words text-right">{saleResponse[0]?.customerName || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-medium">Customer Phone:</span>
                                <span className="break-words text-right">{saleResponse[0]?.customerphoneNumber || 'N/A'}</span>
                              </div>
                            </div>

                            {/* Items Table */}
                            <div className="pb-4 border-b border-dashed border-gray-200">
                              <h3 className="font-semibold text-lg mb-2 text-gray-800">Items</h3>
                              <div className="border-t border-b border-gray-200 py-3 space-y-2">
                                {saleResponse.map((sale) => (
                                  <div key={sale.id} className="bg-gray-50 p-3 rounded-lg mb-2 last:mb-0">
                                    <p className="font-medium break-words">{sale.productName}</p>
                                    <p className="text-sm text-gray-500">
                                      {sale.brand} • {sale.productModel} • Qty: {sale.quantity}
                                    </p>
                                    {sale.batchIMEI && (
                                      <p className="imei bg-gray-100 p-2 rounded-md font-mono text-sm break-all mt-1">
                                        📱 IMEI: {sale.batchIMEI}
                                      </p>
                                    )}
                                    <p className="text-right font-semibold mt-2">
                                      {new Intl.NumberFormat('en-KE', {
                                        style: 'currency',
                                        currency: 'KES',
                                      }).format(sale.soldPrice)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            {/* QR Code section removed as per requirements */}

                            {/* Payment Details */}
                            <div className="pb-4 border-b border-dashed border-gray-200 text-sm">
                              <h3 className="font-semibold text-lg mb-2 text-gray-800">Payment Details</h3>
                              {paymentDetails && paymentDetails.length > 0 ? (
                                paymentDetails.map((payment, index) => (
                                  <div key={index} className="flex justify-between py-1 text-base text-gray-700">
                                    <span>{payment.paymentMethod}:</span>
                                    <span>
                                      {new Intl.NumberFormat('en-KE', {
                                        style: 'currency',
                                        currency: 'KES',
                                      }).format(payment.amount)}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex justify-between py-1 text-base text-gray-700">
                                  <span>Payment Method:</span>
                                  <span>Cash</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-lg border-t border-dashed border-gray-300 pt-3 mt-3">
                                <span>Total Amount:</span>
                                <span>
                                  {new Intl.NumberFormat('en-KE', {
                                    style: 'currency',
                                    currency: 'KES',
                                  }).format(total)}
                                </span>
                              </div>
                            </div>

                            {/* Footer notes */}
                            <div className="text-center text-xs text-gray-500 space-y-1">
                              <p className="text-gray-600 font-medium">Thank you for shopping with us!</p>
                              <p className="italic">Items sold are not returnable after 7 days.</p>
                              <p>This is a computer-generated receipt, no signature required.</p>
                            </div>
                                                  </div>
                                                </div>
                      </div>
                          
                                      {/* Action Buttons */}
                                      <div className="no-print p-4 border-t flex flex-col md:flex-row justify-around bg-gray-50 rounded-b-lg space-y-2 md:space-y-0 md:space-x-4">
                                        <button
                                          onClick={handlePrint}
                                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md w-full md:w-auto min-h-[48px]"
                                        >
                                          Print Receipt
                                        </button>
                                        <button
                                          onClick={onClose}
                                          className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors shadow-md w-full md:w-auto min-h-[48px]"
                                        >
                                          Close
                                        </button>
                                      </div>
                                    </div>
              </div>
    </div>
                            );
                          };
export { Receipt };