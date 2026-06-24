import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number | ((prev: number) => number)) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
}) => {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 gap-4">
      {/* Entry count summary */}
      <div className="text-sm text-black dark:text-white">
        Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange((prev) => prev - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-stroke enabled:hover:bg-gray-2 enabled:dark:hover:bg-meta-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
        </button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(
              (num) =>
                num === 1 ||
                num === totalPages ||
                (num >= currentPage - 1 && num <= currentPage + 1),
            )
            .map((number, index, arr) => (
              <React.Fragment key={number}>
                {index > 0 && number > arr[index - 1] + 1 && (
                  <span className="px-2 py-1 text-black dark:text-white">...</span>
                )}
                <button
                  onClick={() => onPageChange(number)}
                  className={`min-w-[32px] px-2 py-1 rounded-lg border border-stroke ${
                    currentPage === number
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-2 dark:hover:bg-meta-4'
                  }`}
                >
                  {number}
                </button>
              </React.Fragment>
            ))}
        </div>

        <button
          onClick={() => onPageChange((prev) => prev + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-stroke enabled:hover:bg-gray-2 enabled:dark:hover:bg-meta-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5 text-black dark:text-white" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
