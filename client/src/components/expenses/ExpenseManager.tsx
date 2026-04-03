import React, { useState, useEffect, useMemo } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { DecodedToken } from '../../types/decodedToken';
import {
  getExpenses,
  getExpenseAnalytics,
  getBudgetUtilization,
  approveExpense,
  rejectExpense,
} from '../../api/expense_manager';
import { Expense } from '../../types/expense';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import Message from '../alerts/Message';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Filter,
} from 'lucide-react';
import { CircularProgress, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { X } from 'lucide-react';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

const formatCurrency = (value: number | string | null | undefined) => {
  if (value === null || value === undefined) return 'Ksh 0';
  return `Ksh ${Number(value).toLocaleString()}`;
};

const ExpenseManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);

  const [shops, setShops] = useState<Array<{ id: number; shopName: string; address: string }>>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState('0');

  // Filters
  const [shopFilter, setShopFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('month');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Analytics
  const [analytics, setAnalytics] = useState<any>(null);
  const [budgetUtilization, setBudgetUtilization] = useState<any>(null);
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState('paymentMethod');

  // Detail modal
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Reject modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingExpense, setRejectingExpense] = useState<Expense | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tk');
    if (token) {
      const decoded: DecodedToken = jwt_decode(token);
      setCurrentUser(decoded);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchShops();
      fetchExpenses();
      fetchAnalytics();
      fetchBudgetUtilization();
    }
  }, [currentPage, shopFilter, periodFilter, statusFilter, categoryFilter, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchAnalytics();
    }
  }, [analyticsGroupBy, shopFilter, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchBudgetUtilization();
    }
  }, [periodFilter, shopFilter, currentUser]);

  const fetchShops = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/all`,
        { withCredentials: true }
      );
      if (response.data.shops) {
        setShops(response.data.shops);
      }
    } catch (error) {
      console.error('Failed to fetch shops', error);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        limit: 5,
      };

      if (shopFilter) params.shopId = Number(shopFilter);
      if (periodFilter) params.period = periodFilter;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const response = await getExpenses(params);

      if (response.data.success) {
        setExpenses(response.data.data.expenses);
        setTotalPages(response.data.data.totalPages);
        setTotalCount(response.data.data.totalCount);
        setTotalAmount(response.data.data.totalAmount);
      }
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to fetch expenses',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const shopId = shopFilter ? Number(shopFilter) : undefined;
      const response = await getExpenseAnalytics(analyticsGroupBy, shopId);

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    }
  };

  const fetchBudgetUtilization = async () => {
    try {
      const shopId = shopFilter ? Number(shopFilter) : undefined;
      const params = new URLSearchParams();
      if (periodFilter) params.append('period', periodFilter);
      if (shopId) params.append('shopId', shopId.toString());

      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/expenses/budget-utilization?${params.toString()}`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setBudgetUtilization(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch budget utilization', error);
    }
  };

  const handleApprove = async (id: number) => {
    if (!window.confirm('Are you sure you want to approve this expense?')) return;

    try {
      setSubmitting(true);
      const response = await approveExpense(id);

      if (response.data.success) {
        setMessage({ text: 'Expense approved successfully!', type: 'success' });
        fetchExpenses();
        fetchAnalytics();
      }
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to approve expense',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingExpense || !rejectReason.trim()) {
      setMessage({ text: 'Please provide a rejection reason', type: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const response = await rejectExpense(rejectingExpense.id, rejectReason);

      if (response.data.success) {
        setMessage({ text: 'Expense rejected successfully!', type: 'success' });
        setRejectModalOpen(false);
        setRejectingExpense(null);
        setRejectReason('');
        fetchExpenses();
        fetchAnalytics();
      }
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to reject expense',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openDetailModal = (expense: Expense) => {
    setSelectedExpense(expense);
    setDetailModalOpen(true);
  };

  const analyticsData = useMemo(() => {
    if (!analytics?.grouped) return [];
    return analytics.grouped.map((item: any) => ({
      name: item.group,
      count: item.count,
      total: item.total,
      average: item.average,
    }));
  }, [analytics]);

  const budgetData = useMemo(() => {
    if (!budgetUtilization?.byCategory) return [];
    return budgetUtilization.byCategory.map((item: any) => ({
      name: item.category,
      total: Number(item.total),
      count: item.count,
    }));
  }, [budgetUtilization]);

  return (
    <div className="container mx-auto text-sm md:text-base">
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      <Breadcrumb pageName="Expense Management" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-primary">{formatCurrency(totalAmount)}</h3>
            </div>
            <DollarSign className="w-10 h-10 text-primary opacity-20" />
          </div>
          <p className="text-xs text-gray-500 mt-2">{totalCount} records</p>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <h3 className="text-2xl font-bold text-orange-600">
                {expenses.filter(e => e.status === 'PENDING').length}
              </h3>
            </div>
            <Clock className="w-10 h-10 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
              <h3 className="text-2xl font-bold text-green-600">
                {expenses.filter(e => e.status === 'APPROVED').length}
              </h3>
            </div>
            <CheckCircle className="w-10 h-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
              <h3 className="text-2xl font-bold text-red-600">
                {expenses.filter(e => e.status === 'REJECTED').length}
              </h3>
            </div>
            <XCircle className="w-10 h-10 text-red-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 mr-2 text-primary" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Shop
            </label>
            <select
              value={shopFilter}
              onChange={(e) => {
                setShopFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Shops</option>
              {shops.map((shop) => (
                <option key={shop.id} value={shop.id.toString()}>
                  {shop.shopName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Period
            </label>
            <select
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All</option>
              <option value="RENT">Rent</option>
              <option value="UTILITIES">Utilities</option>
              <option value="SUPPLIES">Supplies</option>
              <option value="MARKETING">Marketing</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Expense Analytics</h3>
            <select
              value={analyticsGroupBy}
              onChange={(e) => setAnalyticsGroupBy(e.target.value)}
              className="px-3 py-1 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark text-xs"
            >
              <option value="paymentMethod">By Payment Method</option>
              <option value="category">By Category</option>
            </select>
          </div>
          {analyticsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" name="Total Amount" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No analytics data</p>
          )}
        </div>

        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Budget Utilization by Category</h3>
          {budgetData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="total"
                  label
                >
                  {budgetData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-8">No budget data</p>
          )}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-meta-4 border-b border-gray-200 dark:border-meta-4">
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">#</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Description</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Category</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Payment</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="h-20 text-center">
                    <div className="flex justify-center items-center">
                      <CircularProgress />
                    </div>
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              ) : (
                expenses.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className="border-b border-gray-200 dark:border-meta-4 hover:bg-gray-50 dark:hover:bg-meta-4"
                  >
                    <td className="p-4 text-sm">{(currentPage - 1) * 10 + index + 1}</td>
                    <td className="p-4 text-sm font-medium max-w-xs truncate">{expense.description}</td>
                    <td className="p-4 text-sm font-semibold">{formatCurrency(expense.amount)}</td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{expense.paymentMethod}</td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : expense.status === 'REJECTED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {format(new Date(expense.expenseDate), 'dd MMM, yyyy')}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailModal(expense)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-boxdark-2 rounded text-blue-600"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {expense.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(expense.id)}
                              disabled={submitting}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-boxdark-2 rounded text-green-600 disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setRejectingExpense(expense);
                                setRejectModalOpen(true);
                              }}
                              disabled={submitting}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-boxdark-2 rounded text-red-600 disabled:opacity-50"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row justify-between items-center p-4 bg-gray-50 dark:bg-meta-4 gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Showing page <span className="font-semibold text-primary">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total: <span className="font-semibold">{totalCount}</span> expenses
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white dark:bg-boxdark border border-gray-300 dark:border-meta-4 rounded-lg hover:bg-gray-100 dark:hover:bg-boxdark-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="First Page"
              >
                ««
              </button>
              
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-white dark:bg-boxdark border border-gray-300 dark:border-meta-4 rounded-lg hover:bg-gray-100 dark:hover:bg-boxdark-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="Previous Page"
              >
                ‹ Prev
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-white'
                        : 'bg-white dark:bg-boxdark border border-gray-300 dark:border-meta-4 hover:bg-gray-100 dark:hover:bg-boxdark-2'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white dark:bg-boxdark border border-gray-300 dark:border-meta-4 rounded-lg hover:bg-gray-100 dark:hover:bg-boxdark-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="Next Page"
              >
                Next ›
              </button>
              
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-white dark:bg-boxdark border border-gray-300 dark:border-meta-4 rounded-lg hover:bg-gray-100 dark:hover:bg-boxdark-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title="Last Page"
              >
                »»
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onClose={() => setDetailModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle className="bg-boxdark/95">
          <div className="flex justify-between items-center">
            <span className="text-title-sm font-medium text-black dark:text-white">Expense Details</span>
            <button onClick={() => setDetailModalOpen(false)} className="p-1 hover:bg-gray dark:hover:bg-boxdark-2 rounded-full">
              <X className="w-5 h-5 text-body dark:text-bodydark" />
            </button>
          </div>
        </DialogTitle>
        <DialogContent className="dark:bg-boxdark">
          {selectedExpense && (
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-sm font-medium text-black dark:text-white">{selectedExpense.description}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-sm font-semibold text-primary">{formatCurrency(selectedExpense.amount)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                  <p className="text-sm text-black dark:text-white">{selectedExpense.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Subcategory</p>
                  <p className="text-sm text-black dark:text-white">{selectedExpense.subcategory || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="text-sm text-black dark:text-white">{selectedExpense.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                  <p className="text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedExpense.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : selectedExpense.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {selectedExpense.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vendor</p>
                  <p className="text-sm text-black dark:text-white">{selectedExpense.vendorName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Vendor Contact</p>
                  <p className="text-sm text-black dark:text-white">{selectedExpense.vendorContact || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Shop</p>
                  <p className="text-sm text-black dark:text-white">{selectedExpense.shops.shopName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Processed By</p>
                  <p className="text-sm text-black dark:text-white">{selectedExpense.actors.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Expense Date</p>
                  <p className="text-sm text-black dark:text-white">
                    {format(new Date(selectedExpense.expenseDate), 'dd MMM, yyyy HH:mm')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                  <p className="text-sm text-black dark:text-white">
                    {format(new Date(selectedExpense.createdAt), 'dd MMM, yyyy HH:mm')}
                  </p>
                </div>
                {selectedExpense.approvedBy && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Approved By</p>
                    <p className="text-sm text-black dark:text-white">{selectedExpense.approvedBy.name}</p>
                  </div>
                )}
                {selectedExpense.approvedAt && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Approved At</p>
                    <p className="text-sm text-black dark:text-white">
                      {format(new Date(selectedExpense.approvedAt), 'dd MMM, yyyy HH:mm')}
                    </p>
                  </div>
                )}
                {selectedExpense.rejectionReason && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rejection Reason</p>
                    <p className="text-sm text-red-600">{selectedExpense.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={rejectModalOpen} onClose={() => setRejectModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="bg-boxdark/95">
          <div className="flex justify-between items-center">
            <span className="text-title-sm font-medium text-black dark:text-white">Reject Expense</span>
            <button onClick={() => setRejectModalOpen(false)} className="p-1 hover:bg-gray dark:hover:bg-boxdark-2 rounded-full">
              <X className="w-5 h-5 text-body dark:text-bodydark" />
            </button>
          </div>
        </DialogTitle>
        <DialogContent className="dark:bg-boxdark">
          {rejectingExpense && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
                <p className="text-sm font-medium text-black dark:text-white">{rejectingExpense.description}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Amount</p>
                <p className="text-sm font-semibold text-primary">{formatCurrency(rejectingExpense.amount)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter reason for rejection..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setRejectModalOpen(false);
                    setRejectingExpense(null);
                    setRejectReason('');
                  }}
                  className="px-4 py-2 text-body dark:text-bodydark bg-gray dark:bg-boxdark-2 rounded-lg hover:bg-gray-2 dark:hover:bg-boxdark transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={submitting || !rejectReason.trim()}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Reject Expense'}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseManager;
