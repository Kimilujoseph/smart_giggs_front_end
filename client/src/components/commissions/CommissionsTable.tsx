import React, { useState } from 'react';
import { CommissionPayment } from '../../types/commission';
import { CircularProgress } from '@mui/material';
import { Search, X } from 'lucide-react';

interface CommissionsTableProps {
  commissions: CommissionPayment[];
  loading: boolean;
  onVoid: (commissionId: number) => void;
}

const SalesModal: React.FC<{ sales: any; onClose: () => void }> = ({ sales, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg p-6 w-full max-w-6xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sales Details</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="mb-6 overflow-x-auto">
          <h3 className="text-xl font-semibold mb-2">Mobile Sales</h3>
          {sales.mobileSales.length > 0 ? (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Item Name</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">IMEI</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Sold Price</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Profit</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Commission</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.mobileSales.map((sale: any) => (
                  <tr key={sale.id}>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.itemName}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.IMEI}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.soldPrice}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.profit}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.commission}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No mobile sales for this commission.</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <h3 className="text-xl font-semibold mb-2">Accessory Sales</h3>
          {sales.accessorySales.length > 0 ? (
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Item Name</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Color</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Quantity</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Sold Price</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Profit</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Commission</th>
                  <th className="py-2 px-4 font-semibold text-black dark:text-white">Date</th>
                </tr>
              </thead>
              <tbody>
                {sales.accessorySales.map((sale: any) => (
                  <tr key={sale.id}>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.itemName}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.color}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.quantity}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.soldPrice}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.profit}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{sale.commission}</td>
                    <td className="border-b border-[#eee] py-2 px-4 dark:border-strokedark">{new Date(sale.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No accessory sales for this commission.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const CommissionsTable: React.FC<CommissionsTableProps> = ({ commissions, loading, onVoid }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSales, setSelectedSales] = useState<any>(null);

  const handleViewSales = (sales: any) => {
    setSelectedSales(sales);
    setIsModalOpen(true);
  };

  const filteredCommissions = commissions.filter(
    (commission) =>
      commission.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commission.seller.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredCommissions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCommissions = filteredCommissions.slice(startIndex, endIndex);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search commissions..."
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
                <th className="py-4 px-6 font-semibold text-black dark:text-white xl:pl-11">Seller</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Amount Paid</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Payment Date</th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">Period</th>
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
              ) : currentCommissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 text-center text-body dark:text-bodydark">
                    No commissions found
                  </td>
                </tr>
              ) : (
                currentCommissions.map((commission) => (
                  <tr key={commission.id} className="hover:bg-gray-50 dark:hover:bg-meta-4/30">
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <h5 className="text-sm font-medium text-black dark:text-white">{commission.seller.name}</h5>
                      <p className="text-xs text-gray-500">{commission.seller.email}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{commission.amountPaid}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{new Date(commission.paymentDate).toLocaleDateString()}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{new Date(commission.periodStartDate).toLocaleDateString()} - {new Date(commission.periodEndDate).toLocaleDateString()}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <p className="text-sm text-black dark:text-white">{commission.processedBy.name}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                        commission.status === 'VOIDED'
                          ? 'bg-danger/10 text-danger'
                          : 'bg-success/10 text-success'
                      }`}>
                        {commission.status || 'PAID'}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                      <button onClick={() => handleViewSales(commission.sales)} className="text-primary mr-2">View Sales</button>
                      {commission.status !== 'VOIDED' && (
                        <button onClick={() => onVoid(commission.id)} className="text-danger">Void</button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && filteredCommissions.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <p className="text-sm text-body dark:text-bodydark">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredCommissions.length)} of {filteredCommissions.length} entries
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

      {isModalOpen && <SalesModal sales={selectedSales} onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default CommissionsTable;
