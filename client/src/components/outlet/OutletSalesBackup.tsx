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
  Users,
  ArrowUp,
  ArrowDown,
  Calendar,
  CreditCard,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import Message from '../alerts/Message';
import ModalAlert from '../alerts/Alert';

// Interface definitions
interface FinanceDetails {
  financeStatus: string;
  financeAmount: number;
  financer: string;
}

interface Sale {
  soldprice: number;
  netprofit: number;
  commission: number;
  productcost: string;
  productmodel: string;
  productname: string;
  totalnetprice: number;
  totalsoldunits: number;
  totaltransaction: number;
  _id: {
    productId: number;
    sellerId: number;
    shopId: number;
  };
  financeDetails: FinanceDetails;
  CategoryId: number;
  createdAt: string;
  batchNumber: string;
  category: string;
}

interface ProductAnalytic {
  productName: string;
  totalSales: number;
  totaltransacted: number;
  netprofit: number;
}

interface SellerAnalytic {
  sellerName: string;
  totalSales: number;
  netprofit: number;
  totaltransacted: number;
}

interface SalesData {
  sales: Sale[];
  analytics: {
    analytics: {
      sellerAnalytics: SellerAnalytic[];
      productAnalytics: ProductAnalytic[];
      totalProducts: number;
      totalSellers: number;
    };
  };
  salesPerMonth: any[];
  totalSales: number;
  totalProfit: number;
  totalCommission: number;
  totalfinanceSalesPending: number;
  totalPages: number;
  currentPage: number;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: SalesData;
}

interface StatCardProps {
  title: string;
  value: any;
  secondaryValue?: string;
  icon: any;
  trend?: number;
  valueType: string;
}

interface ProfitableProduct {
  name: string;
  model: string;
  category: string;
  sales: number;
  units: number;
  profit: number;
  profitMargin: number;
}

// Tab Button Component
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

