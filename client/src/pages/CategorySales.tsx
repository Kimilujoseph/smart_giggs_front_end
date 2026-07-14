import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
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
import { DollarSign, TrendingUp, Award, ShoppingCart } from 'lucide-react';
import SuchEmpty from '../components/suchEmpty';
import SalesTable from '../components/SalesDashboard/SalesTable';
import { getSalesReport, getSalesSummary } from '../api/sales_dashboard_manager';
import DateFilter from '../components/filters/DateFilter';

const CategorySales: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [modelFilter, setModelFilter] = useState<'all' | 'mobiles' | 'accessories'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState<string>('period=month');
  const { categoryId } = useParams();

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!categoryId) {
        setError('Category ID not found');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const filterParams = new URLSearchParams(dateFilter);
        const filters = Object.fromEntries(filterParams.entries());

        const salesParams: any = {
          reportType: 'category',
          id: categoryId,
          page: currentPage,
          limit: itemsPerPage,
          filters,
        };

        if (modelFilter !== 'all') {
          salesParams.model = modelFilter;
        }

        const summaryParams = { ...salesParams };
        delete summaryParams.page;
        delete summaryParams.limit;
        delete summaryParams.model;

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
  }, [categoryId, currentPage, itemsPerPage, dateFilter, modelFilter]);

  const individualSalesChartData = useMemo(() => {
    if (!salesData || !salesData.sales) return [];
    return salesData.sales.map((sale: any) => ({
      name: sale.productname,
      sales: sale.soldprice,
      profit: sale.netprofit,
      status: sale.status,
    }));
  }, [salesData]);

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

  if (!salesData) {
    return (
      <div className="text-center p-4">
        <SuchEmpty message="No sales data found for this category." />
      </div>
    );
  }

  let totalSales = 0;
  let totalProfit = 0;
  let totalCommission = 0;

  if (summaryData) {
    if (modelFilter === 'mobiles') {
      totalSales = summaryData.totalMobileSales || 0;
      totalProfit = summaryData.totalMobileProfit || 0;
      totalCommission = summaryData.totalMobileCommission || 0;
    } else if (modelFilter === 'accessories') {
      totalSales = summaryData.totalAccessorySales || 0;
      totalProfit = summaryData.totalAccessoryProfit || 0;
      totalCommission = summaryData.totalAccessoryCommission || 0;
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
    {
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
  ];

  return (
    <>
      <Breadcrumb
        pageName={`Sales for ${
          salesData.sales[0]?.category || 'Category'
        }`}
      />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <DateFilter onDateChange={setDateFilter} />
          </div>
          <div className="relative min-w-[180px]">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Product Model</label>
            <select
              value={modelFilter}
              onChange={(e) => { setModelFilter(e.target.value as any); setCurrentPage(1); }}
              className="w-full appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/30 transition cursor-pointer"
            >
              <option value="all">All Models</option>
              <option value="mobiles">Mobiles</option>
              <option value="accessories">Accessories</option>
            </select>
          </div>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {stats.map((stat, index) => (
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

        <Card className="mb-6 dark:bg-boxdark dark:text-bodydark">
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
                    {individualSalesChartData.map((entry, index) => (
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
                  <Bar dataKey="profit" name="Profit">
                    {individualSalesChartData.map((entry, index) => (
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
        />
      </div>
    </>
  );
};

export default CategorySales;
