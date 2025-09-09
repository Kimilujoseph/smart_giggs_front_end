'''
import React, { useState, useEffect } from 'react';
import { CartItem, CustomerDetails, Financer, Product, SaleResponse } from './types/types';
import { createSale, fetchFinancers, fetchProducts } from './helpers/helpers';
import { fireToast } from '../../../hooks/fireToast';
import { useAppContext } from '../../../context/AppContext';

const PointOfSale = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [financers, setFinancers] = useState<Financer[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
        name: '',
        email: '',
        phonenumber: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [transactionId, setTransactionId] = useState('');
    const [saleResponse, setSaleResponse] = useState<SaleResponse[] | null>(null);
    const [loading, setLoading] = useState(false);
    const { state } = useAppContext();

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts(state.user.shop);
                setProducts(data);
            } catch (error) {
                console.error(error);
                fireToast('error', 'Failed to fetch products');
            }
        };
        const loadFinancers = async () => {
            try {
                const data = await fetchFinancers();
                setFinancers(data);
            } catch (error) {
                console.error(error);
                fireToast('error', 'Failed to fetch financers');
            }
        };
        loadProducts();
        loadFinancers();
    }, [state.user.shop]);

    const handleAddToCart = (product: Product) => {
        const existingItem = cart.find((item) => item.id === product.id);
        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.id === product.id
                        ? { ...item, soldUnits: item.soldUnits + 1 }
                        : item
                )
            );
        } else {
            setCart([...cart, { ...product, soldUnits: 1, soldPrice: product.price, financeAmount: 0, financeStatus: 'paid' }]);
        }
    };

    const handleRemoveFromCart = (productId: string) => {
        setCart(cart.filter((item) => item.id !== productId));
    };

    const handleUpdateCartItem = (productId: string, updatedItem: Partial<CartItem>) => {
        setCart(
            cart.map((item) =>
                item.id === productId ? { ...item, ...updatedItem } : item
            )
        );
    };

    const handleCreateSale = async () => {
        setLoading(true);
        try {
            const sale = {
                customerdetails: customerDetails,
                shopName: state.user.shop,
                bulksales: cart.map((item) => ({
                    CategoryId: item.categoryId,
                    itemType: item.itemType,
                    items: [
                        {
                            productId: item.productId,
                            soldprice: item.soldPrice,
                            soldUnits: item.soldUnits,
                            itemId: item.itemId,
                            financeAmount: String(item.financeAmount),
                            financeStatus: item.financeStatus,
                            financeId: Number(item.financerId) || 1,
                        },
                    ],
                    paymentmethod: paymentMethod,
                    transactionId: transactionId,
                })),
            };
            console.log('Order data being sent:', orderData);
      const response = await createOrder(orderData);
            setSaleResponse(response.data);
            fireToast('success', 'Sale created successfully');
            setCart([]);
            setCustomerDetails({ name: '', email: '', phonenumber: '' });
            setPaymentMethod('cash');
            setTransactionId('');
        } catch (error) {
            console.error(error);
            fireToast('error', 'Failed to create sale');
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-12 gap-4">
            <div className="col-span-7">
                <ProductSearch products={products} onAddToCart={handleAddToCart} />
                <Cart cart={cart} onRemoveFromCart={handleRemoveFromCart} onUpdateCartItem={handleUpdateCartItem} financers={financers} />
            </div>
            <div className="col-span-5">
                <CustomerDetailsForm customerDetails={customerDetails} setCustomerDetails={setCustomerDetails} />
                <Payment
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                    transactionId={transactionId}
                    setTransactionId={setTransactionId}
                    onCreateSale={handleCreateSale}
                    loading={loading}
                />
                {saleResponse && <Receipt saleResponse={saleResponse} />}
            </div>
        </div>
    );
};

const ProductSearch = ({ products, onAddToCart }: { products: Product[], onAddToCart: (product: Product) => void }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Product Search</h2>
            <input
                type="text"
                placeholder="Search for products..."
                className="w-full p-2 border rounded-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="mt-4 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="flex justify-between items-center p-2 border-b">
                        <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-gray-500">KES {product.price}</p>
                        </div>
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                            onClick={() => onAddToCart(product)}
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Cart = ({ cart, onRemoveFromCart, onUpdateCartItem, financers }: { cart: CartItem[], onRemoveFromCart: (productId: string) => void, onUpdateCartItem: (productId: string, updatedItem: Partial<CartItem>) => void, financers: Financer[] }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-lg font-semibold mb-4">Cart</h2>
            {cart.length === 0 ? (
                <p>The cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 border-b">
                            <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-gray-500">KES {item.price}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    className="w-16 p-1 border rounded-lg"
                                    value={item.soldUnits}
                                    onChange={(e) => onUpdateCartItem(item.id, { soldUnits: parseInt(e.target.value) })}
                                />
                                <input
                                    type="number"
                                    className="w-24 p-1 border rounded-lg"
                                    placeholder="Sold Price"
                                    value={item.soldPrice}
                                    onChange={(e) => onUpdateCartItem(item.id, { soldPrice: parseInt(e.target.value) })}
                                />
                                {item.itemType === 'mobiles' && (
                                    <>
                                        <input
                                            type="number"
                                            className="w-24 p-1 border rounded-lg"
                                            placeholder="Finance Amount"
                                            value={item.financeAmount}
                                            onChange={(e) => onUpdateCartItem(item.id, { financeAmount: parseInt(e.target.value) })}
                                        />
                                        <select
                                            className="p-1 border rounded-lg"
                                            value={item.financeStatus}
                                            onChange={(e) => onUpdateCartItem(item.id, { financeStatus: e.target.value as 'paid' | 'pending' })}
                                        >
                                            <option value="paid">Paid</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                        <select
                                            className="p-1 border rounded-lg"
                                            value={item.financerId}
                                            onChange={(e) => onUpdateCartItem(item.id, { financerId: e.target.value })}
                                        >
                                            <option value="">Select Financer</option>
                                            {financers.map((financer) => (
                                                <option key={financer.id} value={financer.id}>
                                                    {financer.name}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}
                                <button
                                    className="bg-red-500 text-white px-2 py-1 rounded-lg"
                                    onClick={() => onRemoveFromCart(item.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const CustomerDetailsForm = ({ customerDetails, setCustomerDetails }: { customerDetails: CustomerDetails, setCustomerDetails: (details: CustomerDetails) => void }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
            <div className="space-y-4">
                <input
                    type="text"
                    placeholder="Name"
                    className="w-full p-2 border rounded-lg"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full p-2 border rounded-lg"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                />
                <input
                    type="text"
                    placeholder="Phone Number"
                    className="w-full p-2 border rounded-lg"
                    value={customerDetails.phonenumber}
                    onChange={(e) => setCustomerDetails({ ...customerDetails, phonenumber: e.target.value })}
                />
            </div>
        </div>
    );
};

const Payment = ({ paymentMethod, setPaymentMethod, transactionId, setTransactionId, onCreateSale, loading }: { paymentMethod: string, setPaymentMethod: (method: string) => void, transactionId: string, setTransactionId: (id: string) => void, onCreateSale: () => void, loading: boolean }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-lg font-semibold mb-4">Payment</h2>
            <div className="space-y-4">
                <select
                    className="w-full p-2 border rounded-lg"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                >
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Card</option>
                </select>
                {paymentMethod !== 'cash' && (
                    <input
                        type="text"
                        placeholder="Transaction ID"
                        className="w-full p-2 border rounded-lg"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                    />
                )}
                <button
                    className="w-full bg-green-500 text-white p-2 rounded-lg"
                    onClick={onCreateSale}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Create Sale'}
                </button>
            </div>
        </div>
    );
};

const Receipt = ({ saleResponse }: { saleResponse: SaleResponse[] }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h2 className="text-lg font-semibold mb-4">Receipt</h2>
            <div className="space-y-4">
                {saleResponse.map((sale) => (
                    <div key={sale.id} className="p-2 border-b">
                        <p><strong>Product:</strong> {sale.productName}</p>
                        <p><strong>Quantity:</strong> {sale.quantity}</p>
                        <p><strong>Price:</strong> KES {sale.soldPrice}</p>
                        <p><strong>Customer:</strong> {sale.customerName}</p>
                        <p><strong>Phone:</strong> {sale.customerphoneNumber}</p>
                        <p><strong>Shop:</strong> {sale.shopName}</p>
                        <p><strong>Date:</strong> {new Date(sale.createdAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
            <button
                className="w-full bg-blue-500 text-white p-2 rounded-lg mt-4"
                onClick={handlePrint}
            >
                Print Receipt
            </button>
        </div>
    );
};

export default PointOfSale;
''