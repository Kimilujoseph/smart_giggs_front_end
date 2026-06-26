import React from 'react';
import { X, Minus, Plus, UserPlus, ChevronDown, ShoppingBag, Trash2 } from 'lucide-react';
import SuchEmpty from '../../suchEmpty';
import { CartItem } from '../types/Cart';
import { GroupedCartItem } from '../types/GroupedCartItem';
import { Financer } from '../types/types';

type PaymentMethod = 'cash' | 'mpesa' | 'creditcard';

interface Payment {
  paymentMethod: PaymentMethod;
  amount: number;
  transactionId: string;
}

interface CartSectionProps {
  cart: CartItem[];
  groupedCart: GroupedCartItem[];
  total: number;
  totalPaid: number;
  soldprice: { [key: string]: number };
  setSoldPrice: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
  financeDetails: { [key: string]: { amount: number; status: string; financerId: string } };
  setFinanceDetails: React.Dispatch<React.SetStateAction<{ [key: string]: { amount: number; status: string; financerId: string } }>>;
  financers: Financer[];
  showCustomerDetails: boolean;
  setShowCustomerDetails: (val: boolean) => void;
  formData: { email: string; name: string; phonenumber: string };
  setFormData: React.Dispatch<React.SetStateAction<{ email: string; name: string; phonenumber: string }>>;
  payments: Payment[];
  handlePaymentChange: (index: number, field: keyof Payment, value: string | number) => void;
  addPayment: () => void;
  removePayment: (index: number) => void;
  updateQuantity: (productId: number | string, units: number) => void;
  removeFromCart: (productId: number | string) => void;
  clearCart: () => void;
  handleCheckout: () => void;
  checkoutDisabled: boolean;
  submitting: boolean;
  formatPrice: (price: number) => string;
}

// Reusable input style
const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 transition';
const selectCls = inputCls;

