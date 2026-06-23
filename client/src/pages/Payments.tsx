import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../types/decodedToken';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import {
  DollarSign,
  Smartphone,
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';

// Helper to format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Ksh 0';
  return `Ksh ${value.toLocaleString()}`;
};

interface User {
  id: number;
  name: string;
  role: string;
  email: string;
  workingstatus: string;
}

interface Shop {
  id: number;
  shopName: string;
  address: string;
}

interface Payment {
  id: number;
  amount: string;
  paymentMethod: string;
  status: string;
  transactionId: string | null;
  createdAt: string;
  updatedAt: string;
  sellerName: string;
  shopName: string;
}

interface PaymentsSummary {
  cash?: {
    totalAmount: string;
    count: number;
  };
  mpesa?: {
    totalAmount: string;
    count: number;
  };
}

const Payments: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('tk');

  // Verify auth
  if (!token) {
    localStorage.clear();
    navigate('/auth/signin');
    return null;
  }
  const decodedToken = jwt_decode<DecodedToken>(token);
  const userRole = decodedToken.role;

  // Payments page is for manager, superuser, and seller roles
  if (userRole !== 'manager' && userRole !== 'superuser' && userRole !== 'seller') {
    navigate('/settings');
    return null;
  }

  // Set default dates (past 30 days)
  const defaultEndDate = new Date().toISOString().slice(0, 10);
  const defaultStartDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  // States
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<PaymentsSummary>({});
  const [users, setUsers] = useState<User[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [sellerId, setSellerId] = useState<string>('');
  const [shopId, setShopId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPayments, setTotalPayments] = useState(0);

  // Fetch shops and sellers once
  useEffect(() => {
    const fetchFilters = async () => {
      setLoadingFilters(true);
      try {
        const [usersRes, shopsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/user/all`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/shop/all`, {
            withCredentials: true,
          }),
        ]);

        // Standard response format contains users array in usersRes.data.data
        if (usersRes.data && usersRes.data.data) {
          setUsers(usersRes.data.data);
        } else if (usersRes.data && Array.isArray(usersRes.data)) {
          setUsers(usersRes.data);
        }

        // Standard response contains shops array in shopsRes.data.shops
        if (shopsRes.data && shopsRes.data.shops) {
          setShops(shopsRes.data.shops);
        } else if (shopsRes.data && Array.isArray(shopsRes.data)) {
          setShops(shopsRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch users or shops for filters', err);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();
  }, []);

  // Fetch payments when filters or page change
  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        startDate,
        endDate,
        page,
        limit,
      };

      if (sellerId) params.sellerId = sellerId;
      if (shopId) params.shopId = shopId;

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/payments/`,
        {
          params,
          withCredentials: true,
        }
      );

      if (response.data && response.data.success) {
        const data = response.data.data;
        setPayments(data.payments || []);
        setSummary(data.summary || {});
        setTotalPages(data.totalPages || 1);
        setTotalPayments(data.totalPayments || 0);
      } else {
        throw new Error(response.data.message || 'Failed to retrieve payments');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch payments. Please try adjusting your filters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [startDate, endDate, sellerId, shopId, page, limit]);

  // Handle reset filters
  const handleResetFilters = () => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
    setSellerId('');
    setShopId('');
    setPage(1);
    setLimit(10);
  };

  // Helper values for totals
  const cashAmount = parseFloat(summary.cash?.totalAmount || '0');
  const cashCount = summary.cash?.count || 0;

  const mpesaAmount = parseFloat(summary.mpesa?.totalAmount || '0');
  const mpesaCount = summary.mpesa?.count || 0;

  const totalAmount = cashAmount + mpesaAmount;
  const totalCount = cashCount + mpesaCount;

  // Extract sellers for filter list
  const sellers = users.filter((u) => u.role === 'seller');

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6 lg:p-8">
      <Breadcrumb pageName="Payments Manager" />

      {/* Filter Options */}
      <div className="mb-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between border-b border-stroke pb-3 mb-4 dark:border-strokedark">
          <div className="flex items-center gap-2">
            <Filter className="text-primary w-5 h-5" />
            <h4 className="text-lg font-semibold text-black dark:text-white">
              Filter Payments
            </h4>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden flex items-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-opacity-90"
            >
              {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 text-sm font-medium text-danger hover:underline"
            >
              <RefreshCw className="w-4 h-4" /> Reset Filters
            </button>
          </div>
        </div>

        <div className={`${showMobileFilters ? 'grid grid-cols-1' : 'hidden'} md:grid md:grid-cols-4 gap-4`}>
          {/* Start Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded border border-stroke bg-transparent py-2.5 pl-4 pr-10 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
              <Calendar className="absolute right-3.5 top-3 w-5 h-5 text-bodydark" />
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full rounded border border-stroke bg-transparent py-2.5 pl-4 pr-10 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
              />
              <Calendar className="absolute right-3.5 top-3 w-5 h-5 text-bodydark" />
            </div>
          </div>

          {/* Shop Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Select Shop
            </label>
            <select
              value={shopId}
              onChange={(e) => {
                setShopId(e.target.value);
                setPage(1);
              }}
              disabled={loadingFilters}
              className="w-full rounded border border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="" className="dark:bg-boxdark text-gray-500">
                All Shops
              </option>
              {shops.map((shop) => (
                <option
                  key={shop.id}
                  value={shop.id}
                  className="dark:bg-boxdark"
                >
                  {shop.shopName}
                </option>
              ))}
            </select>
          </div>

          {/* Seller Selector */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Select Seller
            </label>
            <select
              value={sellerId}
              onChange={(e) => {
                setSellerId(e.target.value);
                setPage(1);
              }}
              disabled={loadingFilters}
              className="w-full rounded border border-stroke bg-transparent py-2.5 px-4 outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
            >
              <option value="" className="dark:bg-boxdark text-gray-500">
                All Sellers
              </option>
              {sellers.map((seller) => (
                <option
                  key={seller.id}
                  value={seller.id}
                  className="dark:bg-boxdark"
                >
                  {seller.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        {/* Total Payments Card */}
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Total Payments Received
              </p>
              <h3 className="mt-1 text-2xl font-bold text-black dark:text-white">
                {formatCurrency(totalAmount)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {totalCount} transaction{totalCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <DollarSign className="text-success w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Cash Payments Card */}
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                Cash Payments
              </p>
              <h3 className="mt-1 text-2xl font-bold text-black dark:text-white">
                {formatCurrency(cashAmount)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {cashCount} cash payment{cashCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <DollarSign className="text-primary w-6 h-6" />
            </div>
          </div>
        </div>

        {/* M-Pesa Payments Card */}
        <div className="rounded-xl border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-slate-400">
                M-Pesa Payments
              </p>
              <h3 className="mt-1 text-2xl font-bold text-black dark:text-white">
                {formatCurrency(mpesaAmount)}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {mpesaCount} mpesa payment{mpesaCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <Smartphone className="text-secondary w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-stroke dark:border-strokedark mb-5">
          <h3 className="text-xl font-semibold text-black dark:text-white">
            Payments List ({totalPayments})
          </h3>

          {/* Page limit selector */}
          <div className="mt-3 sm:mt-0 flex items-center gap-2">
            <span className="text-sm text-bodydark">Show</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-stroke bg-transparent py-1 px-2 text-sm outline-none focus:border-primary dark:border-strokedark dark:bg-meta-4"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size} className="dark:bg-boxdark">
                  {size}
                </option>
              ))}
            </select>
            <span className="text-sm text-bodydark">entries</span>
          </div>
        </div>

        {/* Content body */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <CircularProgress size={40} />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-danger">{error}</div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            No payments found matching the selected filter criteria.
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    ID
                  </th>
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    Seller
                  </th>
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    Shop
                  </th>
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    Amount
                  </th>
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    Method
                  </th>
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    Status
                  </th>
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    Transaction ID
                  </th>
                  <th className="py-4 px-4 font-semibold text-black dark:text-white text-sm">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-stroke dark:border-strokedark hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-4 px-4 text-sm font-medium text-black dark:text-white">
                      #{payment.id}
                    </td>
                    <td className="py-4 px-4 text-sm text-bodydark dark:text-bodydark1">
                      {payment.sellerName || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm text-bodydark dark:text-bodydark1">
                      {payment.shopName || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-black dark:text-white">
                      {formatCurrency(parseFloat(payment.amount))}
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${
                          payment.paymentMethod?.toLowerCase() === 'mpesa'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-400'
                        }`}
                      >
                        {payment.paymentMethod}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold leading-5 ${
                          payment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-400'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-mono text-bodydark dark:text-bodydark1">
                      {payment.transactionId || 'None'}
                    </td>
                    <td className="py-4 px-4 text-sm text-bodydark dark:text-bodydark1">
                      <div>
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(payment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!loading && !error && payments.length > 0 && (
          <div className="flex items-center justify-between border-t border-stroke py-4 dark:border-strokedark mt-4">
            <div className="text-sm text-bodydark">
              Showing page{' '}
              <span className="font-semibold text-black dark:text-white">
                {page}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-black dark:text-white">
                {totalPages}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded border border-stroke px-3 py-1.5 text-sm font-medium hover:bg-gray-100 disabled:opacity-50 dark:border-strokedark dark:hover:bg-meta-4"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
