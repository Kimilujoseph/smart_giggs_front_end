import { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown,
  CreditCard,
} from 'lucide-react';
import { CircularProgress } from '@mui/material';
import { getSalesReport, SalesReportParams } from '../../api/sales_dashboard_manager';
import Message from '../../components/alerts/Message';
import SalesTable from '../../components/SalesDashboard/SalesTable';
import PayCommissionModal from '../../components/SalesDashboard/PayCommissionModal';
import DateFilter from '../../components/filters/DateFilter';
import { getCategories } from '../../api/category_manager';
import { getAllFinancers } from '../../api/financer_manager';
import { getAllUsers } from '../../api/user_manager';
import { User } from '../../types/user';
import { Category } from '../../types/category';
import { Financer } from '../../types/financer';

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

const SalesDashboard = () => {
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

  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPayCommissionModalOpen, setPayCommissionModalOpen] = useState(false);

  // Filters state
  const [reportType, setReportType] = useState<'all' | 'category' | 'financer' | 'user'>('all');
  const [selectedId, setSelectedId] = useState<string>('');
  const [dateFilter, setDateFilter] = useState('period=month');

  // Data for filters
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [financers, setFinancers] = useState<Financer[]>([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      const usersRes = await getAllUsers();
      if (usersRes && !usersRes.error) {
        setUsers(usersRes.data || []);
      }

      const categoriesRes = await getCategories();
      if (categoriesRes && categoriesRes.success) {
        setCategories(categoriesRes.data || []);
      }

      const financersRes = await getAllFinancers();
      if (financersRes && !financersRes.error) {
        setFinancers(financersRes.data || []);
      }
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      let params: SalesReportParams = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (dateFilter) {
        const dateParams = new URLSearchParams(dateFilter);
        params.period = dateParams.get('period') as any;
        params.startDate = dateParams.get('startDate') || undefined;
        params.endDate = dateParams.get('endDate') || undefined;
      }

      if (reportType !== 'all' && selectedId) {
        params.reportType = reportType;
        params.id = selectedId;
      } else {
        params.reportType = 'all';
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
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch sales data';
        setError(errorMessage);
        setMessage({
          text: errorMessage,
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [reportType, selectedId, dateFilter, currentPage, itemsPerPage]);

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
      };
    }

    const totalUnits = salesData.sales.reduce(
      (sum, item) => sum + item.totaltransaction,
      0,
    );

    const avgTicketSize = salesData.totalSales / totalUnits || 0;

    const productData = new Map();
    salesData.sales.forEach((item) => {
      const productKey = item.productname;
      if (!productData.has(productKey)) {
        productData.set(productKey, {
          name: item.productname,
          sales: 0,
          units: 0,
          profit: 0,
        });
      }
      const product = productData.get(productKey);
      product.sales += item.soldprice;
      product.units += item.totaltransaction;
      product.profit += item.netprofit;
    });

    const categoryData = new Map();
    salesData.sales.forEach((item) => {
      const categoryKey = item.category;
      if (!categoryData.has(categoryKey)) {
        categoryData.set(categoryKey, {
          name: item.category,
          sales: 0,
        });
      }
      categoryData.get(categoryKey).sales += item.soldprice;
    });

    const financerData = new Map();
    salesData.sales.forEach((item) => {
        const financerKey = item.financeDetails.financer || 'None';
        if (!financerData.has(financerKey)) {
            financerData.set(financerKey, { name: financerKey, count: 0, amount: 0, sales: 0 });
        }
        const financer = financerData.get(financerKey);
        financer.count += 1;
        financer.amount += item.financeDetails.financeAmount;
        financer.sales += item.soldprice;
    });

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
      productMetrics: Array.from(productData.values()),
      categoryMetrics: Array.from(categoryData.values()),
      financerMetrics: Array.from(financerData.values()),
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
    setCurrentPage(1);
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
            Sales Analytics Dashboard
          </h1>
          <p className="text-bodydark">
            Comprehensive sales performance insights for your business
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-4 gap-4">
          <div className="flex w-full flex-col items-center gap-4 sm:flex-row sm:flex-wrap md:w-auto">
            <div className="w-full sm:w-auto">
              <DateFilter onDateChange={setDateFilter} />
            </div>

            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value as any);
                setSelectedId('');
              }}
              className="w-full appearance-none border-stroke bg-transparent px-4 py-2 text-black outline-none focus:border-primary focus:ring-primary dark:border-strokedark dark:bg-boxdark dark:text-white sm:w-auto"
            >
              <option value="all">All Sales</option>
              <option value="category">By Category</option>
              <option value="financer">By Financer</option>
              <option value="user">By User</option>
            </select>

            {reportType !== 'all' && (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full appearance-none border-stroke bg-transparent px-4 py-2 text-black outline-none focus:border-primary focus:ring-primary dark:border-strokedark dark:bg-boxdark dark:text-white sm:w-auto"
              >
                <option value="">
                  {reportType === 'category' && 'Select Category'}
                  {reportType === 'financer' && 'Select Financer'}
                  {reportType === 'user' && 'Select User'}
                </option>
                {reportType === 'category' &&
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                {reportType === 'financer' &&
                  financers.map((fin) => (
                    <option key={fin.id} value={fin.id}>
                      {fin.name}
                    </option>
                  ))}
                {reportType === 'user' &&
                  users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
              </select>
            )}
          </div>

          <div className="rounded-md bg-gray-100 px-4 py-2 text-sm dark:bg-meta-4">
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
            onSort={() => {}} // Sorting to be implemented if needed
            onPayCommission={handleOpenPayCommissionModal}
          />
        ) : (
          <div className="flex justify-center items-center h-64">
            <p>No sales data found. Try adjusting the filters.</p>
          </div>
        )}
      </div>

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

export default SalesDashboard;
