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
  ArrowUp,
  ArrowDown,
  Users,
  Percent,
  Box,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import axios, { AxiosError } from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '@/types/decodedToken';
import Message from '@/components/alerts/Message';
import ModalAlert from '@/components/alerts/Alert';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Sale {
  soldprice: number | string;
  netprofit: number;
  commission: number;
  productcost: number | string;
  productmodel: string;
  productname: string;
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
  batchNumber?: string;
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

interface SalesResponse {
  analytics: {
    analytics: AnalyticsData;
  };
  sales: Sale[];
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

const SalesBackup = () => {
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
          {fetchingSales ? (
            <CircularProgress size={24} />
          ) : valueType === 'currency' ? (
            new Intl.NumberFormat('en-KE').format(Number(value))
          ) : (
            value
          )}
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

  const [salesData, setSalesData] = useState<SalesResponse | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [timeFrame, setTimeFrame] = useState('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState(0);
  const [fetchingSales, setFetchingSales] = useState(false);
  const token = localStorage.getItem('tk');
  const [axiosError, setAxiosError] = useState<AxiosError | null>(null);
  const user: DecodedToken | null = token ? jwt_decode(token) : null;

  useEffect(() => {
    const fetchSalesData = async () => {
      setFetchingSales(true);
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_SERVER_HEAD
          }/api/sales/all?period=${timeFrame}${
            timeFrame === 'custom' ? `&date=${selectedDate.toISOString()}` : ''
          }`,
          { withCredentials: true },
        );

        if (response.status !== 200) {
          throw new Error(
            response.data.message || 'Failed to fetch sales data',
          );
        }

        const data = response.data.data;
        setSalesData(data);
        setMessage({
          text: 'Sales data fetched successfully',
          type: 'success',
        });
      } catch (error: any) {
        setAxiosError(error);
        setMessage({
          text:
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch sales data',
          type: error.response?.status === 404 ? 'warning' : 'error',
        });
      } finally {
        setFetchingSales(false);
      }
    };

    fetchSalesData();
  }, [timeFrame, selectedDate]);

  const calculateMetrics = () => {
    if (!salesData || salesData.sales.length === 0) {
      return {
        totalSales: 0,
        totalUnits: 0,
        totalCommission: 0,
        totalProfit: 0,
        avgTicketSize: 0,
        productMetrics: [],
        categoryMetrics: [],
        financeMetrics: [],
        sellerMetrics: salesData?.analytics?.analytics?.sellerAnalytics || [],
      };
    }

    const totalUnits = salesData.sales.reduce(
      (sum, item) => sum + (item.totaltransaction || 0),
      0,
    );
    const avgTicketSize = Number(salesData.totalSales) / totalUnits || 0;

    // Calculate product metrics
    const productData = new Map();
    salesData.sales.forEach((item) => {
      const productKey = item.productname || 'Unknown Product';
      if (!productData.has(productKey)) {
        productData.set(productKey, {
          name: productKey,
          sales: 0,
          units: 0,
          profit: 0,
          model: item.productmodel || 'N/A',
          category: item.category || 'Uncategorized',
        });
      }
      const product = productData.get(productKey);
      product.sales += Number(item.soldprice) || 0;
      product.units += Number(item.totaltransaction) || 0;
      product.profit += Number(item.netprofit) || 0;
    });
    const productMetrics = Array.from(productData.values());

    // Calculate category metrics
    const categoryData = new Map();
    salesData.sales.forEach((item) => {
      const categoryKey = item.category || 'Uncategorized';
      if (!categoryData.has(categoryKey)) {
        categoryData.set(categoryKey, {
          name: categoryKey,
          sales: 0,
          units: 0,
          profit: 0,
        });
      }
      const category = categoryData.get(categoryKey);
      category.sales += Number(item.soldprice) || 0;
      category.units += Number(item.totaltransaction) || 0;
      category.profit += Number(item.netprofit) || 0;
    });
    const categoryMetrics = Array.from(categoryData.values());

    // Calculate finance metrics
    const financeData = new Map();
    salesData.sales.forEach((item) => {
      const financeKey = item.financeDetails?.financer || 'Cash';
      if (!financeData.has(financeKey)) {
        financeData.set(financeKey, {
          name: financeKey,
          sales: 0,
          units: 0,
          status: item.financeDetails?.financeStatus || 'N/A',
        });
      }
      const finance = financeData.get(financeKey);
      finance.sales += Number(item.soldprice) || 0;
      finance.units += Number(item.totaltransaction) || 0;
    });
    const financeMetrics = Array.from(financeData.values());

    return {
      totalSales: salesData.totalSales,
      totalUnits,
      totalCommission: salesData.totalCommission,
      totalProfit: salesData.totalProfit,
      avgTicketSize,
      productMetrics,
      categoryMetrics,
      financeMetrics,
      sellerMetrics: salesData.analytics.analytics.sellerAnalytics,
    };
  };

  const metrics = calculateMetrics();

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (axiosError) {
    return (
      <ModalAlert
        message={`${axiosError.code || 'Error'}: ${
          axiosError.message || 'Failed to fetch data'
        }`}
        onClose={() => setAxiosError(null)}
      />
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
      
      <div className="mb-8">
        <div>
          <h1 className="text-title-lg font-bold text-black dark:text-white mb-2">
            Sales Analytics
          </h1>
          <p className="text-bodydark">
            Comprehensive sales performance insights
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
          <div className="flex space-x-2">
            <TabButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
              Overview
            </TabButton>
            <TabButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
              Products
            </TabButton>
            <TabButton selected={activeTab === 2} onClick={() => setActiveTab(2)}>
              Sellers
            </TabButton>
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <DatePicker
              selected={selectedDate}
              onChange={(date: Date) => {
                setSelectedDate(date);
                setTimeFrame('custom');
              }}
              dateFormat="d MMM yyyy"
              className="cursor-pointer border border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none"
            />
            <select
              value={timeFrame}
              onChange={(e) => {
                setTimeFrame(e.target.value);
                if (e.target.value !== 'custom') {
                  setSelectedDate(new Date());
                }
              }}
              className="border border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Date</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={metrics.totalSales}
          valueType="currency"
          icon={DollarSign}
        />
        <StatCard
          title="Net Profit"
          value={metrics.totalProfit}
          valueType="currency"
          icon={TrendingUp}
        />
        <StatCard
          title="Commission"
          value={metrics.totalCommission}
          secondaryValue={`${((metrics.totalCommission / Number(metrics.totalSales)) * 100 || 0)}% of revenue`}
          valueType="currency"
          icon={Percent}
        />
        <StatCard
          title="Products Sold"
          value={`${metrics.productMetrics.length} / ${metrics.totalUnits}`}
          secondaryValue={`Avg. ticket: ${formatCurrency(metrics.avgTicketSize)}`}
          valueType="number"
          icon={Package}
        />
      </div>

      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-sm lg:text-title-lg font-semibold mb-4 text-black dark:text-white">
              Revenue by Category
            </h2>
            <div className="h-[300px]">
              {fetchingSales ? (
                <div className="flex justify-center items-center h-full">
                  <CircularProgress />
                </div>
              ) : metrics.categoryMetrics.length === 0 ? (
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
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {metrics.categoryMetrics.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-sm lg:text-title-lg font-semibold mb-4 text-black dark:text-white">
              Top Products
            </h2>
            <div className="h-[300px]">
              {fetchingSales ? (
                <div className="flex justify-center items-center h-full">
                  <CircularProgress />
                </div>
              ) : metrics.productMetrics.length === 0 ? (
                <div className="flex justify-center items-center h-full text-bodydark2">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={metrics.productMetrics
                      .sort((a, b) => b.sales - a.sales)
                      .slice(0, 5)}
                    layout="vertical"
                  >
                    <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="sales" fill="#42C8B7" name="Revenue" />
                    <Bar dataKey="profit" fill="#FFBB28" name="Profit" />
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
                  <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                    Margin
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke dark:divide-strokedark">
                {metrics.productMetrics.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      {fetchingSales ? 'Loading...' : 'No sales data available'}
                    </td>
                  </tr>
                ) : (
                  metrics.productMetrics
                    .sort((a, b) => b.sales - a.sales)
                    .map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {item.name}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {item.model}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {item.category}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {formatCurrency(item.sales)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {item.units}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {formatCurrency(item.profit)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {item.sales > 0
                            ? `${Math.round((item.profit / item.sales) * 100)}%`
                            : 'N/A'}
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
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-sm lg:text-title-lg font-semibold mb-4 text-black dark:text-white">
              Seller Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stroke dark:border-strokedark bg-gray-2 dark:bg-meta-4">
                    <th className="px-4 md:px-6 py-4 text-left text-xs font-medium text-bodydark2 uppercase">
                      Seller
                    </th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                      Revenue
                    </th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                      Transactions
                    </th>
                    <th className="px-4 md:px-6 py-4 text-right text-xs font-medium text-bodydark2 uppercase">
                      Profit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stroke dark:divide-strokedark">
                  {metrics.sellerMetrics.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        {fetchingSales ? 'Loading...' : 'No seller data available'}
                      </td>
                    </tr>
                  ) : (
                    metrics.sellerMetrics.map((seller, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-2 dark:hover:bg-meta-4 transition-colors duration-200"
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-black dark:text-white">
                          {seller.sellerName}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {formatCurrency(seller.totalSales)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {seller.totaltransacted}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                          {formatCurrency(seller.netprofit)}
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
    </div>
  );
};

export default SalesBackup;