import React, { useState } from 'react';

const DateFilter: React.FC<{ onDateChange: (params: string) => void; }> = ({ onDateChange }) => {
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
        onDateChange(`startDate=${customRange.start}&endDate=${customRange.end}`);
      }
    };
  
    return (
      <div className="flex flex-wrap items-center gap-4 rounded-lg bg-white p-4 dark:bg-boxdark-2">
        {['week', 'month', 'year'].map(p => (
          <button key={p} onClick={() => handlePeriodChange(p)} className={`rounded-md px-4 py-2 text-base ${activePeriod === p ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-meta-4'}`}>
            This {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        <div className="flex items-center gap-3">
          <input type="date" onChange={e => setCustomRange(prev => ({ ...prev, start: e.target.value }))} className="rounded-md border-gray-300 bg-white p-2 text-base dark:border-gray-600 dark:bg-meta-4" />
          <span className="text-base">to</span>
          <input type="date" onChange={e => setCustomRange(prev => ({ ...prev, end: e.target.value }))} className="rounded-md border-gray-300 bg-white p-2 text-base dark:border-gray-600 dark:bg-meta-4" />
          <button onClick={handleCustomDateApply} onFocus={() => setActivePeriod('custom')} className={`rounded-md bg-green-500 px-4 py-2 text-base text-white ${activePeriod === 'custom' ? 'ring-2 ring-green-400' : ''}`}>
            Apply
          </button>
        </div>
      </div>
    );
  };

  export default DateFilter;