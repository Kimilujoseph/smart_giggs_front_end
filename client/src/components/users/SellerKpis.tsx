import React, { useState, useEffect } from 'react';
import { Card, CardContent, LinearProgress } from '@mui/material';
import { Award, CheckCircle, XCircle } from 'lucide-react';
import SuchEmpty from '../suchEmpty';
import { getSellerKpis, getSellerAchievement } from '../../api/kpi_manager';
import { DecodedToken } from '../../types/decodedToken';

interface SellerKpisProps {
  userId: string;
  dateFilter: string;
  user: DecodedToken | null;
}

const KpiAchievementCard: React.FC<{ achievementData: any }> = ({
  achievementData,
}) => {
  if (!achievementData) return null;

  const { targets, actualSales, achievement, overallAchievement, period } =
    achievementData;

  const renderCategoryProgress = (category: string) => {
    const target = targets[category];
    const actual = actualSales[category];
    const achieved = achievement[category];
    const progress = target > 0 ? (actual / target) * 100 : 0;

    return (
      <div key={category}>
        <div className="flex justify-between items-center mb-1">
          <span className="capitalize text-sm font-medium text-gray-700 dark:text-gray-300">
            {category}
          </span>
          <div className="flex items-center">
            <span
              className={`text-sm font-semibold ${
                achieved ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {actual} / {target}
            </span>
            {achieved ? (
              <CheckCircle className="h-4 w-4 text-emerald-500 ml-2" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 ml-2" />
            )}
          </div>
        </div>
        <LinearProgress
          variant="determinate"
          value={progress > 100 ? 100 : progress}
          className={achieved ? 'bg-emerald-500' : 'bg-red-500'}
        />
      </div>
    );
  };

  return (
    <Card className="dark:bg-boxdark dark:text-bodydark mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold capitalize">{period} KPI Achievement</h3>
          <div
            className={`flex items-center px-3 py-1 rounded-full ${
              overallAchievement
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            <Award className="h-5 w-5 mr-2" />
            <span className="font-semibold text-sm">
              {overallAchievement ? 'Achieved' : 'Not Achieved'}
            </span>
          </div>
        </div>
        <div className="space-y-4">
          {Object.keys(targets).map(renderCategoryProgress)}
        </div>
      </CardContent>
    </Card>
  );
};

const SellerKpis: React.FC<SellerKpisProps> = ({
  userId,
  dateFilter,
  user,
}) => {
  const [kpiData, setKpiData] = useState<any>(null);
  const [achievementData, setAchievementData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchKpiData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const filterParams = new URLSearchParams(dateFilter);
        const filters = Object.fromEntries(filterParams.entries());
        const period = filters.period || 'month'; // Default to month

        const [kpiResponse, achievementResponse] = await Promise.all([
          getSellerKpis({
            sellerId: userId,
            filters,
          }),
          getSellerAchievement({
            sellerId: userId,
            period,
          }),
        ]);

        setKpiData(kpiResponse.data);
        setAchievementData(achievementResponse.data);
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

  if (
    (!kpiData || !kpiData.sales || kpiData.sales.length === 0) &&
    !achievementData
  ) {
    return (
      <div className="text-center p-4">
        <SuchEmpty message="No performance data found for the selected period." />
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* KPI Achievement Card */}
      {achievementData && (
        <KpiAchievementCard achievementData={achievementData} />
      )}

      {/* KPI Table */}
      {kpiData && kpiData.sales && kpiData.sales.length > 0 ? (
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
      ) : (
        <div className="text-center p-4">
          <SuchEmpty message="No detailed KPI data found for the selected period." />
        </div>
      )}
    </div>
  );
};

export default SellerKpis;