import React, { useState } from 'react';

const DateFilter: React.FC<{ onDateChange: (params: string) => void }> = ({
  onDateChange,
}) => {
  const [activePeriod, setActivePeriod] = useState('month');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    if (period !== 'custom') {
      onDateChange(`period=${period}`);
    }
  };

  const handleCustomDateApply = () => {
    if (customRange.start && customRange.end) {
      // Convert plain date strings to ISO-8601 UTC DateTime
      // startDate: beginning of selected start day (UTC midnight)
      const startISO = new Date(customRange.start + 'T00:00:00.000Z').toISOString();
      // endDate: end of selected end day (UTC 23:59:59.999)
      const endISO = new Date(customRange.end + 'T23:59:59.999Z').toISOString();
      setActivePeriod('custom');
      onDateChange(`startDate=${startISO}&endDate=${endISO}`);
    }
  };

  const periods = [
    { key: 'day', label: 'Today' },
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-2.5 w-full">
      {/* Period Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {periods.map((p) => (
          <button
            key={p.key}
            onClick={() => handlePeriodChange(p.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activePeriod === p.key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      {activePeriod === 'custom' && (
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
          <input
            type="date"
            value={customRange.start}
            onChange={(e) => setCustomRange((prev) => ({ ...prev, start: e.target.value }))}
            className="flex-1 sm:flex-none min-w-[130px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          />
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">to</span>
          <input
            type="date"
            value={customRange.end}
            onChange={(e) => setCustomRange((prev) => ({ ...prev, end: e.target.value }))}
            className="flex-1 sm:flex-none min-w-[130px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-boxdark text-slate-700 dark:text-slate-200 px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500/30 transition"
          />
          <button
            onClick={handleCustomDateApply}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all shadow-sm whitespace-nowrap"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
};

export default DateFilter;