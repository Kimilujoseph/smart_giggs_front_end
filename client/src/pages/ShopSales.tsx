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
import { DollarSign, TrendingUp, Award, ShoppingCart } from 'lucide-react';
import SuchEmpty from '../components/suchEmpty';

const ShopSales: React.FC = () => {
  const [salesData, setSalesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const shopId = params.get('shopId');

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!shopId) {
        setError('Shop ID not found');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_HEAD}/api/sales/report/shop/${shopId}?page=${currentPage}&limit=${itemsPerPage}`,
          { credentials: 'include' },
        );
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const data = await response.json();
        setSalesData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesData();
  }, [shopId, currentPage, itemsPerPage]);

  const monthlySalesData = useMemo(() => {
    if (!salesData || !salesData.salesPerMonth) return [];
    return salesData.salesPerMonth.map((d: any) => ({
      ...d,
      month: new Date(d.month).toLocaleString('default', { month: 'short' }),
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
        <SuchEmpty message="No sales data found for this shop." />
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Sales',
      value: `Ksh ${salesData.analytics.totalSales.toLocaleString()}` || '-',
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    {
      title: 'Total Profit',
      value: `Ksh ${salesData.analytics.totalProfit.toLocaleString()}` || '-',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Total Commission',
      value:
        `Ksh ${salesData.analytics.totalCommission.toLocaleString()}` || '-',
      icon: Award,
      color: 'text-yellow-500',
    },
    {
      title: 'Total Items Sold',
      value:
        salesData.sales.reduce(
          (acc: number, sale: any) => acc + sale.totalsoldunits,
          0,
        ) || '-',
      icon: ShoppingCart,
      color: 'text-purple-500',
    },
  ];

  return (
    <>
      <Breadcrumb
        pageName={`Sales for ${
          salesData.sales[0]?.shopname || 'Shop'
        }`}
      />
      <div className="mx-auto max-w-7xl py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        {/* Sales Chart */}
        <Card className="mb-6 dark:bg-boxdark dark:text-bodydark">
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
            <div style={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={monthlySalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" name="Sales" />
                  <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Table */}
        <Card className="dark:bg-boxdark dark:text-bodydark">
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">All Sales</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 dark:bg-meta-4 text-left">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Product
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Seller
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Date
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Price
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Profit
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {salesData.sales.map((sale: any, index: number) => (
                    <tr key={index}>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {sale.productname}
                        </p>
                        <p className="text-sm text-gray-500">
                          {sale.productmodel}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {sale.sellername}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          Ksh {sale.soldprice.toLocaleString()}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p
                          className={`text-black dark:text-white ${
                            sale.netprofit < 0 ? 'text-red-500' : ''
                          }`}
                        >
                          Ksh {sale.netprofit.toLocaleString()}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                        <p
                          className={`inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium ${
                            sale.status === 'RETURNED'
                              ? 'bg-red-500 text-red-500'
                              : sale.status === 'PARTIALLY_RETURNED'
                              ? 'bg-yellow-500 text-yellow-500'
                              : 'bg-green-500 text-green-500'
                          }`}
                        >
                          {sale.status}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={salesData.currentPage === 1}
                className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={salesData.currentPage === salesData.totalPages}
                className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ShopSales;
