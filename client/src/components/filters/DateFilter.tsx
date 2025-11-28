import React, { useState } from 'react';

const DateFilter: React.FC<{ onDateChange: (params: string) => void }> = ({
  onDateChange,
}) => {
  const [activePeriod, setActivePeriod] = useState('day');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    if (period !== 'custom') {
      onDateChange(`period=${period}`);
    }
  };

  const handleCustomDateApply = () => {
    if (customRange.start && customRange.end) {
      onDateChange(`startDate=${customRange.start}&endDate=${customRange.end}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-4 dark:bg-boxdark-2 sm:flex-row sm:flex-wrap">
      <div className="flex flex-wrap justify-center gap-4">
        {['day', 'week', 'month', 'year'].map((p) => (
          <button
            key={p}
            onClick={() => handlePeriodChange(p)}
            className={`rounded-md px-4 py-2 text-base ${
              activePeriod === p
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-meta-4'
            }`}
          >
            {p === 'day' ? 'Today' : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
          </button>
        ))}
      </div>
      <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
        <input
          type="date"
          onChange={(e) =>
            setCustomRange((prev) => ({ ...prev, start: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 bg-white p-2 text-base dark:border-gray-600 dark:bg-meta-4 sm:w-auto"
        />
        <span className="hidden text-base sm:inline">to</span>
        <input
          type="date"
          onChange={(e) =>
            setCustomRange((prev) => ({ ...prev, end: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 bg-white p-2 text-base dark:border-gray-600 dark:bg-meta-4 sm:w-auto"
        />
        <button
          onClick={handleCustomDateApply}
          onFocus={() => setActivePeriod('custom')}
          className={`w-full rounded-md bg-green-500 px-4 py-2 text-base text-white sm:w-auto ${
            activePeriod === 'custom' ? 'ring-2 ring-green-400' : ''
          }`}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DateFilter;