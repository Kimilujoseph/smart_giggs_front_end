import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Activity,
  Users,
  DollarSign,
  Award,
  Package,
  TrendingUp,
  TrendingDown,
  Target,
  Smartphone,
  CreditCard,
  PieChart as PieChartIcon,
  Store,
  Briefcase,
  FileText,
  Calendar,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import axios from 'axios';
import { Avatar } from '@mui/material';

// Helper to format currency
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return 'Ksh 0';
  return `Ksh ${value.toLocaleString()}`;
};

// Date Filter Component
const DateFilter: React.FC<{
  onDateChange: (params: { period?: string; startDate?: string; endDate?: string }) => void;
}> = ({ onDateChange }) => {
  const [activePeriod, setActivePeriod] = useState('week');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  });

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    if (period !== 'custom') {
      onDateChange({ period });
    }
  };

  const handleCustomDateChange = () => {
    onDateChange({
      period: 'custom',
      startDate: customRange.start,
      endDate: customRange.end,
    });
  };

  const periods = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'year', label: 'This Year' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-white p-4 dark:bg-boxdark">
      <div className="flex items-center gap-2">
        <Calendar className="text-blue-500" />
        <h3 className="text-lg font-semibold">Filter by Period</h3>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {periods.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => handlePeriodChange(key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activePeriod === key
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-black hover:bg-gray-300 dark:bg-meta-4 dark:text-white dark:hover:bg-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {activePeriod === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-meta-4 dark:text-white"
          />
          <span className="text-gray-500">to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-black dark:border-gray-600 dark:bg-meta-4 dark:text-white"
          />
          <button
            onClick={handleCustomDateChange}
            className="rounded-md bg-green-500 px-4 py-2 text-white hover:bg-green-600"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('tk');
  if (!token) {
    localStorage.clear();
    navigate('/auth/signin');
    return null;
  }
  const decodedToken = jwt_decode<DecodedToken>(token!);
  const userPermissions = decodedToken.role;

  // State for data
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [salesReport, setSalesReport] = useState<any>(null);
  const [shopPerformance, setShopPerformance] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  
  // State for loading and error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filters
  const [filterParams, setFilterParams] = useState<string>('period=week');

  const handleDateChange = useCallback((params: { period?: string; startDate?: string; endDate?: string }) => {
    if (params.period === 'custom' && params.startDate && params.endDate) {
      setFilterParams(`startDate=${params.startDate}&endDate=${params.endDate}`);
    } else if (params.period) {
      setFilterParams(`period=${params.period}`);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          financialSummaryRes,
          salesReportRes,
          shopPerformanceRes,
          topProductsRes,
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/report/financial-summary?${filterParams}`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/sales/report?${filterParams}`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/analytics/shop-performance-summary?${filterParams}`, { withCredentials: true }),
          axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/analytics/top-products?${filterParams}`, { withCredentials: true }),
        ]);

        setFinancialSummary(financialSummaryRes.data.data);
        setSalesReport(salesReportRes.data.data);
        setShopPerformance(shopPerformanceRes.data.data || []);
        setTopProducts(topProductsRes.data.data || []);

        // Process Top Sellers from sales data
        if (salesReportRes.data.data?.sales) {
          const sellers = salesReportRes.data.data.sales.reduce((acc: any, sale: any) => {
            if (!acc[sale.sellername]) {
              acc[sale.sellername] = { sellerName: sale.sellername, totalSales: 0, netprofit: 0, totaltransacted: 0 };
            }
            acc[sale.sellername].totalSales += sale.soldprice;
            acc[sale.sellername].netprofit += sale.netprofit;
            acc[sale.sellername].totaltransacted += 1;
            return acc;
          }, {});
          setTopSellers(Object.values(sellers).sort((a: any, b: any) => b.totalSales - a.totalSales));
        }

      } catch (err) {
        setError('Failed to load dashboard data. Please try adjusting the filter or refresh.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterParams]);

  const { incomeStatement, balanceSheetMetrics } = financialSummary || {};
  const {
    netOperatingIncome,
    grossProfit,
    operatingExpenses,
    costOfGoodsSold,
    totalSales,
    totalReturns,
    netRevenue,
    accruedCommission,
  } = incomeStatement || {};
  const { accountsReceivable } = balanceSheetMetrics || {};

  const expenseBreakdownData = useMemo(() => {
    if (!operatingExpenses) return [];
    return [
      { name: 'Salaries', value: operatingExpenses.salaries || 0 },
      { name: 'Commissions', value: operatingExpenses.commissions || 0 },
    ].filter(item => item.value > 0);
  }, [operatingExpenses]);

  const incomeFlowData = [
    { name: 'Total Sales', value: totalSales },
    { name: 'Returned Products', value: totalReturns },
    { name: 'Net Revenue', value: netRevenue },
    { name: 'Cost of Goods', value: -costOfGoodsSold },
    { name: 'Gross Profit', value: grossProfit },
    { name: 'Operating Expenses', value: -(operatingExpenses?.totalOperatingExpenses) },
    { name: 'Net Income', value: netOperatingIncome },
  ];

  if (userPermissions !== 'manager' && userPermissions !== 'superuser') {
    navigate('/settings');
    return null;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-red-500">
        <p className="mb-4 text-lg">{error}</p>
        <DateFilter onDateChange={handleDateChange} />
      </div>
    );
  }

  return (
    <div className="w-full p-6">
      <DateFilter onDateChange={handleDateChange} />

      {/* Executive Financial Summary */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Executive Financial Summary</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Net Operating Income */}
          <div className={`rounded-xl p-6 shadow-sm ${netOperatingIncome >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${netOperatingIncome >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>Net Operating Income</p>
                <h3 className={`mt-1 text-3xl font-bold ${netOperatingIncome >= 0 ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>{formatCurrency(netOperatingIncome)}</h3>
              </div>
              {netOperatingIncome >= 0 ? <TrendingUp className="h-8 w-8 text-green-600" /> : <TrendingDown className="h-8 w-8 text-red-600" />}
            </div>
          </div>
          {/* Net Revenue */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-slate-400">Net Revenue</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(netRevenue)}</h3>
              <DollarSign className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          {/* Gross Profit */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-slate-400">Gross Profit</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(grossProfit)}</h3>
              <Award className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
          {/* Accrued Commissions */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-slate-400">Accrued Commissions</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(accruedCommission)}</h3>
              <Award className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
          {/* Total Sales */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-slate-400">Total Sales</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(totalSales)}</h3>
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
          {/* Returned Products */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-slate-400">Returned Products</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(totalReturns)}</h3>
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
          {/* Operating Expenses */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-slate-400">Operating Expenses</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(operatingExpenses?.totalOperatingExpenses)}</h3>
              <Briefcase className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          {/* Accounts Receivable */}
          <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <p className="text-sm text-gray-500 dark:text-slate-400">Accounts Receivable</p>
            <div className="mt-2 flex items-center justify-between">
              <h3 className="text-2xl font-bold">{formatCurrency(accountsReceivable)}</h3>
              <FileText className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Financial & Sales Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        {/* Income Statement Flow */}
        <div className="lg:col-span-1 rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
          <h3 className="text-lg font-semibold mb-4">Income Flow</h3>
          <div className="space-y-2">
            {incomeFlowData.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                <span className="font-medium">{item.name}</span>
                <span className={`font-bold ${item.value >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="lg:col-span-1 rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
          <h3 className="text-lg font-semibold mb-4">Expense Breakdown</h3>
          <div className="h-60">
            {expenseBreakdownData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                    {expenseBreakdownData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={['#0088FE', '#FF8042'][index % 2]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-500">No expense data</p>}
          </div>
        </div>
        
        {/* Sales and Profit Trend */}
        <div className="lg:col-span-1 rounded-xl bg-white p-6 shadow-sm dark:bg-boxdark">
            <h3 className="text-lg font-semibold mb-4">Sales & Profit Trend</h3>
            <div className="h-60">
                {salesReport?.salesPerMonth && salesReport.salesPerMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesReport.salesPerMonth}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                            <Legend />
                            <Line type="monotone" dataKey="totalSales" stroke="#8884d8" name="Total Sales" />
                            <Line type="monotone" dataKey="totalProfit" stroke="#82ca9d" name="Total Profit" />
                        </LineChart>
                    </ResponsiveContainer>
                ) : <p className="text-center text-gray-500">Trend data not available for this period.</p>}
            </div>
        </div>
      </div>

      {/* Operational Insights */}
      <h2 className="text-2xl font-bold mb-4">Operational Insights</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Sellers</h3>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {topSellers.length > 0 ? topSellers.map((seller: any, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar src="#" alt={seller.sellerName} className="w-10 h-10" />
                  <div>
                    <p className="font-medium dark:text-slate-300">{seller.sellerName}</p>
                    <p className="text-sm text-slate-400">{formatCurrency(seller.totalSales)} ({seller.totaltransacted} sales)</p>
                  </div>
                </div>
              </div>
            )) : <p className="text-center text-gray-500">No seller data</p>}
          </div>
        </div>

        {/* Shop Performance */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Shop Performance</h3>
            <Store className="w-6 h-6 text-blue-500" />
          </div>
          <div className="h-80">
            {shopPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={shopPerformance} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tickFormatter={(val) => `${val / 1000}k`} />
                  <YAxis dataKey="shopName" type="category" width={80} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#8884d8" name="Revenue" />
                  <Bar dataKey="grossProfit" fill="#82ca9d" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-center text-gray-500">No shop data</p>}
          </div>
        </div>
      </div>
      
      {/* Recent Sales Table */}
      <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm mt-6">
        <h3 className="text-lg font-semibold mb-4">Recent Sales</h3>
        <div className="max-h-96 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Product</th>
                <th scope="col" className="px-6 py-3">Seller</th>
                <th scope="col" className="px-6 py-3">Shop</th>
                <th scope="col" className="px-6 py-3">Sold Price</th>
                <th scope="col" className="px-6 py-3">Profit</th>
                <th scope="col" className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {salesReport?.sales?.slice(0, 10).map((sale: any) => (
                <tr key={sale.saleId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <td className="px-6 py-4 font-medium">{sale.productname}</td>
                  <td className="px-6 py-4">{sale.sellername}</td>
                  <td className="px-6 py-4">{sale.shopname}</td>
                  <td className="px-6 py-4">{formatCurrency(sale.soldprice)}</td>
                  <td className="px-6 py-4 text-green-500">{formatCurrency(sale.netprofit)}</td>
                   <td className="px-6 py-4">{new Date(sale.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
           {(!salesReport?.sales || salesReport.sales.length === 0) && <p className="text-center text-gray-500 py-4">No recent sales to display.</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
