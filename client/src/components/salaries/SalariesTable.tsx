import React, { useState } from 'react';
import { SalaryPayment } from '../../types/salary';
import { CircularProgress } from '@mui/material';
import { Search } from 'lucide-react';

interface SalariesTableProps {
  salaries: SalaryPayment[];
  loading: boolean;
  onVoid: (salaryId: number) => void;
}

const SalariesTable: React.FC<SalariesTableProps> = ({ salaries, loading, onVoid }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredSalaries = salaries.filter(
    (salary) =>
      salary.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salary.employee.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSalaries = filteredSalaries.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search salaries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-4 pr-10 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
          />
          <Search className="absolute right-3 top-2.5 h-5 w-5 text-body dark:text-bodydark" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-responsive">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-6 font-semibold text-black dark:text-white xl:pl-11">Employee</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Amount Paid</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Payment Date</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Pay Period</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Processed By</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Status</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32">
                    <div className="flex justify-center items-center h-full">
                      <CircularProgress className="text-primary" />
                    </div>
                  </td>
                </tr>
              ) : currentSalaries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-body dark:text-bodydark">
                    No salaries found
                  </td>
                </tr>
              ) : (
                currentSalaries.map((salary) => (
                  <tr key={salary.id} className="hover:bg-gray-50 dark:hover:bg-meta-4/30">
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <h5 className="text-sm font-medium text-black dark:text-white">{salary.employee.name}</h5>
                      <p className="text-xs text-gray-500">{salary.employee.email}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{salary.amount}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{new Date(salary.paymentDate).toLocaleDateString()}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{salary.payPeriodMonth}/{salary.payPeriodYear}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{salary.processedBy.name}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        salary.status === 'VOIDED'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-success/10 text-success'
                      }`}>
                        {salary.status || 'PAID'}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      {salary.status !== 'VOIDED' && (
                        <button onClick={() => onVoid(salary.id)} className="text-danger">Void</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredSalaries.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <p className="text-sm text-body dark:text-bodydark">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredSalaries.length)} of {filteredSalaries.length} entries
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded border border-stroke p-2 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1))
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && <span className="px-2 py-1">...</span>}
                  <button
                    onClick={() => setCurrentPage(page)}
                    className={`rounded px-3 py-1 ${
                      currentPage === page
                        ? 'bg-primary text-white'
                        : 'border border-stroke hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4'
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded border border-stroke p-2 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalariesTable;