export const CartSection: React.FC<CartSectionProps> = ({
  cart, groupedCart, total, totalPaid, soldprice, setSoldPrice,
  financeDetails, setFinanceDetails, financers, showCustomerDetails,
  setShowCustomerDetails, formData, setFormData, payments,
  handlePaymentChange, addPayment, removePayment, updateQuantity,
  removeFromCart, clearCart, handleCheckout, checkoutDisabled, submitting, formatPrice,
}) => {
  const balance = total - totalPaid;

  return (
    <div className="w-full max-w-xl mx-auto px-2 pb-10 flex flex-col gap-4">

      {/* Cart Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800 dark:text-slate-100">
          <ShoppingBag className="w-5 h-5 text-primary" />
          Cart
          <span className="text-xs font-normal text-slate-400">({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
        </h2>
        <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatPrice(total)}</span>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
          <SuchEmpty message="Cart is empty" description="Add items from the Products tab" variant="emptyCart" />
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {groupedCart.map((product) => {
            const isAccessory = product.categoryId.itemType === 'accessories';
            const qty = isAccessory ? product.quantity : product.items.length;
            const perItemPrice = soldprice?.[product.categoryId.id] || 0;
            const minPrice = product.categoryId.minPrice;
            const maxPrice = product.categoryId.maxPrice;
            const displayPrice = isAccessory && qty > 0 ? perItemPrice * qty : perItemPrice;
            const cartQty = cart.find((i) => i.category.id === product.categoryId.id)?.quantity ?? 0;

            return (
              <div key={product.categoryId.id} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark overflow-hidden">
                {/* Product Row */}
                <div className="flex items-start justify-between p-4 gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{product.categoryId.itemName}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{product.categoryId.brand} · {product.categoryId.itemModel}</p>

                    {/* Quantity control (accessories only) */}
                    {isAccessory ? (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(product.categoryId.id, cartQty - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center text-slate-700 dark:text-slate-300">{cartQty}</span>
                        <button
                          onClick={() => updateQuantity(product.categoryId.id, cartQty + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 mt-1">{product.items.length} unit{product.items.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => removeFromCart(product.categoryId.id)} className="text-slate-300 hover:text-red-400 transition">
                      <X className="w-4 h-4" />
                    </button>
                    <div className="flex flex-col items-end">
                      <input
                        type="number"
                        value={displayPrice}
                        min={isAccessory ? minPrice * qty : minPrice}
                        max={isAccessory ? undefined : maxPrice}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setSoldPrice({ ...soldprice, [product.categoryId.id]: isAccessory && qty > 0 ? v / qty : v });
                        }}
                        className="w-28 px-2 py-1 text-sm text-right rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5">{isAccessory ? 'total' : 'per unit'}</span>
                    </div>
                  </div>
                </div>

                {/* Price warnings */}
                {(!isAccessory && perItemPrice > maxPrice) && (
                  <p className="text-xs text-red-400 font-medium px-4 pb-2 animate-pulse">Max: {formatPrice(maxPrice)}</p>
                )}
                {perItemPrice > 0 && perItemPrice < minPrice && (
                  <p className="text-xs text-red-400 font-medium px-4 pb-2 animate-pulse">Min: {formatPrice(minPrice)}</p>
                )}

                {/* Finance Row */}
                <div className="flex gap-2 px-4 pb-4">
                  <input
                    type="number"
                    placeholder="Finance amt."
                    value={financeDetails[product.categoryId.id]?.amount || ''}
                    onChange={(e) => setFinanceDetails({ ...financeDetails, [product.categoryId.id]: { ...financeDetails[product.categoryId.id], amount: Number(e.target.value) } })}
                    className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-boxdark-2 text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <select
                    value={financeDetails[product.categoryId.id]?.status || 'paid'}
                    onChange={(e) => setFinanceDetails({ ...financeDetails, [product.categoryId.id]: { ...financeDetails[product.categoryId.id], status: e.target.value } })}
                    className="w-24 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-boxdark-2 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                  <select
                    value={financeDetails[product.categoryId.id]?.financerId || ''}
                    onChange={(e) => setFinanceDetails({ ...financeDetails, [product.categoryId.id]: { ...financeDetails[product.categoryId.id], financerId: e.target.value } })}
                    className="flex-1 px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-boxdark-2 text-slate-700 dark:text-slate-300 outline-none"
                  >
                    <option value="">Financer</option>
                    {financers.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customer Details */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark overflow-hidden">
        <button
          onClick={() => setShowCustomerDetails(!showCustomerDetails)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-boxdark-2 transition"
        >
          <span className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-primary" />
            Customer Details <span className="text-slate-400 text-xs">(optional)</span>
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showCustomerDetails ? 'rotate-180' : ''}`} />
        </button>
        {showCustomerDetails && (
          <div className="px-4 pb-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-700">
            <input type="email" placeholder="Email" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputCls} />
            <div className="flex gap-2">
              <input type="text" placeholder="Full Name" value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputCls} />
              <input type="tel" placeholder="Phone" value={formData.phonenumber}
                onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })} className={inputCls} />
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Payment</p>
        {payments.map((p, i) => (
          <div key={i} className="flex gap-2 items-center">
            <select value={p.paymentMethod}
              onChange={(e) => handlePaymentChange(i, 'paymentMethod', e.target.value as PaymentMethod)}
              className={`${selectCls} w-28 flex-none`}>
              <option value="cash">Cash</option>
              <option value="mpesa">M-Pesa</option>
              <option value="creditcard">Card</option>
            </select>
            <input type="number" placeholder="Amount" value={p.amount}
              onChange={(e) => handlePaymentChange(i, 'amount', Number(e.target.value))}
              className={inputCls} />
            {p.paymentMethod !== 'cash' && (
              <input type="text" placeholder="Txn ID" value={p.transactionId}
                onChange={(e) => handlePaymentChange(i, 'transactionId', e.target.value)}
                className={inputCls} />
            )}
            {payments.length > 1 && (
              <button onClick={() => removePayment(i)} className="text-slate-300 hover:text-red-400 transition flex-none">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button onClick={addPayment} className="text-primary text-xs hover:underline text-left">+ Add payment method</button>

        {/* Balance Summary */}
        <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-100 dark:border-slate-700">
          <span className="text-slate-500 dark:text-slate-400">Paid: {formatPrice(totalPaid)}</span>
          <span className={balance !== 0 ? 'text-red-400' : 'text-green-500'}>
            Balance: {formatPrice(balance)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={clearCart}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 hover:text-red-500 transition"
        >
          <Trash2 className="w-4 h-4" /> Clear
        </button>
        <button
          onClick={handleCheckout}
          disabled={cart.length === 0 || checkoutDisabled || submitting}
          className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {submitting ? 'Processing…' : 'Checkout'}
        </button>
      </div>
    </div>
  );
};
