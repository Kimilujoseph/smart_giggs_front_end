import React, { useState } from 'react';
import { Supplier } from '../../types/supplier';
import { CircularProgress } from '@mui/material';
import { Search } from 'lucide-react';

interface SuppliersTableProps {
  suppliers: Supplier[];
  loading: boolean;
  onEdit: (supplier: Supplier) => void;
}

const SuppliersTable: React.FC<SuppliersTableProps> = ({ suppliers, loading, onEdit }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredSuppliers = suppliers.filter(
    (supplier) =>
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSuppliers = filteredSuppliers.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search suppliers..."
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
                <th className="py-4 px-6 font-semibold text-black dark:text-white xl:pl-11">Name</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Contact Name</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Phone</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Email</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Address</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="h-32">
                    <div className="flex justify-center items-center h-full">
                      <CircularProgress className="text-primary" />
                    </div>
                  </td>
                </tr>
              ) : currentSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-body dark:text-bodydark">
                    No suppliers found
                  </td>
                </tr>
              ) : (
                currentSuppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-meta-4/30">
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <h5 className="text-sm font-medium text-black dark:text-white">{supplier.name}</h5>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{supplier.contactName}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{supplier.phone || 'N/A'}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{supplier.email}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{supplier.address}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => onEdit(supplier)} className="text-primary">Edit</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredSuppliers.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <p className="text-sm text-body dark:text-bodydark">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredSuppliers.length)} of {filteredSuppliers.length} entries
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

export default SuppliersTable;
