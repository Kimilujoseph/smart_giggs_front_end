import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, CardContent } from '@mui/material';
import { DollarSign, TrendingUp, Award, ShoppingCart, FileDown, Loader2 } from 'lucide-react';
import SuchEmpty from '../components/suchEmpty';
import SalesTable from '../components/SalesDashboard/SalesTable';
import { getSalesReport, getSalesSummary } from '../api/sales_dashboard_manager';
import DateFilter from '../components/filters/DateFilter';
import { useAppContext } from '../context/AppContext';
import SellerKpis from '../components/users/SellerKpis';
import { usePdfReport } from '../context/PdfReportContext';
import SalesPerformanceSummary from '../components/SalesDashboard/SalesPerformanceSummary';

const UserSales: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'smartphones' | 'smallphones' | 'accessories' | 'simcards'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState<string>('period=day');
  const [activeTab, setActiveTab] = useState('details'); // 'details' or 'kpis'
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const userId = params.get('userId');
  const { user } = useAppContext();
  const { job, startPdfGeneration } = usePdfReport();

  const isGenerating = job.status === 'queue' || job.status === 'active';

  const handleGeneratePdf = () => {
    if (!userId) return;
    const filterParams = new URLSearchParams(dateFilter);
    const filters = Object.fromEntries(filterParams.entries());

    const pdfParams: any = {
      reportType: 'user',
      id: userId,
      filters,
    };

    if (itemTypeFilter !== 'all') {
      pdfParams.itemType = itemTypeFilter;
    }

    startPdfGeneration(pdfParams);
  };

  useEffect(() => {
    if (activeTab !== 'details') {
      return;
    }
    const fetchSalesData = async () => {
      if (!userId) {
        setError('User ID not found');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const filterParams = new URLSearchParams(dateFilter);
        const filters = Object.fromEntries(filterParams.entries());

        const salesParams: any = {
          reportType: 'user',
          id: userId,
          page: currentPage,
          limit: itemsPerPage,
          filters,
        };

        if (itemTypeFilter !== 'all') {
          salesParams.itemType = itemTypeFilter;
        }

        const summaryParams = { ...salesParams };
        delete summaryParams.page;
        delete summaryParams.limit;

        const [salesRes, summaryRes] = await Promise.all([
          getSalesReport(salesParams),
          getSalesSummary(summaryParams),
        ]);

        setSalesData(salesRes.data);
        if (summaryRes.success && summaryRes.data) {
          setSummaryData(summaryRes.data);
        } else {
          setSummaryData(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [userId, currentPage, itemsPerPage, dateFilter, activeTab, itemTypeFilter]);

  const individualSalesChartData = useMemo(() => {
    if (!salesData || !salesData.sales) return [];
    return salesData.sales.map((sale: any) => ({
      name: sale.productname,
      sales: sale.soldprice,
      profit: sale.netprofit,
      status: sale.status,
    }));
  }, [salesData]);

  const renderSalesDetails = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      );
    }

    if (error) {
      return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    if (!salesData || !salesData.sales || salesData.sales.length === 0) {
      return (
        <div className="text-center p-4">
          <SuchEmpty message="No sales data found for this user for the selected period." />
        </div>
      );
    }

    let totalSales = 0;
    let totalProfit = 0;
    let totalCommission = 0;

    if (summaryData) {
      if (itemTypeFilter === 'smartphones') {
        totalSales = summaryData.totalSmartphoneSales || 0;
        totalProfit = summaryData.totalSmartphoneProfit || 0;
        totalCommission = summaryData.totalSmartphoneCommission || 0;
      } else if (itemTypeFilter === 'smallphones') {
        totalSales = summaryData.totalSmallPhoneSales || 0;
        totalProfit = summaryData.totalSmallPhoneProfit || 0;
        totalCommission = summaryData.totalSmallPhoneCommission || 0;
      } else if (itemTypeFilter === 'accessories') {
        totalSales = summaryData.totalAccessorySales || 0;
        totalProfit = summaryData.totalAccessoryProfit || 0;
        totalCommission = summaryData.totalAccessoryCommission || 0;
      } else if (itemTypeFilter === 'simcards') {
        totalSales = summaryData.totalSimCardSales || 0;
        totalProfit = summaryData.totalSimCardProfit || 0;
        totalCommission = summaryData.totalSimCardCommission || 0;
      } else {
        totalSales = summaryData.totalSales || 0;
        totalProfit = summaryData.totalProfit || 0;
        totalCommission = summaryData.totalCommission || 0;
      }
    }

    const stats = [
      {
        title: 'Total Sales',
        value: `Ksh ${totalSales.toLocaleString()}`,
        icon: DollarSign,
        color: 'text-emerald-500',
      },
      user?.role !== 'seller' && {
        title: 'Total Profit',
        value: `Ksh ${totalProfit.toLocaleString()}`,
        icon: TrendingUp,
        color: 'text-blue-500',
      },
      {
        title: 'Total Commission',
        value: `Ksh ${totalCommission.toLocaleString()}`,
        icon: Award,
        color: 'text-yellow-500',
      },
      {
        title: 'Total Items Sold',
        value:
          salesData?.sales?.reduce(
            (acc: number, sale: any) => acc + sale.totalsoldunits,
            0,
          ) || 0,
        icon: ShoppingCart,
        color: 'text-purple-500',
      },
    ].filter(Boolean);

    return (
      <div className="flex flex-col gap-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat: any, index: number) => (
            <Card key={index} className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 dark:text-bodydark2">
                      {stat.title}
                    </p>
                    <p className="text-xl font-semibold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sales Performance & KPI Summary */}
        {summaryData && (
          <SalesPerformanceSummary summaryData={summaryData} userRole={user?.role} />
        )}

        <Card className="dark:bg-boxdark dark:text-bodydark">
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Individual Sales</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={individualSalesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" name="Sales">
                    {individualSalesChartData.map((entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.status === 'RETURNED'
                            ? '#ff8042'
                            : entry.status === 'PARTIALLY_RETURNED'
                            ? '#ffc658'
                            : '#8884d8'
                        }
                      />
                    ))}
                  </Bar>
                  {user?.role !== 'seller' && (
                    <Bar dataKey="profit" name="Profit">
                      {individualSalesChartData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.status === 'RETURNED'
                              ? '#ff8042'
                              : entry.status === 'PARTIALLY_RETURNED'
                              ? '#ffc658'
                              : '#82ca9d'
                          }
                        />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <SalesTable
          sales={salesData.sales}
          totalPages={salesData.totalPages}
          currentPage={salesData.currentPage}
          onPageChange={setCurrentPage}
          onSort={() => {}}
          onPayCommission={() => {}}
          showActions={false}
          showCostAndProfit={user?.role !== 'seller'}
        />
      </div>
    );
  };

  return (
    <>
      <Breadcrumb
        pageName={`Sales for ${
          salesData?.sales[0]?.sellername || 'User'
        }`}
      />
      <div className="mx-auto max-w-7xl py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex-1">
            <DateFilter onDateChange={setDateFilter} />
          </div>
          <div className="flex flex-row items-end gap-3">
            <div className="relative min-w-[180px]">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Item Category</label>
              <select
                value={itemTypeFilter}
                onChange={(e) => { setItemTypeFilter(e.target.value as any); setCurrentPage(1); }}
                className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer"
              >
                <option value="all">All Item Categories</option>
                <option value="smartphones">Smartphones</option>
                <option value="smallphones">Small Phones</option>
                <option value="accessories">Accessories</option>
                <option value="simcards">SIM Cards</option>
              </select>
            </div>
            <button
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl border transition cursor-pointer h-[38px] ${
                isGenerating
                  ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed dark:border-slate-700 dark:bg-slate-800'
                  : 'border-primary bg-primary text-white hover:bg-opacity-90'
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Generate PDF
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('details')}
              className={`${
                activeTab === 'details'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Sales Details
            </button>
            <button
              onClick={() => setActiveTab('kpis')}
              className={`${
                activeTab === 'kpis'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Performance KPIs
            </button>
          </nav>
        </div>

        {/* Conditional Content */}
        {activeTab === 'details' && renderSalesDetails()}
        {activeTab === 'kpis' && userId && (
          <SellerKpis userId={userId} dateFilter={dateFilter} user={user} />
        )}
      </div>
    </>
  );
};

export default UserSales;

