import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent } from '@mui/material';
import { DollarSign, TrendingUp, Award, ShoppingCart } from 'lucide-react';
import SuchEmpty from '../components/suchEmpty';
import { getSalesReport } from '../api/sales_dashboard_manager';
import SalesTable from '../components/SalesDashboard/SalesTable';
import DateFilter from '../components/filters/DateFilter';

const FinancerSalesReport: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateFilter, setDateFilter] = useState<string>('period=month');
  const { financerId } = useParams();

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!financerId) {
        setError('Financer ID not found');
        setIsLoading(false);
        return;
      }
      try {
        const filterParams = new URLSearchParams(dateFilter);
        const filters = Object.fromEntries(filterParams.entries());

        const data = await getSalesReport({
          reportType: 'financer',
          id: financerId,
          page: currentPage,
          limit: itemsPerPage,
          filters,
        });
        setSalesData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [financerId, currentPage, itemsPerPage, dateFilter]);

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
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!salesData) {
    return <div className="text-center p-4"><SuchEmpty message="No sales data found for this financer." /></div>;
  }

  const stats = [
    { title: 'Total Sales', value: `Ksh ${salesData.analytics.totalSales?.toLocaleString() || 0}` || '-', icon: DollarSign, color: 'text-emerald-500' },
    { title: 'Total Profit', value: `Ksh ${salesData.analytics.totalProfit?.toLocaleString() || 0}` || '-', icon: TrendingUp, color: 'text-blue-500' },
    { title: 'Total Commission', value: `Ksh ${salesData.analytics.totalCommission?.toLocaleString() || 0}` || '-', icon: Award, color: 'text-yellow-500' },
    { title: 'Total Finance Amount', value: `Ksh ${salesData.analytics.totalFinanceAmount?.toLocaleString() || 0}` || '-', icon: ShoppingCart, color: 'text-purple-500' },
  ];

  return (
    <>
      <Breadcrumb pageName={`Sales for ${salesData.sales[0]?.financeDetails.financer || 'Financer'}`} />
      <div className="mx-auto max-w-7xl py-8">
        <DateFilter onDateChange={setDateFilter} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          {stats.map((stat, index) => (
            <Card key={index} className="dark:bg-boxdark dark:text-bodydark">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2 dark:text-bodydark2">{stat.title}</p>
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
                    {individualSalesChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.status === 'RETURNED' ? '#ff8042' : entry.status === 'PARTIALLY_RETURNED' ? '#ffc658' : '#8884d8'} />)}
                  </Bar>
                  <Bar dataKey="profit" name="Profit">
                    {individualSalesChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.status === 'RETURNED' ? '#ff8042' : entry.status === 'PARTIALLY_RETURNED' ? '#ffc658' : '#82ca9d'} />)}
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

export default FinancerSalesReport;