import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@mui/material';
import {
  DollarSign,
  TrendingUp,
  Award,
  ShoppingCart,
  TrendingDown,
  Percent,
} from 'lucide-react';
import SuchEmpty from '../suchEmpty';
import { getSellerKpis } from '../../api/kpi_manager';
import { DecodedToken } from '../../types/decodedToken';

interface SellerKpisProps {
  userId: string;
  dateFilter: string;
  user: DecodedToken | null;
}

const SellerKpis: React.FC<SellerKpisProps> = ({
  userId,
  dateFilter,
  user,
}) => {
  const [kpiData, setKpiData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filterParams = new URLSearchParams(dateFilter);
        const filters = Object.fromEntries(filterParams.entries());

        const data = await getSellerKpis({
          sellerId: userId,
          filters,
        });
        setKpiData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchKpiData();
  }, [userId, dateFilter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">Loading...</div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  if (!kpiData || !kpiData.sales || kpiData.sales.length === 0) {
    return (
      <div className="text-center p-4">
        <SuchEmpty message="No performance data found for the selected period." />
      </div>
    );
  }

  // Aggregate stats from the KPI data
  const aggregatedStats = kpiData.sales.reduce(
    (acc: any, curr: any) => {
      acc.totalSalesRevenue += parseFloat(curr.totalSalesRevenue);
      acc.totalGrossProfit += parseFloat(curr.totalGrossProfit);
      acc.totalUnitsSold += curr.totalUnitsSold;
      acc.totalReturnRate += parseFloat(curr.returnRate);
      return acc;
    },
    {
      totalSalesRevenue: 0,
      totalGrossProfit: 0,
      totalUnitsSold: 0,
      totalReturnRate: 0,
    },
  );

  const averageProfitMargin =
    aggregatedStats.totalSalesRevenue > 0
      ? (aggregatedStats.totalGrossProfit / aggregatedStats.totalSalesRevenue) *
        100
      : 0;

  const stats = [
    {
      title: 'Total Sales Revenue',
      value: `Ksh ${aggregatedStats.totalSalesRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
    },
    user?.role !== 'seller' && {
      title: 'Total Gross Profit',
      value: `Ksh ${aggregatedStats.totalGrossProfit.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      title: 'Total Units Sold',
      value: aggregatedStats.totalUnitsSold,
      icon: ShoppingCart,
      color: 'text-purple-500',
    },
    user?.role !== 'seller' && {
      title: 'Average Profit Margin',
      value: `${averageProfitMargin.toFixed(2)}%`,
      icon: Percent,
      color: 'text-green-500',
    },
    {
      title: 'Average Return Rate',
      value: `${(
        aggregatedStats.totalReturnRate / kpiData.sales.length
      ).toFixed(2)}%`,
      icon: TrendingDown,
      color: 'text-red-500',
    },
  ].filter(Boolean);

  return (
    <div className="py-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

      {/* KPI Table */}
      <div className="bg-white dark:bg-boxdark overflow-hidden shadow-sm sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-meta-4">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                  Financer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                  Units Sold
                </th>
                {user?.role !== 'seller' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                    Profit Margin
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-bodydark2 uppercase tracking-wider">
                  Return Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-boxdark divide-y divide-gray-200 dark:divide-gray-700">
              {kpiData.sales.map((item: any) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(item.calculationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.category.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.financer.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    Ksh {parseFloat(item.totalSalesRevenue).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.totalUnitsSold}
                  </td>
                  {user?.role !== 'seller' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {item.profitMargin}%
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {item.returnRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerKpis;