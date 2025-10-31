import { useEffect, useState, useMemo } from 'react';
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
  Calendar,
  CreditCard,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { getSalesReport, SalesReportParams } from '../../api/sales_dashboard_manager';
import Message from '../alerts/Message';
import SalesTable from './SalesTable';
import PayCommissionModal from './PayCommissionModal';

// Interface definitions
interface FinanceDetails {
  financeStatus: string;
  financeAmount: number;
  financer: string;
}

interface Sale {
  saleId: number;
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
  sellername: string;
  shopname: string;
}

interface SalesData {
  sales: Sale[];
  analytics: any;
  salesPerMonth: any[];
  totalSales: number;
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

interface ProfitableProduct {
  name: string;
  model: string;
  category: string;
  sales: number;
  units: number;
  profit: number;
  profitMargin: number;
}

interface SalesReportProps {
  reportType: 'all' | 'user' | 'financer';
  id?: string;
  title: string;
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

const SalesReport = ({ reportType, id, title }: SalesReportProps) => {
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [date, setDate] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPayCommissionModalOpen, setPayCommissionModalOpen] = useState(false);

  // Fetch sales data
  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      const params: SalesReportParams = {
        page: currentPage,
        limit: itemsPerPage,
        reportType,
        id,
      };

      if (date) {
        params.date = date;
      } else if (timeFrame) {
        params.period = timeFrame as any;
      }

      try {
        const response = await getSalesReport(params);
        if (response.data) {
          const salesPayload = {
            ...response.data,
            sales: response.data.sales || [],
            totalPages: response.data.totalPages || 1,
          };
          setSalesData(salesPayload);
          setTotalPages(salesPayload.totalPages);
          setError(null);
        } else {
          setSalesData(null);
          throw new Error('No sales data returned from the API.');
        }
      } catch (error: any) {
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
  }, [timeFrame, currentPage, itemsPerPage, date, reportType, id]);

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

    const totalUnits = salesData.sales.reduce(
      (sum, item) => sum + item.totaltransaction,
      0,
    );

    const avgTicketSize = salesData.totalSales / totalUnits || 0;

    const filteredSales = salesData.sales.filter((sale) => {
      if (financeFilter === 'all') return true;
      return sale.financeDetails.financeStatus === financeFilter;
    });

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

    const productMetrics = Array.from(productData.values());

    const profitableProducts: ProfitableProduct[] = productMetrics
      .map((product) => ({
        ...product,
        profitMargin: (product.profit / product.sales) * 100,
      }))
      .sort((a, b) => b.profitMargin - a.profitMargin);

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

    const categoryMetrics = Array.from(categoryData.values());

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

    const financerMetrics = Array.from(financerData.values());

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const COLORS = ['#42C8B7', '#80CAEE', '#10B981', '#FFBA00', '#FF6766', '#8884d8', '#82ca9d'];

  const handleOpenPayCommissionModal = (sale: any) => {
    setSelectedSale(sale);
    setPayCommissionModalOpen(true);
  };

  const handleClosePayCommissionModal = () => {
    setSelectedSale(null);
    setPayCommissionModalOpen(false);
  };

  const handleCommissionPaid = () => {
    handleClosePayCommissionModal();
    // Refetch data after paying commission
    setCurrentPage(1); // Reset to first page or refetch current
  };

  if (loading && !salesData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size={50} />
      </div>
    );
  }

  return (
    <div className="md:px-4 py-8">
      {message && message.type === 'error' && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      <div className="mb-8">
        <div>
          <h1 className="text-title-lg font-bold text-black dark:text-white mb-2">
            {title}
          </h1>
          <p className="text-bodydark">
            Comprehensive sales performance insights for your business
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-bodydark" />
              <select
                value={timeFrame}
                onChange={(e) => {
                  setTimeFrame(e.target.value);
                  setDate('');
                }}
                className="border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none appearance-none"
              >
                <option value="">Select Period</option>
                <option value="day">Today</option>
                <option value="week">Past Week</option>
                <option value="month">Past Month</option>
                <option value="year">Past Year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-bodydark" />
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTimeFrame('');
                }}
                className="border-stroke dark:border-strokedark bg-transparent rounded-md px-4 py-2 focus:border-primary focus:ring-primary dark:bg-boxdark text-black dark:text-white outline-none"
                placeholder="Select a date"
              />
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
          value={`${metrics.productMetrics.length} / ${metrics.totalUnits?.toLocaleString()}`}
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

      <div className="border-b border-stroke dark:border-strokedark mb-6">
        <div className="flex space-x-4 overflow-x-auto">
          <TabButton selected={activeTab === 0} onClick={() => setActiveTab(0)}>
            Overview
          </TabButton>
          <TabButton selected={activeTab === 1} onClick={() => setActiveTab(1)}>
            All Sales
          </TabButton>
        </div>
      </div>

      {activeTab === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
        </div>
      )}

      {activeTab === 1 && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">{error}</p>
            </div>
          ) : salesData?.sales?.length > 0 ? (
            <SalesTable
              sales={salesData.sales}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSort={() => { }} // Sorting to be implemented if needed
              onPayCommission={handleOpenPayCommissionModal}
            />
          ) : (
            <div className="flex justify-center items-center h-64">
              <p>No sales data found. Try adjusting the filters.</p>
            </div>
          )}
        </div>
      )}

      {isPayCommissionModalOpen && selectedSale && (
        <PayCommissionModal
          sale={selectedSale}
          onClose={handleClosePayCommissionModal}
          onSuccess={handleCommissionPaid}
        />
      )}

      <div className="flex justify-center items-center space-x-4 mt-8">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 font-medium bg-primary text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span className="text-black dark:text-white">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-4 py-2 font-medium bg-primary text-white rounded-md disabled:bg-gray-300 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SalesReport;
