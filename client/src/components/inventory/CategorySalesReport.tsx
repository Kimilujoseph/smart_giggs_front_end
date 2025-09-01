import React, { useState, useEffect } from 'react';
import { getCategorySalesReport } from '../../api/sales_manager';
import { CircularProgress } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CategorySalesReportProps {
  categoryId: string;
}

const CategorySalesReport: React.FC<CategorySalesReportProps> = ({ categoryId }) => {
  const [salesData, setSalesData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [imeiSearch, setImeiSearch] = useState<string>('');
  const itemsPerPage = 100;

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const data = await getCategorySalesReport(categoryId, currentPage, itemsPerPage);
        setSalesData(data.data);
      } catch (error) {
        console.error('Failed to fetch sales report', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [categoryId, currentPage]);

  if (loading) {
    return <div className="flex justify-center items-center h-48"><CircularProgress /></div>;
  }

  if (!salesData || salesData.sales.length === 0) {
    return <div className="text-center p-10">No sales data available for this category.</div>;
  }

  const { analytics, sales, totalPages } = salesData;

  const uniqueStatuses = [...new Set(sales.map((sale: any) => sale.status))];

  const filteredSales = sales.filter((sale: any) => {
    const statusMatch = !statusFilter || sale.status === statusFilter;
    const imeiMatch = !imeiSearch || sale.IMEI?.toLowerCase().includes(imeiSearch.toLowerCase());
    return statusMatch && imeiMatch;
  });

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-black dark:text-white">Total Sales</h4>
          <p className="text-2xl font-bold text-primary">{analytics.totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-black dark:text-white">Total Profit</h4>
          <p className="text-2xl font-bold text-green-500">{analytics.totalProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-black dark:text-white">Total Commission</h4>
          <p className="text-2xl font-bold text-yellow-500">{analytics.totalCommission.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
          <h4 className="text-lg font-semibold text-black dark:text-white">Finance Amount</h4>
          <p className="text-2xl font-bold text-blue-500">{analytics.totalFinanceAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-white dark:bg-boxdark rounded-lg">
        <div>
          <label htmlFor="status-filter" className="text-sm font-medium text-black dark:text-white">Filter by Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="ml-2 p-2 border rounded-lg dark:bg-form-input dark:border-form-strokedark"
          >
            <option value="">All</option>
            {uniqueStatuses.map((status: string) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="imei-search" className="text-sm font-medium text-black dark:text-white">Search IMEI:</label>
          <input
            id="imei-search"
            type="text"
            value={imeiSearch}
            onChange={(e) => setImeiSearch(e.target.value)}
            placeholder="Enter IMEI..."
            className="ml-2 p-2 border rounded-lg dark:bg-form-input dark:border-form-strokedark"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">Date</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Model</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">IMEI/Serial</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Units Sold</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Product Cost</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Sold Price</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Profit</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Commission</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Status</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Batch No.</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Finance Status</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Seller</th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">Shop</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale: any, index: number) => (
                <tr key={`${sale._id?.productId}-${sale.IMEI}-${sale.createdAt}-${index}`} className="border-b border-[#eee] dark:border-strokedark">
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{new Date(sale.createdAt).toLocaleDateString()}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.productmodel}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.IMEI}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.totalsoldunits}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.productcost.toLocaleString()}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.soldprice.toLocaleString()}</p></td>
                  <td className="py-3 px-4"><p className="text-green-500">{sale.netprofit.toLocaleString()}</p></td>
                  <td className="py-3 px-4"><p className="text-yellow-500">{sale.commission.toLocaleString()}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.status}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.batchNumber}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.financeDetails?.financeStatus}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.sellername}</p></td>
                  <td className="py-3 px-4"><p className="text-black dark:text-white">{sale.shopname}</p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center p-4">
        <div className="text-sm text-black dark:text-white">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-stroke enabled:hover:bg-gray-2 enabled:dark:hover:bg-meta-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-black dark:text-white" />
          </button>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-stroke enabled:hover:bg-gray-2 enabled:dark:hover:bg-meta-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-black dark:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySalesReport;
