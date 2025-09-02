
import React, { useState, useEffect } from 'react';

interface FiltersPanelProps {
  onFilterChange: (filters: any) => void;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ onFilterChange }) => {
  const [period, setPeriod] = useState('day');
  const [customDate, setCustomDate] = useState('');

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomDate(e.target.value);
  };

  useEffect(() => {
    const filters: any = { period };
    if (period === 'custom') {
      filters.date = customDate;
    }
    onFilterChange(filters);
  }, [period, customDate, onFilterChange]);

  return (
    <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            Period
          </label>
          <select
            name="period"
            value={period}
            onChange={handlePeriodChange}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {period === 'custom' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-black dark:text-white">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={customDate}
              onChange={handleDateChange}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-4 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;
