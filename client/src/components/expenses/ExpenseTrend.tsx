import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { TrendingUp, DollarSign, Receipt, Package } from 'lucide-react';

interface ExpenseTrendProps {
  /** API endpoint without query params (e.g., '/api/expenses/') */
  apiUrl: string;
  /** Filter parameter object (e.g., { employeeId: 2 } or { shopId: 2 }) */
  filterParam: Record<string, string | number>;
  /** Title displayed in the header */
  title?: string;
  /** Whether to show the Shop column in the table */
  showShopColumn?: boolean;
  /** Number of items per page */
  itemsPerPage?: number;
  /** Additional action to trigger refresh (e.g., after creating new expense) */
  refreshTrigger?: number;
}

interface Expense {
  id: number;
  description: string;
  amount: string;
  category: string;
  subcategory: string | null;
  expenseDate: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  paymentMethod: string;
  vendorName: string | null;
  shopId: number;
  shops?: {
    id: number;
    shopName: string;
  };
  approvedBy?: {
    id: number;
    name: string;
  } | null;
  rejectionReason: string | null;
}

interface ExpenseResponseData {
  expenses: Expense[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  totalAmount: string;
  averageAmount: string;
  minAmount: string;
  maxAmount: string;
}

const PIE_COLORS = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d', '#FF6B6B'];

const formatCurrency = (value: number | string) => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return `Ksh ${num.toLocaleString()}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED':
      return 'text-green-600 bg-green-100 dark:bg-green-900';
    case 'REJECTED':
      return 'text-red-600 bg-red-100 dark:bg-red-900';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const ExpenseTrend: React.FC<ExpenseTrendProps> = ({
  apiUrl,
  filterParam,
  title = 'Expense Trend',
  showShopColumn = false,
  itemsPerPage = 10,
  refreshTrigger = 0,
}) => {
  const [expenseData, setExpenseData] = useState<ExpenseResponseData | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const filterKey = Object.keys(filterParam)[0];
  const filterValue = filterParam[filterKey];

  useEffect(() => {
    if (!filterValue) return;

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${apiUrl}?page=${page}&limit=${itemsPerPage}&${filterKey}=${filterValue}`,
          { withCredentials: true },
        );
        setExpenseData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [filterValue, page, itemsPerPage, refreshTrigger]);

  const trendData = useMemo(() => {
    if (!expenseData?.expenses) return [];
    return expenseData.expenses
      .slice()
      .sort(
        (a, b) =>
          new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime(),
      )
      .map((exp) => ({
        date: format(new Date(exp.expenseDate), 'MMM dd'),
        amount: parseFloat(exp.amount),
        status: exp.status,
        category: exp.category,
      }));
  }, [expenseData]);

  const categoryBreakdown = useMemo(() => {
    if (!expenseData?.expenses) return [];
    const breakdown = expenseData.expenses.reduce((acc: any, exp: any) => {
      const category = exp.category || 'OTHER';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }
      acc[category].value += parseFloat(exp.amount);
      return acc;
    }, {});
    return Object.values(breakdown);
  }, [expenseData]);

  const statusCount = useMemo(() => {
    if (!expenseData?.expenses) return {};
    return expenseData.expenses.reduce((acc: any, exp: any) => {
      acc[exp.status] = (acc[exp.status] || 0) + 1;
      return acc;
    }, {});
  }, [expenseData]);

  if (!filterValue) {
    return (
      <div className="text-center text-gray-500 py-8">
        No filter parameter provided
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(expenseData?.totalAmount || '0')}
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-red-500" />
          </div>
        </div>

        <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Amount</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(expenseData?.averageAmount || '0')}
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Count</p>
              <p className="text-2xl font-bold text-blue-600">
                {expenseData?.totalCount || 0}
              </p>
            </div>
            <Receipt className="h-6 w-6 text-green-500" />
          </div>
        </div>

        <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Status Breakdown</p>
              <p className="text-sm">
                <span className="text-green-600">{statusCount['APPROVED'] || 0}</span>
                {' / '}
                <span className="text-red-600">{statusCount['REJECTED'] || 0}</span>
                {' / '}
                <span className="text-yellow-600">{statusCount['PENDING'] || 0}</span>
              </p>
            </div>
            <Package className="h-6 w-6 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="rounded-lg bg-white dark:bg-boxdark shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Expenses Over Time
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-60">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#FF6B6B"
                  name="Amount"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 h-60 flex items-center justify-center">
              No expense trend data
            </p>
          )}
        </div>

        {/* Pie Chart */}
        <div className="rounded-lg bg-white dark:bg-boxdark shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
            Expenses by Category
          </h3>
          {loading ? (
            <div className="flex items-center justify-center h-60">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
            </div>
          ) : categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {categoryBreakdown.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 h-60 flex items-center justify-center">
              No category data
            </p>
          )}
        </div>
      </div>

      {/* Table with Pagination */}
      <div className="rounded-lg bg-white dark:bg-boxdark shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Recent Expenses
          </h3>
          {expenseData && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-meta-4 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Previous
              </button>
              <span className="text-sm dark:text-bodydark">
                Page {page} of {expenseData.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((prev) => Math.min(expenseData.totalPages, prev + 1))
                }
                disabled={page === expenseData.totalPages || loading}
                className="px-3 py-1 rounded bg-gray-200 dark:bg-meta-4 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
          </div>
        ) : expenseData?.expenses && expenseData.expenses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Description</th>
                  <th scope="col" className="px-6 py-3">Category</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  {showShopColumn && (
                    <th scope="col" className="px-6 py-3">Shop</th>
                  )}
                  <th scope="col" className="px-6 py-3">Payment</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Approved By</th>
                </tr>
              </thead>
              <tbody>
                {expenseData.expenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">
                      {format(new Date(expense.expenseDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">{expense.description}</td>
                    <td className="px-6 py-4">
                      {expense.category}
                      {expense.subcategory && ` - ${expense.subcategory}`}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(expense.amount)}
                    </td>
                    {showShopColumn && (
                      <td className="px-6 py-4">
                        {expense.shops?.shopName || '-'}
                      </td>
                    )}
                    <td className="px-6 py-4">{expense.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                          expense.status,
                        )}`}
                      >
                        {expense.status}
                      </span>
                      {expense.status === 'REJECTED' &&
                        expense.rejectionReason && (
                          <p
                            className="mt-1 text-xs text-red-500"
                            title={expense.rejectionReason}
                          >
                            {expense.rejectionReason.slice(0, 30)}...
                          </p>
                        )}
                    </td>
                    <td className="px-6 py-4">
                      {expense.approvedBy?.name || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">
            No expense data available
          </p>
        )}
      </div>
    </div>
  );
};

export default ExpenseTrend;
