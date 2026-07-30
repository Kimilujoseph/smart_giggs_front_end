import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Store,
  TrendingUp,
  Award,
  DollarSign,
  Package,
  ChevronDown,
  ChevronUp,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Sparkles
} from 'lucide-react';

export interface CategoryMetrics {
  totalRevenue: number | string;
  grossProfit: number | string;
  totalUnitsSold: number | string;
  totalCommission: number | string;
  totalFinanceAmount: number | string;
}

export interface RawShopPerformanceItem {
  shopId: number;
  shopName: string;
  categories?: Record<string, CategoryMetrics>;
  totalRevenue?: number | string;
  grossProfit?: number | string;
}

export interface ProcessedShopPerformance {
  shopId: number;
  shopName: string;
  totalRevenue: number;
  grossProfit: number;
  totalUnitsSold: number;
  totalCommission: number;
  totalFinanceAmount: number;
  profitMargin: number;
  categories: Record<string, CategoryMetrics>;
}

const CATEGORY_COLORS: Record<string, string> = {
  smartphones: '#3B82F6', // Blue
  accessories: '#10B981', // Emerald/Green
  smallphones: '#F59E0B', // Amber
  simcards: '#8B5CF6',    // Purple
  tablets: '#EC4899',       // Pink
  other: '#64748B',         // Slate
};

const FALLBACK_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1'];

const formatCurrency = (val: number | string) => {
  const num = typeof val === 'number' ? val : parseFloat(val) || 0;
  return `Ksh ${num.toLocaleString()}`;
};

const formatCategoryName = (cat: string) => {
  if (!cat) return 'Uncategorized';
  return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
};

interface ShopPerformanceAnalyticsProps {
  data: RawShopPerformanceItem[];
}

