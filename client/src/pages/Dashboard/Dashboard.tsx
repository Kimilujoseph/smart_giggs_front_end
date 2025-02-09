import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  ShoppingCart,
  Users,
  DollarSign,
  Award,
  Package,
  TrendingUp,
  Target,
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

  // Sample data - replace with real data
  const [salesData, setSalesData] = useState<
    Array<
      | {
          month: string;
          sales: number;
        }
      | []
    >
  >([]);

  const [topSellers, setTopSellers] = useState<
    Array<{
      sellerName: string;
      totalSales: number;
      totaltransacted: number;
      netprofit: number;
      performance: number;
    }>
  >([]);

  const [topProducts, setTopProducts] = useState<
    Array<{
      productName: string;
      totalSales: number;
      totaltransacted: number;
      netprofit: number;
      performance: number;
    }>
  >([]);
  const [analyticsData, setAnalyticsData] = useState<any>({});

  // Calculate sales meter percentage (example)
  const salesTarget = 1000000;
  const calcMeterPercentage =
    (analyticsData.totalSales / salesTarget) * 100 || 0;
  const meterPercentage = calcMeterPercentage > 100 ? 100 : calcMeterPercentage;

  const fetchAnalyticsData = async () => {
    try {
      // Fetch sales data
      const salesDataResponse = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/sales/all?period=year`,
        { withCredentials: true },
      );
      const analyticsReport = salesDataResponse.data.data;
      console.log(analyticsReport);
      

      setAnalyticsData(analyticsReport);
      setSalesData([...analyticsReport.salesPerMonth]);
      setTopSellers([...analyticsReport.analytics.analytics.sellerAnalytics]);
      setTopProducts(
        [...analyticsReport.analytics.analytics.productAnalytics].slice(0, 3),
      );
    } catch (error) {}
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  if (userPermissions !== 'manager' && userPermissions !== 'superuser') {
    navigate('/settings');
    return null;
  }

  return (
    <div className="p-6 w-full">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
        <div className="bg-blue-100 p-3 rounded-lg float-right flex">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          <div className="flex items-center justify-between">
          
            <div className='w-full flex flex-col gap-4'>
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
              <div className='flex justify-between w-full'>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Direct Sales
                  </p>
                  <h3 className="text-sm font-bold mt-1">
                    {analyticsData.totalSales
                      ? `Ksh ${analyticsData.totalSales.toLocaleString()}`
                      : '-'}
                  </h3>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Financed Sales
                  </p>
                  <h3 className="text-sm font-bold mt-1">
                    {analyticsData.totalSales
                      ? `Ksh ${analyticsData.totalfinanceSalesPending.toLocaleString()}`
                      : '-'}
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl px-6 py-2 shadow-sm">
          <div className="flex items-center justify-between w-full h-full">
            <div className="w-full h-full flex flex-col justify-between">
              <div className="flex justify-between items-center w-full h-full">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Active Sellers
                  </p>
                  <h3 className="text-2xl font-bold mt-1">
                    <div>
                      <span>
                        {analyticsData?.analytics?.analytics.totalSellers
                          ? analyticsData.analytics.analytics.totalSellers.toLocaleString()
                          : 0}
                      </span>
                      {/* <span className="text-sm"> / 25</span> */}
                    </div>
                  </h3>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Sold Products
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {analyticsData?.analytics?.analytics.totalProducts
                  ? analyticsData.analytics.analytics.totalProducts.toLocaleString()
                  : '-'}
              </h3>
              <span className="text-red-500 text-sm">-2.3%</span>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                Total Transactions
              </p>
              <h3 className="text-2xl font-bold mt-1">
                {analyticsData.sales?.length || 0}
              </h3>
              <span className="text-green-500 text-sm">+4.5%</span>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-purple-600" />
            </div>
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
                  {/* Customizing gridlines */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />

                  {/* Customizing X and Y Axes */}
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />
                  <YAxis
                    tick={{ fill: '#64748B' }}
                    axisLine={{ stroke: '#475569' }}
                    tickLine={{ stroke: '#475569' }}
                  />

                  {/* Customizing Tooltip */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#4F46E5',
                      borderRadius: '8px',
                    }}
                    itemStyle={{ color: '#F1F5F9' }}
                    labelStyle={{ color: '#A5B4FC' }}
                  />

                  {/* Customizing Line */}
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

        {/* Sales Meter */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex justify-between mb-4">
            <div className="flex gap-2 items-center justify-center">
              <Target className="text-green-500" />
              <h3 className="text-lg font-semibold">Sales Target</h3>
            </div>
            <h4 className="font-semibold">{salesTarget.toLocaleString()}</h4>
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
                  // stroke="currentColor"
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
            <p className="mt-4 text-gray-400">of monthly target</p>
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
            {topSellers?.map((seller, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Avatar src="#" alt={seller.sellerName} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-300">
                      {seller.sellerName}
                    </p>
                    <p className="text-sm text-slate-400">
                      Ksh {seller.totalSales.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="w-20 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${(seller.netprofit / seller.totalSales) * 100}%`,
                    }}
                  ></div>
                  <span className="flex justify-end">
                    {((seller.netprofit / seller.totalSales) * 100).toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-boxdark rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Products</h3>
            <TrendingUp className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-4">
            {topProducts?.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-gray-500">
                      {product.totalSales} units
                    </p>
                  </div>
                </div>
                <span className="flex justify-end">
                  {((product.netprofit / product.totalSales) * 100).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