const OutletSalesBackup = () => {
  // Stat Card Component
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
          {loading ? <CircularProgress size={24} /> : value}
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
  const [timeFrame, setTimeFrame] = useState('month');
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [financeFilter, setFinanceFilter] = useState('all');

  // Get token from local storage
  const token = localStorage.getItem('tk');
  const user: DecodedToken | null = token ? jwt_decode(token) : null;

  // Fetch sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      try {
        // Use shopId 1 as in the sample data
        const shopId = 1;
        const response = await axios.get<ApiResponse>(
          `${
            import.meta.env.VITE_SERVER_HEAD
          }/api/sales/user/${user?.id}?period=${timeFrame}`,
          { withCredentials: true },
        );

        if (response.data.success) {
			console.log(response.data.data);
			
          setSalesData(response.data.data);
          setMessage({
            text: 'Sales data fetched successfully',
            type: 'success',
          });
          setError(null);
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
            'Failed to fetch sales data',
        );
        setMessage({
          text:
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch sales data',
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeFrame]);

  // Calculate metrics from sales data
  const calculateMetrics = () => {
    if (!salesData || !salesData.sales || salesData.sales.length === 0) {
      return {
        totalSales: 0,
        totalUnits: 0,
        totalCommission: 0,
        totalProfit: 0,
        avgTicketSize: 0,
        totalPendingFinance: 0,
        productMetrics: [],
        categoryMetrics: [],
        financerMetrics: [],
        mostProfitableProducts: [],
      };
    }

    // Get total units sold
    const totalUnits = salesData.sales.reduce(
      (sum, item) => sum + item.totaltransaction,
      0,
    );

    // Calculate average ticket size
    const avgTicketSize = salesData.totalSales / totalUnits || 0;

    // Filter sales based on finance status if filter is active
    const filteredSales = salesData.sales.filter((sale) => {
      if (financeFilter === 'all') return true;
      return sale.financeDetails.financeStatus === financeFilter;
    });

    // Calculate product metrics
    const productData = new Map();
    filteredSales.forEach((item) => {
      const productKey = item.productname;
      if (!productData.has(productKey)) {
        productData.set(productKey, {
          name: item.productname,
          sales: 0,
          units: 0,
          profit: 0,
          model: item.productmodel,
          category: item.category,
          cost: parseFloat(item.productcost),
        });
      }
      const product = productData.get(productKey);
      product.sales += item.soldprice;
      product.units += item.totaltransaction;
      product.profit += item.netprofit;
    });

    // Convert Map to Array
    const productMetrics = Array.from(productData.values());

    // Calculate profit margin and find most profitable products
    const profitableProducts: ProfitableProduct[] = productMetrics
      .map((product) => ({
        ...product,
        profitMargin: (product.profit / product.sales) * 100,
      }))
      .sort((a, b) => b.profitMargin - a.profitMargin);

    // Calculate category metrics
    const categoryData = new Map();
    filteredSales.forEach((item) => {
      const categoryKey = item.category;
      if (!categoryData.has(categoryKey)) {
        categoryData.set(categoryKey, {
          name: item.category,
          sales: 0,
          units: 0,
          profit: 0,
        });
      }
      const category = categoryData.get(categoryKey);
      category.sales += item.soldprice;
      category.units += item.totaltransaction;
      category.profit += item.netprofit;
    });

    // Convert category Map to Array
    const categoryMetrics = Array.from(categoryData.values());

    // Calculate financier metrics
    const financerData = new Map();
    filteredSales.forEach((item) => {
      const financerKey = item.financeDetails.financer || 'None';
      if (!financerData.has(financerKey)) {
        financerData.set(financerKey, {
          name: financerKey,
          count: 0,
          amount: 0,
          sales: 0,
        });
      }
      const financer = financerData.get(financerKey);
      financer.count += 1;
      financer.amount += item.financeDetails.financeAmount;
      financer.sales += item.soldprice;
    });

    // Convert financier Map to Array
    const financerMetrics = Array.from(financerData.values());

    // Calculate pending finance amount
    const totalPendingFinance = salesData.sales
      .filter((sale) => sale.financeDetails.financeStatus === 'pending')
      .reduce((sum, sale) => sum + sale.financeDetails.financeAmount, 0);

    return {
      totalSales: salesData.totalSales,
      totalUnits,
      totalCommission: salesData.totalCommission,
      totalProfit: salesData.totalProfit,
      avgTicketSize,
      totalPendingFinance,
      productMetrics,
      categoryMetrics,
      financerMetrics,
      mostProfitableProducts: profitableProducts.slice(0, 5),
    };
  };

  const metrics = calculateMetrics();

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Generate colors for charts
  const COLORS = [
    '#42C8B7',
    '#80CAEE',
    '#10B981',
    '#FFBA00',
    '#FF6766',
    '#8884d8',
    '#82ca9d',
  ];

  // Render loading state
  if (loading && !salesData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size={50} />
      </div>
    );
  }

  // Render error state
  if (error && !salesData) {
    return (
      <ModalAlert message={`Error: ${error}`} onClose={() => setError(null)} />
    );
  }

  return (
    <div className="md:px-4 py-8">
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Header Section */}
      <div className="mb-8">
        <div>
          <h1 className="text-title-lg font-bold text-black dark:text-white mb-2">
            Sales Analytics Dashboard
          </h1>
          <p className="text-bodydark">
            Comprehensive sales performance insights for your business
          </p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-bodydark" />
              <select
                value={timeFrame}
                onChange={(e) => setTimeFrame(e.target.value)}
                className="border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none appearance-none"
              >
                <option value="day">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-bodydark" />
              <select
                value={financeFilter}
                onChange={(e) => setFinanceFilter(e.target.value)}
                className="border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none appearance-none"
              >
                <option value="all">All Finance</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-meta-4 rounded-md px-4 py-2 text-sm">
            <span className="font-medium">Last Updated:</span>{' '}
            {salesData ? formatDate(new Date().toISOString()) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 text-sm md:text-lg lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={metrics.totalSales.toLocaleString()}
          valueType="currency"
          icon={DollarSign}
        />
        <StatCard
          title="Net Profit"
          value={metrics.totalProfit.toLocaleString()}
          valueType="currency"
          icon={TrendingUp}
        />
        <StatCard
          title="Products Sold"
          value={`${
            metrics.productMetrics.length
          } / ${metrics.totalUnits?.toLocaleString()}`}
          valueType="number"
          secondaryValue={`Avg. ticket: ${metrics.avgTicketSize?.toLocaleString()}`}
          icon={Package}
        />
        <StatCard
          title="Finance Pending"
          value={metrics.totalPendingFinance.toLocaleString()}
          valueType="currency"
          secondaryValue={`${metrics.financerMetrics.length} financiers`}
          icon={CreditCard}
        />
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-stroke dark:border-strokedark mb-6">
        <div className="flex space-x-4 overflow-x-auto">
          <TabButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
            Overview
          </TabButton>
          <TabButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
            Products
          </TabButton>
          <TabButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
            Financing
          </TabButton>
          <TabButton selected={activeTab === 3} onClick={() => setActiveTab(3)}>
            Sellers
          </TabButton>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Category Distribution Chart */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-xs md:text-title-sm font-semibold mb-4 text-black dark:text-white">
              Category Revenue Distribution
            </h2>
            <div className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <CircularProgress />
                </div>
              ) : metrics.categoryMetrics.length === 0 ? (
                <div className="flex justify-center items-center h-full text-bodydark2">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={metrics.categoryMetrics}
                      dataKey="sales"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) =>
                        `${entry.name}: ${entry.sales.toLocaleString()}`
                      }
                    >
                      {metrics.categoryMetrics.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Product Performance Chart */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-xs md:text-title-sm font-semibold mb-4 text-black dark:text-white">
              Product Performance
            </h2>
            <div className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <CircularProgress />
                </div>
              ) : metrics.productMetrics.length === 0 ? (
                <div className="flex justify-center items-center h-full text-bodydark2">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={metrics.productMetrics.slice(0, 5)}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => value.toLocaleString()} />
                    <Bar dataKey="sales" name="Revenue" fill="#42C8B7" />
                    <Bar dataKey="profit" name="Profit" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Most Profitable Products */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark lg:col-span-2">
            <h2 className="text-title-xs md:text-title-sm font-semibold mb-4 text-black dark:text-white">
              Most Profitable Products
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                    <th className="px-4 py-3 text-left text-xs font-medium text-bodydark2 uppercase">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-bodydark2 uppercase">
                      Model
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                      Units Sold
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                      Profit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                      Margin
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {metrics.mostProfitableProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-8 text-center text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    metrics.mostProfitableProducts.map((product, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black dark:text-white">
                          {product.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black dark:text-white">
                          {product.model}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {product.units}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {product.sales.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {product.profit.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              product.profitMargin > 0
                                ? 'bg-meta-3/10 text-meta-3'
                                : 'bg-meta-1/10 text-meta-1'
                            }`}
                          >
                            {product.profitMargin.toFixed(1)}%
                          </span>
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

      {/* Products Tab */}
      {activeTab === 1 && (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-card border border-stroke dark:border-strokedark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                  <th className="px-4 py-3 text-left text-xs font-medium text-bodydark2 uppercase">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-bodydark2 uppercase">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-bodydark2 uppercase">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Units
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {metrics.productMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                ) : (
                  metrics.productMetrics.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-black dark:text-white">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-black dark:text-white">
                        {item.model}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-black dark:text-white">
                        {item.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                        {item.cost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                        {item.sales.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                        {item.units}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                        <span
                          className={
                            item.profit >= 0 ? 'text-meta-3' : 'text-meta-1'
                          }
                        >
                          {item.profit.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financing Tab */}
      {activeTab === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Financing Distribution */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-xs md:text-title-sm font-semibold mb-4 text-black dark:text-white">
              Financing Distribution
            </h2>
            <div className="h-80">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <CircularProgress />
                </div>
              ) : metrics.financerMetrics.length === 0 ? (
                <div className="flex justify-center items-center h-full text-bodydark2">
                  No financing data available
                </div>
              ) : (
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={metrics.financerMetrics}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.name}: ${entry.count}`}
                    >
                      {metrics.financerMetrics.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Finance Details */}
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-xs md:text-title-sm font-semibold mb-4 text-black dark:text-white">
              Finance Details
            </h2>
            <div className="overflow-x-auto h-80">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                    <th className="px-4 py-3 text-left text-xs font-medium text-bodydark2 uppercase">
                      Financier
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                      Transactions
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                      Sales
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {metrics.financerMetrics.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {item.count}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {item.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {item.sales.toLocaleString()}
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

      {/* Sellers Tab */}
      {activeTab === 3 && (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-card border border-stroke dark:border-strokedark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                  <th className="px-4 py-3 text-left text-xs font-medium text-bodydark2 uppercase">
                    Seller
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Transactions
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-bodydark2 uppercase">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center">
                      <CircularProgress size={24} />
                    </td>
                  </tr>
                ) : !salesData?.analytics?.analytics?.sellerAnalytics ||
                  salesData.analytics.analytics.sellerAnalytics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No seller data available
                    </td>
                  </tr>
                ) : (
                  salesData.analytics.analytics.sellerAnalytics.map(
                    (seller, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black dark:text-white">
                          {seller.sellerName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {seller.totaltransacted}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {seller.totalSales.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {seller.netprofit.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              seller.netprofit / seller.totalSales > 0.2
                                ? 'bg-meta-3/10 text-meta-3'
                                : seller.netprofit / seller.totalSales > 0.1
                                ? 'bg-meta-8/10 text-meta-8'
                                : 'bg-meta-1/10 text-meta-1'
                            }`}
                          >
                            {(
                              (seller.netprofit / seller.totalSales) *
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletSalesBackup;