export const ShopPerformanceAnalytics: React.FC<ShopPerformanceAnalyticsProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'stacked' | 'donut' | 'table'>('overview');
  const [selectedMetric, setSelectedMetric] = useState<'totalRevenue' | 'grossProfit' | 'totalUnitsSold' | 'totalFinanceAmount'>('totalRevenue');
  const [expandedShops, setExpandedShops] = useState<Record<number, boolean>>({});

  // Process & Normalize data
  const processedData: ProcessedShopPerformance[] = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((shop) => {
      const categories = shop.categories || {};
      let totalRevenue = 0;
      let grossProfit = 0;
      let totalUnitsSold = 0;
      let totalCommission = 0;
      let totalFinanceAmount = 0;

      const entries = Object.entries(categories);

      if (entries.length > 0) {
        entries.forEach(([_, metrics]) => {
          totalRevenue += parseFloat(metrics?.totalRevenue as any) || 0;
          grossProfit += parseFloat(metrics?.grossProfit as any) || 0;
          totalUnitsSold += parseFloat(metrics?.totalUnitsSold as any) || 0;
          totalCommission += parseFloat(metrics?.totalCommission as any) || 0;
          totalFinanceAmount += parseFloat(metrics?.totalFinanceAmount as any) || 0;
        });
      } else {
        totalRevenue = parseFloat(shop.totalRevenue as any) || 0;
        grossProfit = parseFloat(shop.grossProfit as any) || 0;
      }

      const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

      return {
        shopId: shop.shopId,
        shopName: shop.shopName || `Shop #${shop.shopId}`,
        totalRevenue,
        grossProfit,
        totalUnitsSold,
        totalCommission,
        totalFinanceAmount,
        profitMargin,
        categories,
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [data]);

  // Network Aggregates
  const networkTotals = useMemo(() => {
    return processedData.reduce(
      (acc, shop) => {
        acc.totalRevenue += shop.totalRevenue;
        acc.grossProfit += shop.grossProfit;
        acc.totalUnitsSold += shop.totalUnitsSold;
        acc.totalCommission += shop.totalCommission;
        acc.totalFinanceAmount += shop.totalFinanceAmount;
        return acc;
      },
      { totalRevenue: 0, grossProfit: 0, totalUnitsSold: 0, totalCommission: 0, totalFinanceAmount: 0 }
    );
  }, [processedData]);

  const topPerformer = processedData.length > 0 ? processedData[0] : null;

  // Extract all unique category names present in data
  const allCategoryNames = useMemo(() => {
    const set = new Set<string>();
    processedData.forEach((shop) => {
      Object.keys(shop.categories).forEach((cat) => set.add(cat.toLowerCase()));
    });
    return Array.from(set);
  }, [processedData]);

  // Data for Stacked Bar Chart
  const stackedChartData = useMemo(() => {
    return processedData.map((shop) => {
      const item: any = { shopName: shop.shopName };
      allCategoryNames.forEach((cat) => {
        const catData = shop.categories[cat] || shop.categories[Object.keys(shop.categories).find(k => k.toLowerCase() === cat) || ''];
        item[cat] = catData ? parseFloat(catData[selectedMetric] as any) || 0 : 0;
      });
      return item;
    });
  }, [processedData, allCategoryNames, selectedMetric]);

  // Network Category Distribution for Donut Chart
  const categoryDonutData = useMemo(() => {
    const catMap: Record<string, number> = {};

    processedData.forEach((shop) => {
      Object.entries(shop.categories).forEach(([catKey, metrics]) => {
        const key = catKey.toLowerCase();
        const val = parseFloat(metrics[selectedMetric] as any) || 0;
        catMap[key] = (catMap[key] || 0) + val;
      });
    });

    return Object.entries(catMap)
      .filter(([_, val]) => val > 0)
      .map(([name, value], idx) => ({
        name: formatCategoryName(name),
        value,
        color: CATEGORY_COLORS[name] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [processedData, selectedMetric]);

  const toggleExpandShop = (shopId: number) => {
    setExpandedShops((prev) => ({ ...prev, [shopId]: !prev[shopId] }));
  };

  const getMetricLabel = (metricKey: typeof selectedMetric) => {
    switch (metricKey) {
      case 'totalRevenue': return 'Revenue';
      case 'grossProfit': return 'Gross Profit';
      case 'totalUnitsSold': return 'Units Sold';
      case 'totalFinanceAmount': return 'Finance Amount';
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-boxdark rounded-xl p-8 text-center border border-stroke dark:border-strokedark shadow-sm">
        <Store className="w-12 h-12 text-slate-400 mx-auto mb-3 opacity-60" />
        <h4 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Shop Performance Data</h4>
        <p className="text-sm text-slate-400 mt-1">There is no performance data available for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-boxdark rounded-2xl p-6 shadow-sm border border-stroke dark:border-strokedark mb-8 transition-all">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-bold text-black dark:text-white">Shop Performance & Category Analytics</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time revenue, profit margin, volume, and category distribution per shop outlet.
          </p>
        </div>

        {/* View Controls & Metric Switchers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Metric Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['totalRevenue', 'grossProfit', 'totalUnitsSold', 'totalFinanceAmount'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${selectedMetric === m
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
                  }`}
              >
                {getMetricLabel(m)}
              </button>
            ))}
          </div>

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('overview')}
              title="Shop Overview Bar Chart"
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'overview' ? 'bg-white dark:bg-boxdark text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-black dark:hover:text-white'
                }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('stacked')}
              title="Category Stacked Breakdown"
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'stacked' ? 'bg-white dark:bg-boxdark text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-black dark:hover:text-white'
                }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('donut')}
              title="Category Distribution Share"
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'donut' ? 'bg-white dark:bg-boxdark text-blue-600 shadow-xs font-bold' : 'text-slate-500 hover:text-black dark:hover:text-white'
                }`}
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Highlights Banner Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Top Performer Card */}
        {topPerformer && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Top Outlet</span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white truncate">{topPerformer.shopName}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatCurrency(topPerformer.totalRevenue)} ({topPerformer.profitMargin.toFixed(1)}% margin)
              </p>
            </div>
          </div>
        )}

        {/* Network Revenue */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Outlet Revenue</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(networkTotals.totalRevenue)}</h4>
            <p className="text-xs text-slate-400">{processedData.length} Active Outlets</p>
          </div>
        </div>

        {/* Network Gross Profit */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Outlet Profit</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(networkTotals.grossProfit)}</h4>
            <p className="text-xs text-emerald-600 font-semibold">
              {networkTotals.totalRevenue > 0 ? `${((networkTotals.grossProfit / networkTotals.totalRevenue) * 100).toFixed(1)}% avg margin` : '0%'}
            </p>
          </div>
        </div>

        {/* Total Units & Financing */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Units & Financed</span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">{networkTotals.totalUnitsSold} Units Sold</h4>
            <p className="text-xs text-purple-600 font-medium">Financed: {formatCurrency(networkTotals.totalFinanceAmount)}</p>
          </div>
        </div>
      </div>

      {/* Main Display Container */}
      <div className="mt-6">
        {/* View Mode 1: Overview Bar Chart */}
        {viewMode === 'overview' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Outlet Revenue vs Gross Profit Comparison
              </h4>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={processedData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="shopName" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      formatCurrency(Number(value)),
                      name === 'totalRevenue' ? 'Revenue' : 'Gross Profit',
                    ]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  <Bar dataKey="totalRevenue" fill="#3B82F6" name="Revenue" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="grossProfit" fill="#10B981" name="Gross Profit" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* View Mode 2: Category Stacked Bar Chart */}
        {viewMode === 'stacked' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Category Contribution per Outlet ({getMetricLabel(selectedMetric)})
              </h4>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedChartData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="shopName" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" />
                  <YAxis
                    tickFormatter={(val) =>
                      selectedMetric === 'totalUnitsSold'
                        ? val
                        : `${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                    }
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => [
                      selectedMetric === 'totalUnitsSold' ? `${value} units` : formatCurrency(Number(value)),
                      formatCategoryName(name),
                    ]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '10px' }} />
                  {allCategoryNames.map((cat, idx) => (
                    <Bar
                      key={cat}
                      dataKey={cat}
                      name={formatCategoryName(cat)}
                      stackId="categories"
                      fill={CATEGORY_COLORS[cat] || FALLBACK_COLORS[idx % FALLBACK_COLORS.length]}
                      radius={idx === allCategoryNames.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* View Mode 3: Donut Chart Share */}
        {viewMode === 'donut' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDonutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                  >
                    {categoryDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) =>
                      selectedMetric === 'totalUnitsSold' ? `${val} units` : formatCurrency(Number(val))
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Donut Legend List */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Overall Category Breakdown ({getMetricLabel(selectedMetric)})
              </h4>
              {categoryDonutData.map((item) => {
                const totalMetricSum = categoryDonutData.reduce((a, b) => a + b.value, 0);
                const percent = totalMetricSum > 0 ? ((item.value / totalMetricSum) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {selectedMetric === 'totalUnitsSold' ? `${item.value} units` : formatCurrency(item.value)}
                      </span>
                      <span className="ml-2 text-xs font-medium text-slate-400">({percent}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Expandable Table Section */}
      <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            Detailed Outlet Breakdown & Category Performance
          </h4>
          <span className="text-xs text-slate-400">Click any outlet row to view category details</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3.5">Outlet Name</th>
                <th className="px-4 py-3.5">Revenue</th>
                <th className="px-4 py-3.5">Gross Profit</th>
                <th className="px-4 py-3.5">Margin %</th>
                <th className="px-4 py-3.5">Units Sold</th>
                <th className="px-4 py-3.5">Commission</th>
                <th className="px-4 py-3.5">Financed Amt</th>
                <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {processedData.map((shop) => {
                const isExpanded = !!expandedShops[shop.shopId];
                const categoriesList = Object.entries(shop.categories);

                return (
                  <React.Fragment key={shop.shopId}>
                    <tr
                      onClick={() => toggleExpandShop(shop.shopId)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Store className="w-4 h-4 text-blue-500" />
                        {shop.shopName}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {formatCurrency(shop.totalRevenue)}
                      </td>
                      <td className="px-4 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(shop.grossProfit)}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold rounded-full ${shop.profitMargin >= 20
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : shop.profitMargin >= 10
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                        >
                          {shop.profitMargin.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                        {shop.totalUnitsSold}
                      </td>
                      <td className="px-4 py-4 font-medium text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(shop.totalCommission)}
                      </td>
                      <td className="px-4 py-4 font-medium text-purple-600 dark:text-purple-400">
                        {formatCurrency(shop.totalFinanceAmount)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpandShop(shop.shopId);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Category Breakdown Sub-row */}
                    {isExpanded && (
                      <tr className="bg-slate-50/50 dark:bg-slate-900/40">
                        <td colSpan={8} className="px-6 py-4">
                          <div className="bg-white dark:bg-boxdark rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
                            <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                              Category Breakdown for {shop.shopName}
                            </h5>
                            {categoriesList.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {categoriesList.map(([catName, catData]) => {
                                  const catRev = parseFloat(catData.totalRevenue as any) || 0;
                                  const catProf = parseFloat(catData.grossProfit as any) || 0;
                                  const catUnits = parseFloat(catData.totalUnitsSold as any) || 0;
                                  const catComm = parseFloat(catData.totalCommission as any) || 0;
                                  const catFin = parseFloat(catData.totalFinanceAmount as any) || 0;

                                  const catMargin =
                                    catRev > 0
                                      ? ((catProf / catRev) * 100).toFixed(1)
                                      : '0';

                                  return (
                                    <div
                                      key={catName}
                                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between"
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                                          {formatCategoryName(catName)}
                                        </span>
                                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                                          {catUnits} units
                                        </span>
                                      </div>

                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">Revenue:</span>
                                          <span className="font-semibold text-slate-900 dark:text-white">
                                            {formatCurrency(catRev)}
                                          </span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span className="text-slate-500">Profit:</span>
                                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(catProf)} ({catMargin}%)
                                          </span>
                                        </div>
                                        {catComm > 0 && (
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Commission:</span>
                                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                              {formatCurrency(catComm)}
                                            </span>
                                          </div>
                                        )}
                                        {catFin > 0 && (
                                          <div className="flex justify-between">
                                            <span className="text-slate-500">Financed:</span>
                                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                                              {formatCurrency(catFin)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">No category details found.</p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShopPerformanceAnalytics;
