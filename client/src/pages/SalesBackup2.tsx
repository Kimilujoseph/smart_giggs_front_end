import { useEffect, useState } from 'react';
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  CreditCard,
  Filter,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '@/types/decodedToken';
import Message from '@/components/alerts/Message';
import ModalAlert from '@/components/alerts/Alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Type definitions
interface Sale {
  soldprice: number | string;
  netprofit: number;
  commission: number;
  productcost: number | string;
  productmodel?: string;
  productname?: string;
  totalnetprice: number | string;
  totalsoldunits: number;
  totaltransaction: number;
  _id: {
    productId: number;
    sellerId: number;
    shopId: number;
  };
  financeDetails: {
    financeStatus: string;
    financeAmount: number;
    financer: string;
  };
  CategoryId?: number;
  createdAt: string;
  batchNumber: string;
  category: string;
  sellername: string;
  shopname: string;
}

interface AnalyticsData {
  sellerAnalytics: {
    sellerName: string;
    totalSales: string;
    netprofit: number;
    totaltransacted: number;
  }[];
  productAnalytics: {
    productName?: string;
    totalSales: string | number;
    totaltransacted: number;
    netprofit: number;
  }[];
  totalProducts: number;
  totalSellers: number;
}

interface SalesData {
  sales: Sale[];
  analytics: {
    analytics: AnalyticsData;
  };
  salesPerMonth: any[];
  totalSales: string;
  totalProfit: number;
  totalCommission: number;
  totalfinanceSalesPending: number;
  totalPages: number;
  currentPage: number;
}

interface StatCardProps {
  title: string;
  value: any;
  secondaryValue?: string;
  icon: any;
  trend?: number;
  valueType: string;
}

