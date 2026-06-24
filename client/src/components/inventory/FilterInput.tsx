import React from 'react';

interface FilterInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  options?: string[];
  type?: string;
}

const FilterInput: React.FC<FilterInputProps> = ({
  label,
  value,
  onChange,
  onKeyDown,
  options = [],
  type = 'text',
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-black dark:text-white">{label}</label>
    {options.length > 0 ? (
      <select
        value={value}
        onChange={onChange}
        className="px-3 py-2 rounded-lg border border-stroke bg-transparent dark:bg-boxdark text-black dark:text-white focus:border-primary"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="px-3 py-2 rounded-lg border border-stroke bg-transparent text-black dark:text-white focus:border-primary"
      />
    )}
  </div>
);

export default FilterInput;
