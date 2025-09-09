
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sale Receipt</h2>
                <div className="space-y-4">
                    {saleResponse.map((sale) => (
                        <div key={sale.id} className="border-b pb-4">
                            <div className="flex justify-between">
                                <span className="font-semibold">Product:</span>
                                <span>{sale.productName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Quantity:</span>
                                <span>{sale.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Price:</span>
                                <span>KES {sale.soldPrice}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Customer:</span>
                                <span>{sale.customerName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Phone:</span>
                                <span>{sale.customerphoneNumber}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Shop:</span>
                                <span>{sale.shopName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-semibold">Date:</span>
                                <span>{new Date(sale.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-between">
                    <button
                        onClick={handlePrint}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Receipt;
