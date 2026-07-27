import React from 'react';
import {
  Smartphone,
  Phone,
  Package,
  CreditCard,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { LinearProgress } from '@mui/material';

export interface KPIItem {
  target: number;
  actual: number;
  achievement: number;
  achieved: boolean;
  remaining?: number;
}

export interface KPIAchievementData {
  smartphones?: KPIItem;
  smallPhones?: KPIItem;
  accessories?: KPIItem;
  simCards?: KPIItem;
  overall?: {
    actual: number;
    target: number;
    achievement: number;
    achieved: boolean;
  };
}

export interface SummaryData {
  totalSales?: number;
  totalProfit?: number;
  totalCommission?: number;
  // Category Sales
  totalSmartphoneSales?: number;
  totalSmallPhoneSales?: number;
  totalAccessorySales?: number;
  totalSimCardSales?: number;
  // Category Profits
  totalSmartphoneProfit?: number;
  totalSmallPhoneProfit?: number;
  totalAccessoryProfit?: number;
  totalSimCardProfit?: number;
  // Category Commissions
  totalSmartphoneCommission?: number;
  totalSmallPhoneCommission?: number;
  totalAccessoryCommission?: number;
  totalSimCardCommission?: number;
  // Category Units
  totalSmartphoneUnitsSold?: number;
  totalSmallPhoneUnitsSold?: number;
  totalAccessoryUnitsSold?: number;
  totalSimCardUnitsSold?: number;
  // Account Receivable & Commissions
  accountReceivable?: Array<{ totalFinanceAmount: string }>;
  commissionAnalysis?: Array<{ totalCommissionPaid: string; totalCommissionPending: string }>;
  // KPI Achievement
  KPIachievement?: KPIAchievementData;
}

interface SalesPerformanceSummaryProps {
  summaryData: SummaryData;
  userRole?: string;
}

const formatKsh = (val: number | undefined) =>
  `KES ${Number(val || 0).toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;

export const SalesPerformanceSummary: React.FC<SalesPerformanceSummaryProps> = ({
  summaryData,
  userRole,
}) => {
  if (!summaryData) return null;

  const isSeller = userRole === 'seller';
  const kpi = summaryData.KPIachievement;

  const categories = [
    {
      id: 'smartphones',
      name: 'Smartphones',
      sales: summaryData.totalSmartphoneSales || 0,
      profit: summaryData.totalSmartphoneProfit || 0,
      commission: summaryData.totalSmartphoneCommission || 0,
      units: summaryData.totalSmartphoneUnitsSold || 0,
      kpiData: kpi?.smartphones,
      icon: Smartphone,
      color: 'blue',
      bgLight: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800/50',
      text: 'text-blue-600 dark:text-blue-400',
      pill: 'bg-blue-500',
    },
    {
      id: 'smallPhones',
      name: 'Small Phones',
      sales: summaryData.totalSmallPhoneSales || 0,
      profit: summaryData.totalSmallPhoneProfit || 0,
      commission: summaryData.totalSmallPhoneCommission || 0,
      units: summaryData.totalSmallPhoneUnitsSold || 0,
      kpiData: kpi?.smallPhones,
      icon: Phone,
      color: 'amber',
      bgLight: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800/50',
      text: 'text-amber-600 dark:text-amber-400',
      pill: 'bg-amber-500',
    },
    {
      id: 'accessories',
      name: 'Accessories',
      sales: summaryData.totalAccessorySales || 0,
      profit: summaryData.totalAccessoryProfit || 0,
      commission: summaryData.totalAccessoryCommission || 0,
      units: summaryData.totalAccessoryUnitsSold || 0,
      kpiData: kpi?.accessories,
      icon: Package,
      color: 'violet',
      bgLight: 'bg-violet-50 dark:bg-violet-950/30',
      border: 'border-violet-200 dark:border-violet-800/50',
      text: 'text-violet-600 dark:text-violet-400',
      pill: 'bg-violet-500',
    },
    {
      id: 'simCards',
      name: 'SIM Cards',
      sales: summaryData.totalSimCardSales || 0,
      profit: summaryData.totalSimCardProfit || 0,
      commission: summaryData.totalSimCardCommission || 0,
      units: summaryData.totalSimCardUnitsSold || 0,
      kpiData: kpi?.simCards,
      icon: CreditCard,
      color: 'emerald',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800/50',
      text: 'text-emerald-600 dark:text-emerald-400',
      pill: 'bg-emerald-500',
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI Achievement Section ── */}
      {kpi && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark p-5 shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">KPI Achievement Performance</h3>
                <p className="text-xs text-slate-400">Target vs Actual unit sales progress</p>
              </div>
            </div>

            {kpi.overall && (
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Overall Progress:</span>
                  <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                    {kpi.overall.actual} / {kpi.overall.target} ({kpi.overall.achievement}%)
                  </span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    kpi.overall.achieved
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {kpi.overall.achieved ? 'Achieved' : 'In Progress'}
                </span>
              </div>
            )}
          </div>

          {/* 4 Category KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {categories.map((cat) => {
              const itemKpi = cat.kpiData;
              const Icon = cat.icon;
              const target = itemKpi?.target || 0;
              const actual = itemKpi?.actual || cat.units;
              const achievement = itemKpi?.achievement || (target > 0 ? Number(((actual / target) * 100).toFixed(1)) : 0);
              const achieved = itemKpi?.achieved || (target > 0 && actual >= target);
              const remaining = itemKpi?.remaining ?? Math.max(0, target - actual);
              const progressPct = target > 0 ? Math.min(100, Math.round((actual / target) * 100)) : 0;

              return (
                <div
                  key={`kpi-${cat.id}`}
                  className={`rounded-xl border p-4 flex flex-col justify-between gap-3 ${cat.bgLight} ${cat.border}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${cat.text}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{cat.name}</span>
                    </div>
                    {achieved ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/50 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-lg font-black text-slate-800 dark:text-white">
                        {actual} <span className="text-xs font-normal text-slate-500">/ {target} units</span>
                      </span>
                      <span className={`text-xs font-extrabold ${achieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                        {achievement}%
                      </span>
                    </div>

                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${achieved ? 'bg-emerald-500' : cat.pill}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {remaining > 0 ? `${remaining} unit${remaining !== 1 ? 's' : ''} remaining` : 'Target met!'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Category Sales Breakdown Cards Grid ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Category Sales Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400">Detailed breakdown by item category</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={`cat-${cat.id}`}
                className={`rounded-xl border p-4 flex flex-col gap-2.5 ${cat.bgLight} ${cat.border}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm ${cat.text}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">{cat.name}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                    {cat.units} {cat.units === 1 ? 'unit' : 'units'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-xs text-slate-400 uppercase font-medium tracking-wider">Revenue</span>
                  <span className="text-lg font-black text-slate-800 dark:text-white leading-tight">
                    {formatKsh(cat.sales)}
                  </span>
                </div>

                <div className="border-t border-slate-200/60 dark:border-slate-700/60 pt-2 flex flex-col gap-1 text-[11px]">
                  {!isSeller && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 dark:text-slate-400">Profit:</span>
                      <span className={`font-bold ${cat.profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {formatKsh(cat.profit)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 dark:text-slate-400">Commission:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {formatKsh(cat.commission)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesPerformanceSummary;
