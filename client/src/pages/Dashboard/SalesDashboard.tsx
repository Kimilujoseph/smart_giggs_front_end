import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ArrowUp,
  ArrowDown,
  CreditCard,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
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
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import ReverseSaleModal from '../../components/SalesDashboard/ReverseSaleModal';

// Interface definitions
export interface FinanceDetails {
  financeStatus: string;
  financeAmount: number;
  financer: string;
}

export interface Sale {
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
  _id: { productId: number; sellerId: number; shopId: number };
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

// ── Stat Card ──────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: any;
  secondaryValue?: string;
  icon: any;
  trend?: number;
  valueType: string;
  accent?: string;
  loading?: boolean;
}

const StatCard = ({
  title,
  value,
  secondaryValue,
  icon: Icon,
  trend,
  valueType,
  accent = 'from-primary/10 to-primary/5',
  loading,
}: StatCardProps) => (
  <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div className={`absolute inset-0 bg-gradient-to-br ${accent} opacity-50 pointer-events-none`} />
    <div className="relative flex items-start justify-between">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
        <Icon className="w-4 h-4 text-primary" />
      </div>
    </div>
    <div className="relative">
      {loading ? (
        <CircularProgress size={22} />
      ) : (
        <>
          <div className="flex items-baseline gap-1">
            {valueType === 'currency' && (
              <span className="text-xs font-bold text-slate-400">KES</span>
            )}
            <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</span>
          </div>
          {secondaryValue && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{secondaryValue}</p>
          )}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-1">
              {trend > 0 ? (
                <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <ArrowDown className="w-3.5 h-3.5 text-rose-500" />
              )}
              <span className={`text-xs font-semibold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {Math.abs(trend)}%
              </span>
            </div>
          )}
        </>
      )}
    </div>
  </div>
);

// ── Custom select ──────────────────────────────────────────────────────────
const SelectField: React.FC<{
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  label?: string;
}> = ({ value, onChange, children, label }) => (
  <div className="relative flex-1 min-w-[140px]">
    {label && <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</label>}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────────────────────

const SalesDashboard = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isPayCommissionModalOpen, setPayCommissionModalOpen] = useState(false);
  const [isReverseSaleModalOpen, setReverseSaleModalOpen] = useState(false);
  const [selectedSaleForReverse, setSelectedSaleForReverse] = useState<any>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const token = localStorage.getItem('tk');
  const decodedToken = token ? jwt_decode<DecodedToken>(token) : null;
  const userRole = decodedToken?.role;

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
      if (usersRes && !usersRes.error) setUsers(usersRes.data || []);
      const categoriesRes = await getCategories();
      if (categoriesRes && categoriesRes.success) setCategories(categoriesRes.data || []);
      const financersRes = await getAllFinancers();
      if (financersRes && !financersRes.error) setFinancers(financersRes.data || []);
    };
    fetchFilterData();
  }, []);

  useEffect(() => {
    const fetchSalesData = async () => {
      setLoading(true);
      let params: SalesReportParams = { page: currentPage, limit: itemsPerPage };

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
        setMessage({ text: errorMessage, type: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [reportType, selectedId, dateFilter, currentPage, itemsPerPage]);

  const calculateMetrics = () => {
    if (!salesData || !salesData.sales || salesData.sales.length === 0) {
      return { totalSales: 0, totalUnits: 0, totalCommission: 0, totalProfit: 0, avgTicketSize: 0, totalPendingFinance: 0, productMetrics: [], categoryMetrics: [], financerMetrics: [] };
    }

    const totalUnits = salesData.sales.reduce((sum, item) => sum + item.totaltransaction, 0);
    const avgTicketSize = salesData.totalSales / totalUnits || 0;

    const productData = new Map<string, any>();
    salesData.sales.forEach((item) => {
      const k = item.productname;
      if (!productData.has(k)) productData.set(k, { name: k, sales: 0, units: 0, profit: 0 });
      const p = productData.get(k)!;
      p.sales += item.soldprice;
      p.units += item.totaltransaction;
      p.profit += item.netprofit;
    });

    const financerData = new Map<string, any>();
    salesData.sales.forEach((item) => {
      const k = item.financeDetails.financer || 'None';
      if (!financerData.has(k)) financerData.set(k, { name: k, count: 0, amount: 0, sales: 0 });
      const f = financerData.get(k)!;
      f.count += 1;
      f.amount += item.financeDetails.financeAmount;
      f.sales += item.soldprice;
    });

    const totalPendingFinance = salesData.sales
      .filter((s) => s.financeDetails.financeStatus === 'pending')
      .reduce((sum, s) => sum + s.financeDetails.financeAmount, 0);

    return {
      totalSales: salesData.totalSales,
      totalUnits,
      totalCommission: salesData.totalCommission,
      totalProfit: salesData.totalProfit,
      avgTicketSize,
      totalPendingFinance,
      productMetrics: Array.from(productData.values()),
      financerMetrics: Array.from(financerData.values()),
      categoryMetrics: [],
    };
  };

  const metrics = calculateMetrics();

  const handleOpenPayCommissionModal = (sale: any) => { setSelectedSale(sale); setPayCommissionModalOpen(true); };
  const handleClosePayCommissionModal = () => { setSelectedSale(null); setPayCommissionModalOpen(false); };
  const handleCommissionPaid = () => { handleClosePayCommissionModal(); setCurrentPage(1); };
  const handleOpenReverseSaleModal = (sale: any) => { setSelectedSaleForReverse(sale); setReverseSaleModalOpen(true); };
  const handleCloseReverseSaleModal = () => { setSelectedSaleForReverse(null); setReverseSaleModalOpen(false); };
  const handleSaleReversed = () => { handleCloseReverseSaleModal(); setCurrentPage(1); };

  const refresh = () => {
    setCurrentPage(1);
    setSelectedId('');
  };

  if (loading && !salesData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress size={50} />
      </div>
    );
  }

  return (
    <div className="md:px-4 py-6 flex flex-col gap-6">
      {message && message.type === 'error' && (
        <Message message={message.text} type={message.type} onClose={() => setMessage(null)} />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Sales Dashboard</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Last refreshed: {new Date().toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${
              filtersOpen
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
            {(reportType !== 'all' || dateFilter !== 'period=month') && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            )}
          </button>
        </div>
      </div>

      {/* ── Filters Panel ── */}
      {filtersOpen && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark p-4 flex flex-col gap-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Filter Options</p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="w-full sm:w-auto flex-1 min-w-[180px]">
              <DateFilter onDateChange={(v) => { setDateFilter(v); setCurrentPage(1); }} />
            </div>

            <SelectField
              label="Report Type"
              value={reportType}
              onChange={(v) => { setReportType(v as any); setSelectedId(''); setCurrentPage(1); }}
            >
              <option value="all">All Sales</option>
              <option value="category">By Category</option>
              <option value="financer">By Financer</option>
              <option value="user">By User</option>
            </SelectField>

            {reportType !== 'all' && (
              <SelectField
                label={reportType === 'category' ? 'Category' : reportType === 'financer' ? 'Financer' : 'User'}
                value={selectedId}
                onChange={(v) => { setSelectedId(v); setCurrentPage(1); }}
              >
                <option value="">
                  {reportType === 'category' ? 'Select Category' : reportType === 'financer' ? 'Select Financer' : 'Select User'}
                </option>
                {reportType === 'category' && categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                {reportType === 'financer' && financers.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                {reportType === 'user' && users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </SelectField>
            )}
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Total Revenue"
          value={metrics.totalSales.toLocaleString()}
          valueType="currency"
          icon={DollarSign}
          accent="from-blue-500/10 to-blue-400/5"
          loading={loading}
        />
        <StatCard
          title="Net Profit"
          value={metrics.totalProfit.toLocaleString()}
          valueType="currency"
          icon={TrendingUp}
          accent="from-emerald-500/10 to-emerald-400/5"
          loading={loading}
        />
        <StatCard
          title="Products Sold"
          value={`${metrics.productMetrics.length} / ${metrics.totalUnits.toLocaleString()}`}
          valueType="number"
          secondaryValue={`Avg. ticket: KES ${metrics.avgTicketSize.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`}
          icon={Package}
          accent="from-violet-500/10 to-violet-400/5"
          loading={loading}
        />
        <StatCard
          title="Finance Pending"
          value={metrics.totalPendingFinance.toLocaleString()}
          valueType="currency"
          secondaryValue={`${metrics.financerMetrics.filter((f) => f.name !== 'None').length} financer(s)`}
          icon={CreditCard}
          accent="from-amber-500/10 to-amber-400/5"
          loading={loading}
        />
      </div>

      {/* ── Sales Table / Loading / Empty ── */}
      <div>
        {loading && salesData ? (
          <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
            <CircularProgress size={16} /> Refreshing…
          </div>
        ) : null}

        {!error && salesData?.sales && salesData.sales.length > 0 ? (
          <SalesTable
            sales={salesData.sales as any}
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onSort={() => {}}
            onPayCommission={handleOpenPayCommissionModal}
            onReverseSale={handleOpenReverseSaleModal}
            userRole={userRole}
          />
        ) : !loading ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-400 gap-2">
            <Package className="w-8 h-8 opacity-30" />
            <p className="text-sm">{error || 'No sales data. Try adjusting filters.'}</p>
          </div>
        ) : null}
      </div>

      {/* Modals */}
      {isPayCommissionModalOpen && selectedSale && (
        <PayCommissionModal sale={selectedSale} onClose={handleClosePayCommissionModal} onSuccess={handleCommissionPaid} />
      )}
      {isReverseSaleModalOpen && selectedSaleForReverse && (
        <ReverseSaleModal sale={selectedSaleForReverse} onClose={handleCloseReverseSaleModal} onSuccess={handleSaleReversed} />
      )}
    </div>
  );
};

export default SalesDashboard;
