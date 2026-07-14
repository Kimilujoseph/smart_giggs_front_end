import React from 'react';
import { X, Minus, Plus, UserPlus, ChevronDown, ShoppingBag, Trash2, Lock } from 'lucide-react';
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
  cartHasConsignment?: boolean;
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
  cartHasConsignment = false,
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
        {/* Hide amount for consignment sales */}
        {!cartHasConsignment && (
          <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatPrice(total)}</span>
        )}
        {cartHasConsignment && (
          <span className="flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-lg">
            <Lock className="w-3 h-3" /> Consignment
          </span>
        )}
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

            const isConsignment = !isAccessory && product.items.some((item: any) => item.stock?.mobiles?.isConsignment);

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
                      {isConsignment ? (
                        <div className="w-28 px-2 py-1 text-sm text-right rounded-lg border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center justify-end gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          <span className="text-[11px]">Fixed price</span>
                        </div>
                      ) : (
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
                      )}
                      <span className="text-[10px] text-slate-400 mt-0.5">{isConsignment ? 'consignment' : isAccessory ? 'total' : 'per unit'}</span>
                    </div>
                  </div>
                </div>

                {/* Price warnings */}
                {!isConsignment && (!isAccessory && perItemPrice > maxPrice) && (
                  <p className="text-xs text-red-400 font-medium px-4 pb-2 animate-pulse">Max: {formatPrice(maxPrice)}</p>
                )}
                {!isConsignment && (perItemPrice > 0 && perItemPrice < minPrice) && (
                  <p className="text-xs text-red-400 font-medium px-4 pb-2 animate-pulse">Min: {formatPrice(minPrice)}</p>
                )}

                {/* Finance Row / Consignment Status Info */}
                {isConsignment ? (
                  <div className="mx-4 pb-4 pt-1 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-700">
                    <span className="flex items-center gap-1">
                      <span>Financed by:</span>
                      <strong className="text-primary dark:text-primary-light uppercase font-semibold">
                        {product.items[0]?.stock?.mobiles?.Financer?.name || 'watu'}
                      </strong>
                    </span>
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded font-semibold text-[10px] uppercase tracking-wider">
                      CONSIGNMENT SALE
                    </span>
                  </div>
                ) : (
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
                )}
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
            <div className="flex flex-col sm:flex-row gap-2">
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
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Payment</p>
          {cartHasConsignment && (
            <span className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
              <Lock className="w-3 h-3" /> M-Pesa only
            </span>
          )}
        </div>

        {cartHasConsignment ? (
          /* Consignment: locked M-Pesa row — no amount shown, only txn ID */
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded whitespace-nowrap">
                  M-Pesa
                </span>
                <span className="text-xs text-slate-400 italic">Amount hidden (financed)</span>
              </div>
              <Lock className="w-3.5 h-3.5 text-purple-400 flex-none" />
            </div>
            <input
              type="text"
              placeholder="M-Pesa Transaction ID (optional)"
              value={payments[0]?.transactionId || ''}
              onChange={(e) => handlePaymentChange(0, 'transactionId', e.target.value)}
              className={inputCls}
            />
          </div>
        ) : (
          /* Regular: full payment rows */
          <>
            {payments.map((p, i) => (
              <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                {/* Method selector */}
                <select
                  value={p.paymentMethod}
                  onChange={(e) => handlePaymentChange(i, 'paymentMethod', e.target.value as PaymentMethod)}
                  className={`${selectCls} sm:w-28 sm:flex-none`}
                >
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="creditcard">Card</option>
                </select>

                <div className="flex gap-2 flex-1">
                  {/* Amount */}
                  <input
                    type="number"
                    placeholder="Amount"
                    value={p.amount}
                    onChange={(e) => handlePaymentChange(i, 'amount', Number(e.target.value))}
                    className={inputCls}
                  />
                  {/* Transaction ID (non-cash) */}
                  {p.paymentMethod !== 'cash' && (
                    <input
                      type="text"
                      placeholder="Txn ID"
                      value={p.transactionId}
                      onChange={(e) => handlePaymentChange(i, 'transactionId', e.target.value)}
                      className={inputCls}
                    />
                  )}
                  {/* Remove button */}
                  {payments.length > 1 && (
                    <button
                      onClick={() => removePayment(i)}
                      className="text-slate-300 hover:text-red-400 transition flex-none self-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button onClick={addPayment} className="text-primary text-xs hover:underline text-left">+ Add payment method</button>
          </>
        )}

        {/* Balance Summary — hidden for consignment */}
        {!cartHasConsignment && (
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-slate-100 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Paid: {formatPrice(totalPaid)}</span>
            <span className={balance !== 0 ? 'text-red-400' : 'text-green-500'}>
              Balance: {formatPrice(balance)}
            </span>
          </div>
        )}
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
