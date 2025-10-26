import React, { useState, useEffect, useMemo } from 'react';
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
  Store,
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

  const [salesReport, setSalesReport] = useState<any>(null);
  const [shopPerformance, setShopPerformance] = useState<any[]>([]);
  const [salesByStatus, setSalesByStatus] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topSellers, setTopSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        salesReportRes,
        shopPerformanceRes,
        salesByStatusRes,
        topProductsRes,
      ] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/sales/report?period=year`,
          { withCredentials: true },
        ),
        axios.get(
          `${
            import.meta.env.VITE_SERVER_HEAD
          }/api/analytics/shop-performance-summary?period=year`,
          { withCredentials: true },
        ),
        axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/analytics/sales-by-status`,
          { withCredentials: true },
        ),
        axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/analytics/top-products`,
          { withCredentials: true },
        ),
      ]);

      const salesReportData = salesReportRes.data.data;
      setSalesReport(salesReportData || {});
      setShopPerformance(shopPerformanceRes.data.data || []);
      setSalesByStatus(salesByStatusRes.data.data || []);
      setTopProducts(topProductsRes.data.data || []);

      // Process data for charts
      // Top Sellers
      if (salesReportData.sales) {
        const sellers = salesReportData.sales.reduce((acc: any, sale: any) => {
          if (!acc[sale.sellername]) {
            acc[sale.sellername] = {
              sellerName: sale.sellername,
              totalSales: 0,
              totaltransacted: 0,
              netprofit: 0,
            };
          }
          acc[sale.sellername].totalSales += sale.soldprice;
          acc[sale.sellername].netprofit += sale.netprofit;
          acc[sale.sellername].totaltransacted += 1;
          return acc;
        }, {});
        setTopSellers(
          Object.values(sellers).sort(
            (a: any, b: any) => b.totalSales - a.totalSales,
          ),
        );
      }
    } catch (error) {
      setError('Failed to load dashboard data.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const salesByCategoryData = useMemo(() => {
    if (!salesReport || !salesReport.sales) return [];

    const salesByCategory: Record<
      string,
      { name: string; SOLD: number; PARTIALLY_RETURNED: number; RETURNED: number;[key: string]: any; }
    > = {};

    salesReport.sales.forEach((sale: any) => {
      const category = sale.category || 'Uncategorized';
      if (!salesByCategory[category]) {
        salesByCategory[category] = {
          name: category.charAt(0).toUpperCase() + category.slice(1),
          SOLD: 0,
          PARTIALLY_RETURNED: 0,
          RETURNED: 0,
        };
      }
      // Assuming 'status' can be 'SOLD', 'PARTIALLY_RETURNED', or 'RETURNED'
      if (sale.status) {
        salesByCategory[category][sale.status] += sale.soldprice;
      }
    });

    return Object.values(salesByCategory);
  }, [salesReport]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  

  const productPerformanceData = useMemo(() => {
    if (!topProducts) return [];
    return topProducts.map((p) => ({
      ...p,
      totalSales: parseFloat(p.totalRevenue),
      netprofit: parseFloat(p.grossProfit),
    }));
  }, [topProducts]);

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
    salesReport?.sales?.reduce(
      (
        total: number,
        sale: { financeDetails: { financeStatus: string }; soldprice: number },
      ) => {
        if (sale.financeDetails.financeStatus === 'pending') {
          return total + sale.soldprice;
        }
        return total;
      },
      0,
    ) || 0;

  // Calculate paid finance amount
  const paidFinanceAmount =
    salesReport?.sales?.reduce(
      (
        total: number,
        sale: { financeDetails: { financeStatus: string }; soldprice: number },
      ) => {
        if (sale.financeDetails.financeStatus === 'paid') {
          return total + sale.soldprice;
        }
        return total;
      },
      0,
    ) || 0;

  const salesTarget = 2000000;
  const calcMeterPercentage = salesReport?.analytics?.totalSales
    ? (parseFloat(salesReport?.analytics?.totalSales) / salesTarget) * 100
    : 0;
  const meterPercentage =
    calcMeterPercentage > 100 ? 100 : calcMeterPercentage;

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
                {salesReport?.analytics?.totalSales
                  ? `Ksh ${salesReport?.analytics?.totalSales.toLocaleString()}`
                  : '-'}
              </h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>From {salesReport?.sales?.length || 0} transactions</span>
            <span>
              Since{' '}
              {salesReport && salesReport.sales.length > 0
                ? new Date(
                    salesReport.sales[
                      salesReport.sales.length - 1
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
                {salesReport?.analytics?.totalProfit
                  ? `Ksh ${salesReport?.analytics?.totalProfit.toLocaleString()}`
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
              {salesReport?.analytics?.totalSales &&
              salesReport?.analytics?.totalProfit
                ? `${(
                    (salesReport?.analytics?.totalProfit /
                      salesReport?.analytics?.totalSales) *
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
                {topSellers?.length || 0}
              </h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Products: {topProducts?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales by Category Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
          <div className="h-80">
            {salesByCategoryData.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full w-full">
                <Activity className="w-12 h-12 text-bodydark2 dark:text-gray-300 mx-auto" />
                <p className="text-bodydark2 dark:text-gray-300 text-center mt-4">
                  No data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis
                    dataKey="name"
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
                    formatter={(value: number, name: string) => [
                      `Ksh ${value.toLocaleString()}`,
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="SOLD" stackId="a" fill="#82ca9d" name="Sold" />
                  <Bar dataKey="PARTIALLY_RETURNED" stackId="a" fill="#ffc658" name="Partially Returned" />
                  <Bar dataKey="RETURNED" stackId="a" fill="#ff8042" name="Returned" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Finance Summary */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2 items-center">
              <PieChartIcon className="text-blue-500" />
              <h3 className="text-lg font-semibold">Finance Summary</h3>
            </div>
          </div>
          <div className="space-y-4">
            {(salesByStatus ?? []).map((status, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-500">
                  {status.financeStatus.charAt(0).toUpperCase() +
                    status.financeStatus.slice(1)}
                </span>
                <span className="font-medium">
                  Ksh {parseFloat(status.totalRevenue).toLocaleString()}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Total Gross Profit</span>
              <span className="font-medium">
                Ksh{' '}
                {(salesByStatus ?? [])
                  .reduce(
                    (acc, status) => acc + parseFloat(status.grossProfit),
                    0,
                  )
                  .toLocaleString()}
              </span>
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
            {productPerformanceData.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full w-full">
                <Package className="w-12 h-12 text-bodydark2 dark:text-gray-300 mx-auto" />
                <p className="text-bodydark2 dark:text-gray-300 text-center mt-4">
                  No product data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productPerformanceData}
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
                    width={100}
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
                    formatter={(value: number) => [
                      `Ksh ${value.toLocaleString()}`,
                      'Value',
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
                  {salesReport?.analytics?.totalSales
                    ? salesReport?.analytics?.totalSales.toLocaleString()
                    : '0'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remaining:</span>
                <span className="font-medium">
                  Ksh{' '}
                  {(
                    salesTarget - (salesReport?.analytics?.totalSales || 0)
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
              topSellers.map((seller: any, index) => (
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

        {/* Shop Performance */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Shop Performance</h3>
            <Store className="w-6 h-6 text-blue-500" />
          </div>
          <div className="h-80">
            {shopPerformance.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full w-full">
                <Package className="w-12 h-12 text-bodydark2 dark:text-gray-300 mx-auto" />
                <p className="text-bodydark2 dark:text-gray-300 text-center mt-4">
                  No shop data available
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={shopPerformance.map((s) => ({
                    ...s,
                    totalRevenue: parseFloat(s.totalRevenue),
                    grossProfit: parseFloat(s.grossProfit),
                  }))}
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
                    dataKey="shopName"
                    type="category"
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                    width={80}
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
                    formatter={(value: number) => [
                      `Ksh ${value.toLocaleString()}`,
                      'Value',
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="totalRevenue"
                    fill="#8884d8"
                    name="Total Revenue"
                  />
                  <Bar
                    dataKey="grossProfit"
                    fill="#82ca9d"
                    name="Gross Profit"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;