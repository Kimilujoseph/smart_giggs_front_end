import React, { useState, useEffect } from 'react';
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
  Target,
  Smartphone,
  CreditCard,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import axios from 'axios';
import { Avatar } from '@mui/material';

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
  const isDarkMode = document.documentElement.classList.contains('dark');

  const [salesData, setSalesData] = useState<
    Array<{ month: string; sales: number }>
  >([]);
  const [topSellers, setTopSellers] = useState<
    Array<{
      sellerName: string;
      totalSales: number;
      totaltransacted: number;
      netprofit: number;
    }>
  >([]);
  const [topProducts, setTopProducts] = useState<
    Array<{
      productName: string;
      totalSales: number;
      totaltransacted: number;
      netprofit: number;
    }>
  >([]);
  const [analyticsData, setAnalyticsData] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate finance data
  const [financeData, setFinanceData] = useState<
    Array<{
      name: string;
      value: number;
      color: string;
    }>
  >([]);

  // Fixed salesTarget based on your specific business goals
  const salesTarget = 2000000;
  const calcMeterPercentage = analyticsData.totalSales
    ? (parseFloat(analyticsData.totalSales) / salesTarget) * 100
    : 0;
  const meterPercentage = calcMeterPercentage > 100 ? 100 : calcMeterPercentage;

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const salesDataResponse = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/sales/all?period=year`,
        { withCredentials: true },
      );

      const analyticsReport = salesDataResponse.data.data;
      // Properly format totalSales value
      let totalSalesValue = analyticsReport.totalSales;
      // Check if it's a string with repeated numbers (as seen in the sample data)
      if (typeof totalSalesValue === 'string' && totalSalesValue.length > 10) {
        // Take just the first portion that seems reasonable
        totalSalesValue = parseInt(totalSalesValue.substring(0, 7));
      }

      // Update analytics data with corrected total sales
      setAnalyticsData({
        ...analyticsReport,
        totalSales: totalSalesValue,
      });

      // Create monthly sales data (if empty in the response)
      if (analyticsReport.salesPerMonth.length === 0) {
        // Create sample data based on actual sales dates
        const salesByMonth: Record<string, number> = {};
        analyticsReport.sales.forEach((sale: any) => {
          const date = new Date(sale.createdAt);
          const monthYear = `${date.toLocaleString('default', {
            month: 'short',
          })} ${date.getFullYear()}`;

          if (!salesByMonth[monthYear]) {
            salesByMonth[monthYear] = 0;
          }
          salesByMonth[monthYear] += sale.soldprice;
        });

        const monthlyData = Object.keys(salesByMonth).map((month) => ({
          month,
          sales: salesByMonth[month],
        }));

        setSalesData(monthlyData.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()));
      } else {
        setSalesData([...analyticsReport.salesPerMonth]);
      }

      if (analyticsReport.analytics?.analytics?.sellerAnalytics) {
        setTopSellers([...analyticsReport.analytics.analytics.sellerAnalytics]);
      }

      if (analyticsReport.analytics?.analytics?.productAnalytics) {
        setTopProducts(
          [...analyticsReport.analytics.analytics.productAnalytics].slice(0, 5),
        );
      }

      // Prepare finance data
      const financeStatuses: Record<string, number> = {};
      analyticsReport.sales.forEach((sale: { createdAt: string; soldprice: number; financeDetails: { financeStatus: string } }) => {
        const status = sale.financeDetails.financeStatus;
        if (!financeStatuses[status]) {
          financeStatuses[status] = 0;
        }
        financeStatuses[status] += sale.soldprice;
      });

      const financeChartData = Object.keys(financeStatuses).map(
        (status, index) => ({
          name: status.charAt(0).toUpperCase() + status.slice(1),
          value: financeStatuses[status],
          color: COLORS[index % COLORS.length],
        }),
      );

      setFinanceData(financeChartData);
    } catch (error) {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (userPermissions !== 'manager' && userPermissions !== 'superuser') {
    navigate('/settings');
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  // Calculate pending finance amount
  const pendingFinanceAmount =
    analyticsData.sales?.reduce((total: number, sale: { financeDetails: { financeStatus: string }; soldprice: number }) => {
      if (sale.financeDetails.financeStatus === 'pending') {
        return total + sale.soldprice;
      }
      return total;
    }, 0) || 0;

  // Calculate paid finance amount
  const paidFinanceAmount =
    analyticsData.sales?.reduce((total: number, sale: { financeDetails: { financeStatus: string }; soldprice: number }) => {
      if (sale.financeDetails.financeStatus === 'paid') {
        return total + sale.soldprice;
      }
      return total;
    }, 0) || 0;

  return (
    <div className="p-6 w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Total Sales
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {analyticsData.totalSales
                  ? `Ksh ${analyticsData.totalSales.toLocaleString()}`
                  : '-'}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>From {analyticsData.sales?.length || 0} transactions</span>
            <span>
              Since{' '}
              {analyticsData.sales && analyticsData.sales.length > 0
                ? new Date(
                    analyticsData.sales[
                      analyticsData.sales.length - 1
                    ].createdAt,
                  ).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Net Profit
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {analyticsData.totalProfit
                  ? `Ksh ${analyticsData.totalProfit.toLocaleString()}`
                  : '-'}
              </h3>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Profit Margin:{' '}
              {analyticsData.totalSales && analyticsData.totalProfit
                ? `${(
                    (analyticsData.totalProfit / analyticsData.totalSales) *
                    100
                  ).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Finance Sales
              </p>
              <h3 className="text-2xl font-bold mt-1">
                Ksh {pendingFinanceAmount.toLocaleString()}
              </h3>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pending</span>
            <span>Paid: Ksh {paidFinanceAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Active Sellers
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {analyticsData?.analytics?.analytics?.totalSellers || 0}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Total Products:{' '}
              {analyticsData?.analytics?.analytics?.totalProducts || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sales Trend</h3>
          <div className="h-80">
            {salesData.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full w-full">
                <Activity className="w-12 h-12 text-bodydark2 dark:text-gray-300 mx-auto" />
                <p className="text-bodydark2 dark:text-gray-300 text-center mt-4">
                  No data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#4F46E5',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#F1F5F9' }}
                    labelStyle={{ color: '#A5B4FC' }}
                    formatter={(value) => [
                      `Ksh ${value.toLocaleString()}`,
                      'Sales',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#4F46E5"
                    strokeWidth={2}
                    activeDot={{
                      r: 6,
                      fill: '#9333EA',
                      stroke: '#FFFFFF',
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Finance Distribution */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2 items-center">
              <PieChartIcon className="text-blue-500" />
              <h3 className="text-lg font-semibold">Finance Distribution</h3>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {financeData.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 w-full">
                <Activity className="w-12 h-12 text-bodydark2 dark:text-gray-300 mx-auto" />
                <p className="text-bodydark2 dark:text-gray-300 text-center mt-4">
                  No finance data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={financeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {financeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#4F46E5',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#F1F5F9' }}
                    labelStyle={{ color: '#A5B4FC' }}

                    formatter={(value) => [
                      `Ksh ${value.toLocaleString()}`,
                      'Amount',
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 w-full">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Financed:</span>
                <span className="font-medium">
                  Ksh{' '}
                  {(pendingFinanceAmount + paidFinanceAmount).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Performance & Sales Target */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Product Performance */}
        <div className="lg:col-span-2 bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Product Performance</h3>
            <Smartphone className="w-6 h-6 text-blue-500" />
          </div>
          <div className="h-80">
            {topProducts.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full w-full">
                <Package className="w-12 h-12 text-bodydark2 dark:text-gray-300 mx-auto" />
                <p className="text-bodydark2 dark:text-gray-300 text-center mt-4">
                  No product data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topProducts}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#475569"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    dataKey="productName"
                    type="category"
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <Tooltip
                    cursor={{
                      fill: isDarkMode ? '#1A222C' : '##F1F5F9',
                      fillOpacity: 0.2,
                      radius: 4,
                    }}
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#4F46E5',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#F1F5F9' }}
                    labelStyle={{ color: '#A5B4FC' }}
                    formatter={(value) => [
                      `Ksh ${value.toLocaleString()}`,
                      'Sales',
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="totalSales" fill="#8884d8" name="Total Sales" />
                  <Bar dataKey="netprofit" fill="#82ca9d" name="Net Profit" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sales Target */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2 items-center">
              <Target className="text-green-500" />
              <h3 className="text-lg font-semibold">Sales Target</h3>
            </div>
            <h4 className="font-semibold">
              Ksh {salesTarget.toLocaleString()}
            </h4>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={`${
                    meterPercentage <= 25
                      ? 'stroke-red-500'
                      : meterPercentage > 25 && meterPercentage <= 50
                      ? 'stroke-yellow-500'
                      : meterPercentage > 50 && meterPercentage <= 75
                      ? 'stroke-green-400'
                      : 'stroke-green-500'
                  }`}
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${meterPercentage * 2.51}, 251.2`}
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <p className="text-3xl font-bold">
                  {meterPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
            <p className="mt-4 text-gray-400">of target</p>
            <div className="mt-6 w-full">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Current:</span>
                <span className="font-medium">
                  Ksh{' '}
                  {analyticsData.totalSales
                    ? analyticsData.totalSales.toLocaleString()
                    : '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining:</span>
                <span className="font-medium">
                  Ksh{' '}
                  {(
                    salesTarget - (analyticsData.totalSales || 0)
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Sellers */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Sellers</h3>
            <Award className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="space-y-4">
            {topSellers.length === 0 ? (
              <p className="text-center text-gray-500">
                No seller data available
              </p>
            ) : (
              topSellers.map((seller, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Avatar src="#" alt={seller.sellerName} />
                    </div>
                    <div>
                      <p className="font-medium dark:text-slate-300">
                        {seller.sellerName}
                      </p>
                      <p className="text-sm text-slate-400">
                        Ksh {seller.totalSales.toLocaleString()} (
                        {seller.totaltransacted} sales)
                      </p>
                    </div>
                  </div>
                  <div className="w-24">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            (seller.netprofit / seller.totalSales) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs flex justify-end mt-1">
                      {((seller.netprofit / seller.totalSales) * 100).toFixed(
                        1,
                      )}
                      % margin
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Products</h3>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-center text-gray-500">
                No product data available
              </p>
            ) : (
              topProducts.slice(0, 4).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium">{product.productName}</p>
                      <p className="text-sm text-gray-500">
                        {product.totaltransacted} units sold
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-right">
                      Ksh {product.totalSales.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 text-right">
                      Profit: Ksh {product.netprofit.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
