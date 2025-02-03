import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

interface Outlet {
  _id: string;
  name: string;
  location?: string;
  contact?: string;
  address?: string;
  availableStock?: number;
}

interface OutletTableProps {}

const OutletsTable: React.FC<OutletTableProps> = () => {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/shop/all`,
          {
            withCredentials: true,
          },
        );
        if (res.data) {
          const mappedOutlets = res.data.shops.map((shop: any) => ({
            ...shop,
            location: shop.location || '--',
            contact: shop.contact || '--',
            availableStock: shop.availableStock || 0,
          }));
          setOutlets(mappedOutlets);
        }
      } catch (error) {
        console.error('Error fetching outlets data:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredOutlets = outlets.filter(
    (outlet) =>
      outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      outlet?.address?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredOutlets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOutlets = filteredOutlets.slice(startIndex, endIndex);

  return (
    <>
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search outlets..."
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

      {/* Table */}
      <div className="rounded-lg border border-stroke bg-white dark:bg-boxdark shadow-lg dark:border-strokedark transition-all duration-300">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4 transition-colors duration-200">
                <th className="py-4 px-6 font-semibold text-black dark:text-white">
                  Outlet Name
                </th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">
                  Location
                </th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="h-32">
                    <div className="flex justify-center items-center h-full">
                      <CircularProgress className="text-primary" />
                    </div>
                  </td>
                </tr>
              ) : outlets.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="py-8 text-center text-gray-500 dark:text-gray-400 text-sm"
                  >
                    No outlets found
                  </td>
                </tr>
              ) : (
                currentOutlets.map((outlet) => (
                  <tr
                    key={outlet._id}
                    className="border-b border-[#eee] dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4/30 transition-colors duration-150"
                  >
                    <td className="py-4 px-6">
                      <h5 className="font-medium text-black dark:text-white">
                        {outlet.name}
                      </h5>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-700 dark:text-gray-200">
                        {outlet.address}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedOutlet(outlet);
                          localStorage.setItem(
                            'selectedOutlet',
                            JSON.stringify(outlet),
                          );
                          navigate(`/outlets/${outlet.name}`);
                        }}
                        className="group p-2 rounded-full hover:bg-gray-100 dark:hover:bg-meta-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-boxdark"
                      >
                        <svg
                          className="fill-primary dark:fill-white w-5 h-5 transform group-hover:scale-110 transition-transform duration-200"
                          viewBox="0 0 22 16"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z" />
                          <path d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredOutlets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <p className="text-sm text-body dark:text-bodydark">
            Showing {startIndex + 1} to{' '}
            {Math.min(endIndex, filteredOutlets.length)} of {filteredOutlets.length}{' '}
            entries
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
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1),
              )
              .map((page, index, array) => (
                <React.Fragment key={page}>
                  {index > 0 && array[index - 1] !== page - 1 && (
                    <span className="px-2 py-1">...</span>
                  )}
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
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="rounded border border-stroke p-2 hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OutletsTable;
