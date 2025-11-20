import React from 'react';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

interface Sale {
  _id: {
    sellerId: number;
  };
  productname: string;
  category: string;
  productmodel: string;
  soldprice: number;
  productcost: number;
  netprofit: number;
  commission: number;
  commissionpaid: number;
  storage: string;
  sellername: string;
  shopname: string;
  status: string;
  paymentstatus: string;
  paymentDetails: {
    id: number;
    amount: string;
    paymentMethod: string;
    status: string;
    transactionId: string;
  };
  financeDetails: {
    financer: string;
    financeStatus: string;
  };
  IMEI: string;
  batchNumber: string;
  createdAt: string;
  saleId: number;
  totalsoldunits: number;
}

interface SalesTableProps {
  sales: Sale[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onSort: (field: keyof Sale) => void;
  onPayCommission: (sale: Sale) => void;
  onReverseSale: (sale: Sale) => void;
  userRole?: string;
  showActions?: boolean;
  showCostAndProfit?: boolean;
}

const ExportButtons: React.FC<{ data: Sale[] }> = ({ data }) => {
    const handleExportExcel = () => {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
      XLSX.writeFile(workbook, 'sales_data.xlsx');
    };
  
    return (
      <div className="flex space-x-2">
        <CSVLink
          data={data}
          filename={'sales_data.csv'}
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
        >
          Export to CSV
        </CSVLink>
        <button
          onClick={handleExportExcel}
          className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
        >
          Export to Excel
        </button>
      </div>
    );
  };

const SalesTable: React.FC<SalesTableProps> = ({
  sales,
  totalPages,
  currentPage,
  onPageChange,
  onSort,
  onPayCommission,
  onReverseSale,
  userRole,
  showActions = true,
  showCostAndProfit = true,
}) => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Sales Details
        </h4>
        <ExportButtons data={sales} />
      </div>
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Product Name</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Model</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Category</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Storage</th>
              {showCostAndProfit && <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Cost</th>}
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Sold Price</th>
              {showCostAndProfit && <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Gross Profit</th>}
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Commission</th>
              {showCostAndProfit && <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Net Profit</th>}
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Commission Paid</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Payment Status</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Financer</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Finance Status</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">IMEI/Batch</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Seller</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Shop</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Status</th>
              <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Date</th>
              {showActions && <th className="py-4 px-4 font-medium text-black dark:text-white whitespace-nowrap">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {sales.map((sale, index) => (
              <tr key={index} className="hover:bg-gray-2 dark:hover:bg-meta-4">
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.productname}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.productmodel}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.category}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.storage}</td>
                {showCostAndProfit && <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">Ksh {sale.productcost.toLocaleString()}</td>}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">Ksh {sale.soldprice.toLocaleString()}</td>
                {showCostAndProfit && <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">Ksh {sale.netprofit.toLocaleString()}</td>}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">Ksh {sale.commission.toLocaleString()}</td>
                {showCostAndProfit && <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">Ksh {(sale.netprofit - sale.commission).toLocaleString()}</td>}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.commissionpaid > 0 ? `${sale.commissionpaid.toLocaleString()}` : 'No'}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.paymentstatus}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.financeDetails?.financer}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.financeDetails?.financeStatus}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.IMEI || sale.batchNumber}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">
                  <Link to={`/user/sales?name=${sale.sellername}`} className="text-primary hover:underline">
                    {sale.sellername}
                  </Link>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">
                  <Link to={`/shop/sales?name=${sale.shopname}`} className="text-primary hover:underline">
                    {sale.shopname}
                  </Link>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{sale.status}</td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">{new Date(sale.createdAt).toLocaleDateString()}</td>
                {showActions && <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => onPayCommission(sale)}
                      className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 disabled:bg-gray-400"
                      disabled={sale.commission === 0 || sale.commissionpaid >= sale.commission || sale.status === 'RETURNED'}
                    >
                      Pay Commission
                    </button>
                    {userRole === 'superuser' && (
                      <button
                        onClick={() => onReverseSale(sale)}
                        className="inline-flex items-center justify-center rounded-md bg-meta-1 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 disabled:bg-gray-400"
                        disabled={sale.status === 'RETURNED'}
                      >
                        Reverse Sale
                      </button>
                    )}
                  </div>
                </td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="rounded-md bg-primary py-2 px-4 text-white disabled:bg-gray-4"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="rounded-md bg-primary py-2 px-4 text-white disabled:bg-gray-4"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesTable;