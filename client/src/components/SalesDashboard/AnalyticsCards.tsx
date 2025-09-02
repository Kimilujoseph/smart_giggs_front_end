
import React from 'react';

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, value, icon }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {icon}
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium">{title}</span>
        </div>
      </div>
    </div>
  );
};

interface AnalyticsCardsData {
    totalSales: number;
    totalProfit: number;
    totalCommission: number;
    totalFinanceAmount: number;
}

interface AnalyticsCardsProps {
  data: AnalyticsCardsData;
}

const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <AnalyticsCard
        title="Total Sales"
        value={`Ksh ${data.totalSales.toLocaleString()}`}
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 10v-1m0-6h.01M7 12h10" />
            </svg>
        }
      />
      <AnalyticsCard
        title="Total Profit"
        value={`Ksh ${data.totalProfit.toLocaleString()}`}
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        }
      />
      <AnalyticsCard
        title="Total Commission"
        value={`Ksh ${data.totalCommission.toLocaleString()}`}
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0V9" />
            </svg>
        }
      />
      <AnalyticsCard
        title="Total Finance Amount"
        value={`Ksh ${data.totalFinanceAmount.toLocaleString()}`}
        icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        }
      />
    </div>
  );
};

export default AnalyticsCards;
