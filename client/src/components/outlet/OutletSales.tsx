import { useEffect, useState } from 'react';
import {
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Package,
  Store,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import axios, { AxiosError } from 'axios';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import Message from '../alerts/Message';
import ModalAlert from '../alerts/Alert';

interface Sale {
  id: string;
  productId: string;
  sellerId: string;
  shopId: string;
  CategoryId: string;
  createdAt: string;
  soldprice: number;
  netprofit: number;
  totalsoldunits: number;
  totalnetprice: number;
  totaltransaction: number;
  sellername: string;
  productname: string;
  productmodel: string;
  productcost: number;
  category: string;
  batchNumber?: string;
}

interface SalesData {
  sales: Sale[];
  totalSales: number;
  totalProfit: number;
  totalCommission: number;
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

const OutletSales = () => {
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
          {fetchingSales ? <CircularProgress size={24} /> : value}
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

  const [salesData, setSalesData] = useState<SalesData>({
    sales: [],
    totalSales: 0,
    totalProfit: 0,
    totalCommission: 0,
    totalPages: 1,
    currentPage: 1,
  });
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [timeFrame, setTimeFrame] = useState('day');
  const [activeTab, setActiveTab] = useState(0);
  const [fetchingSales, setFetchingSales] = useState(false);
  const token = localStorage.getItem('tk');
  const [axiosError, setAxiosError] = useState<AxiosError | null>(null);
  const user: DecodedToken | null = jwt_decode(token!) || null;

  useEffect(() => {
    const fetchSalesData = async () => {
      setFetchingSales(true);
      try {
        const response = await axios(
          `${
            import.meta.env.VITE_SERVER_HEAD
          }/api/sales/user/${user?.id}?period=${timeFrame}`,
          { withCredentials: true },
        );
        console.log(response.data);

        if (response.status !== 200) {
          throw new Error(
            response.data.message || 'Failed to fetch sales data',
          );
        }
        const data = await response.data;
        console.log(data);
        
        setSalesData(data.data);
        setMessage({
          text: 'Sales data fetched successfully',
          type: 'success',
        });
      } catch (error: any) {
        console.error('Error fetching sales data:', error);
        setMessage({
          text:
            error.response?.data?.message ||
            error.message ||
            'Failed to fetch sales',
          type: `${error.response?.status! === 404 ? 'warning' : 'error'}`,
        });
      } finally {
        setFetchingSales(false);
      }
    };
    fetchSalesData();
  }, [timeFrame]);

  const calculateMetrics = () => {
    if (salesData?.sales?.length === 0)
      return {
        totalSales: 0,
        totalUnits: 0,
        totalCommission: 0,
        totalProfit: 0,
        avgTicketSize: 0,
        productMetrics: [],
        categoryMetrics: [],
      };

    const totalUnits = salesData.sales?.reduce(
      (sum, item) => sum + item.totaltransaction,
      0,
    );
    const avgTicketSize = salesData.totalSales / totalUnits || 0;

    // Calculate product metrics
    const productData = new Map();
    salesData.sales?.forEach((item) => {
      const productKey = item.productname;
      if (!productData.has(productKey)) {
        productData.set(productKey, {
          name: item.productname,
          sales: 0,
          units: 0,
          profit: 0,
          model: item.productmodel,
          category: item.category,
        });
      }
      const product = productData.get(productKey);
      product.sales += item.soldprice;
      product.units += item.totaltransaction;
      product.profit += item.netprofit;
    });
    const productMetrics = Array.from(productData.values());

    // Calculate category metrics
    const categoryData = new Map();
    salesData.sales?.forEach((item) => {
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
    const categoryMetrics = Array.from(categoryData.values());

    return {
      totalSales: salesData.totalSales,
      totalUnits,
      totalCommission: salesData.totalCommission,
      totalProfit: salesData.totalProfit,
      avgTicketSize,
      productMetrics,
      categoryMetrics,
    };
  };

  const metrics = calculateMetrics();

  if (axiosError) {
    return (
      <ModalAlert
        message={`${axiosError.code}: ${axiosError.message}`}
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
        <div className="flex justify-end items-center mt-4">
          <div>
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
        </div>
      </div>

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
          title="Products Sold / Total Units"
          value={`${metrics.productMetrics.length} / ${metrics.totalUnits?.toLocaleString()}`}
          valueType="number"
          secondaryValue={`Avg. ticket: ${metrics.avgTicketSize?.toLocaleString()}`}
          icon={Package}
        />
        <StatCard
          title="Commission Earned"
          value={metrics.totalCommission?.toLocaleString() || '-'}
          valueType="currency"
          icon={TrendingUp}
        />
      </div>

      <div className="border-b border-stroke dark:border-strokedark mb-6">
        <div className="flex space-x-4">
          <TabButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
            Overview
          </TabButton>
          <TabButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
            Products
          </TabButton>
        </div>
      </div>

      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-xs md:text-title-sm lg:text-title-lg font-semibold mb-4 text-black dark:text-white">
              Category Revenue Distribution
            </h2>
            <div className="h-90">
              {fetchingSales ? (
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
                      label
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
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-card p-6 border border-stroke dark:border-strokedark">
            <h2 className="text-title-xs md:text-title-sm lg:text-title-lg font-semibold mb-4 text-black dark:text-white">
              Product Performance
            </h2>
            <div className="h-90">
              {fetchingSales ? (
                <div className="flex justify-center items-center h-full">
                  <CircularProgress />
                </div>
              ) : metrics.categoryMetrics.length === 0 ? (
                <div className="flex justify-center items-center h-full text-bodydark2">
                  No data available
                </div>
              ) : (
                <ResponsiveContainer>
                  <BarChart data={metrics.productMetrics}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#42C8B7" />
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
                {metrics.productMetrics.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
                )}
                {metrics.productMetrics.map((item, index) => (
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
                      {item.sales.toLocaleString()}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                      {item.units}
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-right text-black dark:text-white">
                      {item.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletSales;