const TabButton = ({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-medium transition-colors duration-200 ${
      selected
        ? 'text-primary border-b-2 border-primary'
        : 'text-bodydark hover:text-black dark:hover:text-white'
    }`}
  >
    {children}
  </button>
);

const SalesBackup2 = () => {
  const StatCard = ({
    title,
    value,
    secondaryValue,
    icon: Icon,
    trend,
    valueType,
  }: StatCardProps) => (
    <div className="bg-white rounded-lg shadow-card p-4 md:p-6 h-full border border-stroke dark:border-strokedark dark:bg-boxdark">
      <div className="flex justify-between mb-4">
        <span className="text-bodydark2 font-medium">{title}</span>
        <Icon className="text-primary w-4 h-4" />
      </div>
      <div className="space-y-2">
        {valueType === 'currency' && (
          <span className="text-sm font-bold italic text-bodydark2">KES</span>
        )}
        <div className="text-title-md font-bold text-black dark:text-white">
          {fetchingData ? <CircularProgress size={24} /> : value}
        </div>
        {secondaryValue && (
          <div className="text-bodydark text-sm">{secondaryValue}</div>
        )}
        {trend !== undefined && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <ArrowUp className="text-meta-3 w-4 h-4" />
            ) : (
              <ArrowDown className="text-meta-1 w-4 h-4" />
            )}
            <span
              className={`ml-1 ${trend > 0 ? 'text-meta-3' : 'text-meta-1'}`}
            >
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // State management
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [timeFrame, setTimeFrame] = useState('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [fetchingData, setFetchingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [financerFilter, setFinancerFilter] = useState<string | null>(null);

  // Get token and user info
  const token = localStorage.getItem('tk');
  const user: DecodedToken | null = token ? jwt_decode(token) : null;
  const isDarkMode = document.documentElement.classList.contains('dark');

  useEffect(() => {
    const fetchSalesData = async () => {
      setFetchingData(true);
      setError(null);

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/sales/all?period=${
            timeFrame === 'custom' ? selectedDate.toISOString() : timeFrame
          }${financerFilter ? `&financer=${financerFilter}` : ''}`,
          { withCredentials: true },
        );

        if (response.data.success) {
          setSalesData(response.data.data);
          setMessage({
            text: 'Sales data fetched successfully',
            type: 'success',
          });
        } else {
          throw new Error(
            response.data.message || 'Failed to fetch sales data',
          );
        }
      } catch (error: any) {
        console.error('Error fetching sales data:', error);

        setError(
          error.response?.data?.message ||
            error.message ||
            'An error occurred while fetching sales data',
        );

        setMessage({
          text:
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch sales',
          type: error.response?.status === 404 ? 'warning' : 'error',
        });
      } finally {
        setFetchingData(false);
      }
    };

    fetchSalesData();
  }, [timeFrame, selectedDate, financerFilter]);

  // Calculate metrics from sales data
  const calculateMetrics = () => {
    if (!salesData?.sales || salesData.sales.length === 0) {
      return {
        totalSales: 0,
        totalUnits: 0,
        totalCommission: 0,
        totalProfit: 0,
        totalPendingFinance: 0,
        avgTicketSize: 0,
        productMetrics: [],
        categoryMetrics: [],
        financerMetrics: [],
      };
    }

    // Parse totalSales correctly by handling string values
    const parsedTotalSales =
      typeof salesData.totalSales === 'string'
        ? parseInt(salesData.totalSales.replace(/[^\d]/g, ''))
        : salesData.totalSales;

    // Calculate total units sold
    const totalUnits = salesData.sales.reduce(
      (sum, item) => sum + item.totaltransaction,
      0,
    );

    // Calculate average ticket size
    const avgTicketSize = parsedTotalSales / totalUnits || 0;

    // Calculate product metrics
    const productData = new Map();
    salesData.sales.forEach((item) => {
      const productKey = item.productname || 'Accessory';
      if (!productData.has(productKey)) {
        productData.set(productKey, {
          name: item.productname || 'Accessory',
          sales: 0,
          units: 0,
          profit: 0,
          model: item.productmodel || '-',
          category: item.category || '-',
        });
      }
      const product = productData.get(productKey);
      const soldPrice =
        typeof item.soldprice === 'string'
          ? parseInt(item.soldprice.replace(/[^\d]/g, ''))
          : item.soldprice;

      product.sales += soldPrice;
      product.units += item.totaltransaction;
      product.profit += item.netprofit;
    });
    const productMetrics = Array.from(productData.values());

    // Calculate category metrics
    const categoryData = new Map();
    salesData.sales.forEach((item) => {
      const categoryKey = item.category || 'Unknown';
      if (!categoryData.has(categoryKey)) {
        categoryData.set(categoryKey, {
          name: item.category || 'Unknown',
          sales: 0,
          units: 0,
          profit: 0,
        });
      }
      const category = categoryData.get(categoryKey);
      const soldPrice =
        typeof item.soldprice === 'string'
          ? parseInt(item.soldprice.replace(/[^\d]/g, ''))
          : item.soldprice;

      category.sales += soldPrice;
      category.units += item.totaltransaction;
      category.profit += item.netprofit;
    });
    const categoryMetrics = Array.from(categoryData.values());

    // Calculate financer metrics
    const financerData = new Map();
    salesData.sales.forEach((item) => {
      const financerKey = item.financeDetails.financer || 'None';
      if (!financerData.has(financerKey)) {
        financerData.set(financerKey, {
          name: item.financeDetails.financer || 'None',
          sales: 0,
          amount: 0,
          count: 0,
          pending: 0,
          paid: 0,
        });
      }
      const financer = financerData.get(financerKey);
      const soldPrice =
        typeof item.soldprice === 'string'
          ? parseInt(item.soldprice.replace(/[^\d]/g, ''))
          : item.soldprice;

      financer.sales += soldPrice;
      financer.amount += item.financeDetails.financeAmount;
      financer.count += 1;

      if (item.financeDetails.financeStatus === 'pending') {
        financer.pending += 1;
      } else if (item.financeDetails.financeStatus === 'paid') {
        financer.paid += 1;
      }
    });
    const financerMetrics = Array.from(financerData.values());

    return {
      totalSales: parsedTotalSales,
      totalUnits,
      totalCommission: salesData.totalCommission,
      totalProfit: salesData.totalProfit,
      totalPendingFinance: salesData.totalfinanceSalesPending,
      avgTicketSize,
      productMetrics,
      categoryMetrics,
      financerMetrics,
    };
  };

  const metrics = calculateMetrics();

  // Get unique financers for filter
  const getUniqueFinancers = () => {
    if (!salesData?.sales) return [];

    const financers = new Set();
    salesData.sales.forEach((sale) => {
      if (sale.financeDetails?.financer) {
        financers.add(sale.financeDetails.financer);
      }
    });

    return Array.from(financers) as string[];
  };

  const uniqueFinancers = getUniqueFinancers();

  // Error display component
  const ErrorDisplay = () => (
    <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 flex items-start gap-4">
      <AlertCircle className="text-red-500 mt-1 w-6 h-6 flex-shrink-0" />
      <div>
        <h3 className="text-red-700 dark:text-red-400 font-medium mb-2">
          Error Loading Data
        </h3>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-700 dark:text-red-200 px-4 py-2 rounded-md transition-colors font-medium"
        >
          Retry
        </button>
      </div>
    </div>
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark animate-pulse"
          >
            <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-8 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark"
          >
            <div className="h-4 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-64 w-full bg-gray-100 dark:bg-gray-800 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="md:px-4 py-8">
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="mb-8">
        <div>
          <h1 className="text-title-lg font-bold text-black dark:text-white mb-2">
            Sales Analytics
          </h1>
          <p className="text-bodydark">
            Comprehensive sales performance insights for{' '}
            {timeFrame === 'day'
              ? 'today'
              : timeFrame === 'week'
              ? 'the past week'
              : timeFrame === 'month'
              ? 'the past month'
              : timeFrame === 'year'
              ? 'the past year'
              : 'selected date'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <Filter className="text-bodydark w-4 h-4" />
            <select
              value={financerFilter || ''}
              onChange={(e) => setFinancerFilter(e.target.value || null)}
              className="border-stroke dark:border-strokedark bg-transparent rounded-md px-3 py-1.5 text-sm focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none appearance-none"
            >
              <option value="">All Financers</option>
              {uniqueFinancers.map((financer) => (
                <option key={financer} value={financer}>
                  {financer}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date | null) => {
                if (date) {
                  setSelectedDate(date);
                  setTimeFrame('custom');
                }
              }}
              dateFormat="d MMM yyyy"
              className="cursor-pointer border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none appearance-none"
            />
            <select
              value={timeFrame}
              onChange={(e) => {
                setTimeFrame(e.target.value);
                if (e.target.value !== 'custom') {
                  setSelectedDate(new Date());
                }
              }}
              className="border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none appearance-none"
            >
              <option value="day">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <ErrorDisplay />
      ) : fetchingData ? (
        <LoadingSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-2 text-sm md:text-lg lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            <StatCard
              title="Total Revenue"
              value={metrics.totalSales?.toLocaleString()}
              valueType="currency"
              icon={DollarSign}
            />
            <StatCard
              title="Net Profit"
              value={metrics.totalProfit?.toLocaleString() || '-'}
              valueType="currency"
              icon={TrendingUp}
            />
            <StatCard
              title="Total Units Sold"
              value={metrics.totalUnits?.toLocaleString() || '-'}
              valueType="number"
              secondaryValue={`Avg. ticket: ${Math.round(
                metrics.avgTicketSize,
              ).toLocaleString()}`}
              icon={Package}
            />
            <StatCard
              title="Finance Status"
              value={metrics.totalPendingFinance?.toLocaleString() || '0'}
              secondaryValue="Pending finance amount"
              valueType="currency"
              icon={CreditCard}
            />
          </div>

          <div className="border-b border-stroke dark:border-strokedark mb-6">
            <div className="flex space-x-4">
              <TabButton
                selected={activeTab === 0}
                onClick={() => setActiveTab(0)}
              >
                Overview
              </TabButton>
              <TabButton
                selected={activeTab === 1}
                onClick={() => setActiveTab(1)}
              >
                Products
              </TabButton>
              <TabButton
                selected={activeTab === 2}
                onClick={() => setActiveTab(2)}
              >
                Financing
              </TabButton>
            </div>
          </div>

          {activeTab === 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
                <h2 className="text-title-xs md:text-title-sm lg:text-title-md font-semibold mb-4 text-black dark:text-white">
                  Category Revenue Distribution
                </h2>
                <div className="h-80">
                  {metrics.categoryMetrics.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-bodydark2">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={metrics.categoryMetrics}
                          dataKey="sales"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {metrics.categoryMetrics.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  '#42C8B7',
                                  '#80CAEE',
                                  '#10B981',
                                  '#FFBA00',
                                  '#FF6766',
                                ][index % 5]
                              }
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) =>
                            `KES ${Number(value).toLocaleString()}`
                          }
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
                <h2 className="text-title-xs md:text-title-sm lg:text-title-md font-semibold mb-4 text-black dark:text-white">
                  Product Revenue Comparison
                </h2>
                <div className="h-80">
                  {metrics.productMetrics.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-bodydark2">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={metrics.productMetrics.slice(0, 5)}
                        margin={{ bottom: 40 }}
                      >
                        <XAxis
                          className="text-xs"
                          dataKey="name"
                          angle={-25}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis className="text-xs" />
                        <Tooltip
                          cursor={{
                            fill: isDarkMode ? '#1A222C' : '##F1F5F9',
							fillOpacity: 0.2,
                            radius: 4,
                          }}
						  contentStyle={{
							backgroundColor: isDarkMode ? '#1A222C' : '#F1F5F9',
							border: 'none',
							borderRadius: '8px',
							padding: '8px',
						  }}
						  labelStyle={{
							color: isDarkMode ? '#F1F5F9' : '#1A222C',
							fontSize: '12px',
							fontWeight: 'bold',
						  }}
						  itemStyle={{
							color: isDarkMode ? '#F1F5F9' : '#1A222C',
							fontSize: '12px',
							fontWeight: 'bold',
						  }}
                          formatter={(value) =>
                            `KES ${Number(value).toLocaleString()}`
                          }
                        />
                        <Bar
                          dataKey="sales"
                          name="Revenue"
                          fill="#42C8B7"
                          activeBar={false}
                        />
                        <Bar dataKey="profit" name="Profit" activeBar={false}>
                          {metrics.productMetrics
                            .slice(0, 5)
                            .map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.profit > 0 ? 'blue' : 'red'}
                              />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div className="bg-white dark:bg-boxdark rounded-lg shadow-card border border-stroke dark:border-strokedark overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                        Product
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                        Model
                      </th>
                      <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                        Category
                      </th>
                      <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                        Revenue
                      </th>
                      <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                        Units
                      </th>
                      <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                        Profit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stroke dark:divide-strokedark">
                    {metrics.productMetrics.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-8 text-center text-gray-500"
                        >
                          No data available
                        </td>
                      </tr>
                    ) : (
                      metrics.productMetrics.map((item, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                        >
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                            {item.name || 'Unknown'}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                            {item.model || '-'}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                            {item.category || '-'}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                            {item.sales.toLocaleString()}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                            {item.units}
                          </td>
                          <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                            {item.profit.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
                <h2 className="text-title-xs md:text-title-sm lg:text-title-md font-semibold mb-4 text-black dark:text-white">
                  Financing Overview
                </h2>
                <div className="h-80">
                  {metrics.financerMetrics.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-bodydark2">
                      No financing data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={metrics.financerMetrics}
                        layout="vertical"
                        margin={{ left: 80 }}
                      >
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip
                          formatter={(value) =>
                            `${Number(value).toLocaleString()}`
                          }
                        />
                        <Bar
                          dataKey="sales"
                          name="Total Sales"
                          fill="#42C8B7"
                        />
                        <Bar
                          dataKey="amount"
                          name="Finance Amount"
                          fill="#80CAEE"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-boxdark rounded-lg shadow-card border border-stroke dark:border-strokedark overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                        <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                          Financer
                        </th>
                        <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                          Total Sales
                        </th>
                        <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                          Finance Amount
                        </th>
                        <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                          Transactions
                        </th>
                        <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                          Pending
                        </th>
                        <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                          Paid
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stroke dark:divide-strokedark">
                      {metrics.financerMetrics.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-gray-500"
                          >
                            No financing data available
                          </td>
                        </tr>
                      ) : (
                        metrics.financerMetrics.map((item, index) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                          >
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                              {item.name}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                              {item.sales.toLocaleString()}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                              {item.amount.toLocaleString()}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                              {item.count}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                              {item.pending}
                            </td>
                            <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                              {item.paid}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Sales Records Table - For all tabs */}
          <div className="mt-6 bg-white dark:bg-boxdark rounded-lg shadow-card border border-stroke dark:border-strokedark overflow-hidden">
            <div className="px-6 py-4 border-b border-stroke dark:border-strokedark flex justify-between items-center">
              <h2 className="text-title-sm font-semibold text-black dark:text-white">
                Sales Records
              </h2>
              <span className="text-xs text-bodydark bg-bodydark/10 dark:bg-bodydark2/20 px-2 py-1 rounded">
                {salesData?.sales?.length || 0} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                      Date
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                      Product
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                      Shop
                    </th>
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                      Seller
                    </th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                      Units
                    </th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                      Revenue
                    </th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                      Profit
                    </th>
                    <th className="px-4 md:px-6 py-4 text-center text-xs font-medium text-bodydark2 uppercase">
                      Finance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {!salesData?.sales || salesData.sales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-8 text-center text-gray-500"
                      >
                        No sales records found
                      </td>
                    </tr>
                  ) : (
                    salesData.sales.map((sale, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {sale.productname || 'Unknown Product'}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {sale.shopname || '-'}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {sale.sellername || '-'}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {sale.totaltransaction}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {typeof sale.soldprice === 'string'
                            ? sale.soldprice
                            : sale.soldprice?.toLocaleString()}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {sale.netprofit?.toLocaleString()}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-center">
                          {sale.financeDetails?.financer ? (
                            <span
                              className={`px-2 py-1 rounded text-xs ${
                                sale.financeDetails.financeStatus === 'pending'
                                  ? 'bg-warning/10 text-warning'
                                  : 'bg-success/10 text-success'
                              }`}
                            >
                              {sale.financeDetails.financeStatus === 'pending'
                                ? 'Pending'
                                : 'Paid'}
                            </span>
                          ) : (
                            <span className="text-xs text-bodydark">None</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {salesData?.totalPages && salesData.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-stroke dark:border-strokedark flex justify-between items-center">
                <div className="text-sm text-bodydark">
                  Showing page {salesData.currentPage} of {salesData.totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      // Pagination logic would go here
                    }}
                    disabled={salesData.currentPage <= 1}
                    className={`px-3 py-1 rounded text-sm ${
                      salesData.currentPage <= 1
                        ? 'bg-gray-100 text-bodydark cursor-not-allowed dark:bg-boxdark-2'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      // Pagination logic would go here
                    }}
                    disabled={salesData.currentPage >= salesData.totalPages}
                    className={`px-3 py-1 rounded text-sm ${
                      salesData.currentPage >= salesData.totalPages
                        ? 'bg-gray-100 text-bodydark cursor-not-allowed dark:bg-boxdark-2'
                        : 'bg-primary text-white hover:bg-primary/90'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export Options */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                // Export logic would go here
              }}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Export Report
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesBackup2;
