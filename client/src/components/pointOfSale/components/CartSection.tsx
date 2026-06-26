import React from 'react';
import {
  ShoppingCartIcon,
  ChevronDown,
  ChevronUp,
  X,
  UserPlus,
} from 'lucide-react';
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

export const CartSection: React.FC<CartSectionProps> = ({
  cart,
  groupedCart,
  total,
  totalPaid,
  soldprice,
  setSoldPrice,
  financeDetails,
  setFinanceDetails,
  financers,
  showCustomerDetails,
  setShowCustomerDetails,
  formData,
  setFormData,
  payments,
  handlePaymentChange,
  addPayment,
  removePayment,
  updateQuantity,
  removeFromCart,
  clearCart,
  handleCheckout,
  checkoutDisabled,
  submitting,
  formatPrice,
}) => {
  return (
    <div className="w-full md:w-3/4 xl:w-1/2 mx-auto">
      <div className="bg-bodydark/50 dark:bg-boxdark rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black dark:text-slate-200 flex items-center">
            <ShoppingCartIcon className="h-6 w-6 mr-2 text-primary" />
            Shopping Cart
          </h2>
          <p className="text-lg font-semibold text-black dark:text-slate-200">
            Total: {formatPrice(total)}
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="border-4 border-dashed border-slate-400/20 rounded-lg">
            <SuchEmpty
              message="Your cart is empty"
              description="Add items from the products section to get started"
              variant="emptyCart"
            />
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {groupedCart.map((product) => {
              const isAccessory = product.categoryId.itemType === 'accessories';
              const quantity = isAccessory ? product.quantity : product.items.length;
              const perItemPrice = soldprice?.[product.categoryId.id] || 0;
              const minItemPrice = product.categoryId.minPrice;

              return (
                <React.Fragment key={product.categoryId.id}>
                  <div className="bg-bodydark1 dark:bg-boxdark/60 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex-grow">
                      <h3 className="font-semibold text-black dark:text-slate-200">
                        {product.categoryId.itemName}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400">
                        {product.categoryId.brand} - {product.categoryId.itemModel}
                      </p>
                      <div className="flex items-center mt-2 space-x-3">
                        {product.categoryId.itemType === 'mobiles' ? (
                          <span className="text-black dark:text-slate-200">
                            {product.items.length}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  product.categoryId.id,
                                  Number(
                                    cart.find(
                                      (item) =>
                                        item.category.id === product.categoryId.id,
                                    )?.quantity,
                                  ) - 1,
                                )
                              }
                              className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                            >
                              <ChevronDown className="h-4 w-4 text-black dark:text-red-400" />
                            </button>
                            <span className="text-black dark:text-slate-200">
                              {
                                cart.find(
                                  (item) =>
                                    item.category.id === product.categoryId.id,
                                )?.quantity
                              }
                            </span>
                            <button
                              onClick={() => {
                                updateQuantity(
                                  product.categoryId.id,
                                  Number(
                                    cart.find(
                                      (item) =>
                                        item.category.id === product.categoryId.id,
                                    )?.quantity,
                                  ) + 1,
                                );
                              }}
                              className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                            >
                              <ChevronUp className="h-4 w-4 text-black dark:text-green-400" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col justify-between h-full items-end gap-2">
                      <button
                        onClick={() => removeFromCart(product.categoryId.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      <input
                        type="number"
                        min={isAccessory ? minItemPrice * quantity : minItemPrice}
                        max={isAccessory ? undefined : product.categoryId.maxPrice}
                        value={isAccessory && quantity > 0 ? perItemPrice * quantity : perItemPrice}
                        onChange={(e) => {
                          const newPrice = Number(e.target.value);
                          setSoldPrice({
                            ...soldprice,
                            [product.categoryId.id]:
                              isAccessory && quantity > 0 ? newPrice / quantity : newPrice,
                          });
                        }}
                        className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md text-black dark:text-slate-200"
                      />
                      <span className="text-xs text-gray-500 dark:text-slate-400">
                        {isAccessory ? 'Total Price' : 'per Item'}
                      </span>
                    </div>
                  </div>

                  <div className="bg-bodydark1 dark:bg-boxdark/60 p-4 rounded-lg flex items-center justify-between mt-2">
                    <div className="flex items-center gap-4 w-full">
                      <input
                        type="number"
                        placeholder="Finance Amount"
                        className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md text-black dark:text-slate-200 w-1/3"
                        value={financeDetails[product.categoryId.id]?.amount || ''}
                        onChange={(e) =>
                          setFinanceDetails({
                            ...financeDetails,
                            [product.categoryId.id]: {
                              ...financeDetails[product.categoryId.id],
                              amount: Number(e.target.value),
                            },
                          })
                        }
                      />
                      <select
                        className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md text-black dark:text-slate-200 w-1/3"
                        value={financeDetails[product.categoryId.id]?.status || 'paid'}
                        onChange={(e) =>
                          setFinanceDetails({
                            ...financeDetails,
                            [product.categoryId.id]: {
                              ...financeDetails[product.categoryId.id],
                              status: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                      </select>
                      <select
                        className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md text-black dark:text-slate-200 w-1/3"
                        value={financeDetails[product.categoryId.id]?.financerId || ''}
                        onChange={(e) =>
                          setFinanceDetails({
                            ...financeDetails,
                            [product.categoryId.id]: {
                              ...financeDetails[product.categoryId.id],
                              financerId: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="">Select Financer</option>
                        {financers.map((financer) => (
                          <option key={financer.id} value={financer.id}>
                            {financer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {!isAccessory && perItemPrice > product.categoryId.maxPrice && (
                    <span className="text-xs text-red-400 font-bold animate-pulse block mt-1">
                      {`Max Price should be ${formatPrice(product.categoryId.maxPrice)}`}
                    </span>
                  )}
                  {perItemPrice < minItemPrice && (
                    <span className="text-xs text-red-400 font-bold animate-pulse block mt-1">
                      {`Min Price should be ${formatPrice(minItemPrice)}`}
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Customer Details Section */}
        <div className="mt-6">
          <button
            onClick={() => setShowCustomerDetails(!showCustomerDetails)}
            className="w-full flex items-center justify-center py-2 px-4 bg-bodydark dark:bg-accent1 text-black dark:text-slate-400 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {showCustomerDetails ? 'Hide' : 'Add'} Customer Details{' '}
            {!showCustomerDetails ? '(optional)' : ''}
          </button>

          {showCustomerDetails && (
            <div className="space-y-4 mt-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg text-black dark:text-slate-200"
              />
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg text-black dark:text-slate-200"
                />
                <input
                  type="phone"
                  placeholder="Phone Number"
                  value={formData.phonenumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      phonenumber: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg text-black dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Payment Methods
            </label>
            <div className="space-y-2">
              {payments.map((payment, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-2 items-center">
                  <select
                    value={payment.paymentMethod}
                    onChange={(e) =>
                      handlePaymentChange(
                        index,
                        'paymentMethod',
                        e.target.value as PaymentMethod,
                      )
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg text-black dark:text-slate-200"
                  >
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-pesa</option>
                    <option value="creditcard">Credit Card</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={payment.amount}
                    onChange={(e) =>
                      handlePaymentChange(index, 'amount', Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg text-black dark:text-slate-200"
                  />
                  {payment.paymentMethod !== 'cash' && (
                    <input
                      type="text"
                      placeholder="Transaction ID"
                      value={payment.transactionId}
                      onChange={(e) =>
                        handlePaymentChange(index, 'transactionId', e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg text-black dark:text-slate-200"
                    />
                  )}
                  {payments.length > 1 && (
                    <button onClick={() => removePayment(index)} className="p-1">
                      <X className="h-5 w-5 text-red-500" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button onClick={addPayment} className="text-primary mt-2 text-sm">
              + Add Payment Method
            </button>
            <div className="mt-4 flex justify-between text-sm font-semibold text-black dark:text-slate-200">
              <p>Total Paid: {formatPrice(totalPaid)}</p>
              <p className={total - totalPaid !== 0 ? 'text-red-500' : 'text-green-500'}>
                Balance: {formatPrice(total - totalPaid)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <button
              onClick={clearCart}
              className="flex justify-center rounded-lg border border-slate-300 dark:border-slate-600 py-2 px-6 font-medium text-black dark:text-white hover:bg-opacity-90"
            >
              Clear Cart
            </button>
            <button
              className="text-white py-2 px-4 rounded-lg bg-primary hover:bg-opacity-90 disabled:opacity-50"
              disabled={cart.length === 0 || checkoutDisabled || submitting}
              onClick={handleCheckout}
            >
              {submitting ? 'Processing...' : 'Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
