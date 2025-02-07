import React, { useEffect, useState } from 'react';
import { Package } from '../../types/package';
import axios from 'axios';
import ActionDropdown from './ActionDropdown';
import { CircularProgress } from '@mui/material';
import { getUsers } from '../../api/user_manager';
import { useNavigate } from 'react-router-dom';
import capitalizeFirstLetter from '../../common/Loader/TitleCase';
import Message from '../alerts/Message';
import { Search } from 'lucide-react';
import { DecodedToken } from '@/types/decodedToken';
import jwt_decode from 'jwt-decode';

interface UserTableProps {}
interface ActionPayload {
  action: string;
  user_id: string;
  email: string;
}
interface StatusPayload {
  email: string;
  status: string;
  user_id: string;
}

const UserTable: React.FC<UserTableProps> = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [resMessage, setResMessage] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [packageData, setPackageData] = useState<Package[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();
  const token = localStorage.getItem('tk');
  const currentUser: DecodedToken | null = jwt_decode(token!);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const user_res = await getUsers();
        if (user_res?.data) {
          setPackageData(user_res?.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search
  const filteredUsers = packageData.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Status update handler
  const updateUserStatus = async ({
    user_id,
    status,
    email,
  }: StatusPayload) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_HEAD}/api/user/update/status`,
        { email, id: user_id, status },
        { withCredentials: true },
      );
      if (res?.status === 200) {
        setMessage({ text: res.data.message || 'Success', type: 'success' });
        setResMessage(true);
        const res2 = await getUsers();
        setPackageData(res2?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateRole = async ({
    user_id,
    role,
  }: {
    user_id: string;
    role: string;
  }) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_SERVER_HEAD}/api/user/update/role`,
        { id: user_id, role },
        { withCredentials: true },
      );
      if (res?.status === 200) {
        setMessage({ text: res.data.message || 'Success', type: 'success' });
        setResMessage(true);
        const res2 = await getUsers();
        setPackageData(res2?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Action handler
  const handleAction = ({ action, user_id, email }: ActionPayload): void => {
    try {
      switch (action) {
        case 'delete':
          setIsVisible(true);
          break;
        case 'suspend':
          updateUserStatus({ email, user_id, status: 'suspended' });
          break;
        case 'active':
          updateUserStatus({ email, user_id, status: 'active' });
          break;
        case 'deactivate':
          updateUserStatus({ email, user_id, status: 'inactive' });
          break;
        case 'promote':
          updateRole({ user_id, role: 'manager' });
          break;
        case 'demote':
          updateRole({ user_id, role: 'seller' });
          break;
        case 'view':
          navigate(`/userprofile?email=${encodeURIComponent(email)}`);
          const selectedUser = packageData.find((user) => user.id === user_id);
          if (selectedUser) {
            localStorage.setItem(
              'selectedUserData',
              JSON.stringify(selectedUser),
            );
          }
          break;
        default:
          setIsVisible(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const closeModal = () => setIsVisible(false);

  useEffect(() => {
    const timer = setTimeout(() => setResMessage(false), 500);
    return () => clearTimeout(timer);
  }, [resMessage]);

  return (
    <div className="space-y-4">
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}

      {/* Search and Pagination Controls */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search users..."
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
      <div className="rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table id="users-table" className="w-full table-responsive">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-6 font-semibold text-black dark:text-white xl:pl-11">
                  Name
                </th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">
                  Email
                </th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">
                  Status
                </th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">
                  User Type
                </th>
                <th className="py-4 px-6 font-semibold text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="h-32">
                    <div className="flex justify-center items-center h-full">
                      <CircularProgress className="text-primary" />
                    </div>
                  </td>
                </tr>
              ) : currentUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-4 text-center text-body dark:text-bodydark"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                currentUsers
                  .sort((a) => (a.id === currentUser?.id ? -1 : 1))
                  .sort((a, b) => a.role.localeCompare(b.role))
                  .sort((a, b) =>
                    a.workingstatus.localeCompare(b.workingstatus),
                  )
                  .map((packageItem, key) => (
                    <tr
                      key={key}
                      className="hover:bg-gray-50 dark:hover:bg-meta-4/30"
                    >
                      <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                        <h5 className="text-sm font-medium text-black dark:text-white">
                          {packageItem.name}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                        <p className="text-sm text-black dark:text-white">
                          {packageItem.email}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                            packageItem.workingstatus === 'active'
                              ? 'bg-primary/10 text-primary'
                              : packageItem.workingstatus === 'suspended'
                              ? 'bg-danger/10 text-danger'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {capitalizeFirstLetter(packageItem.workingstatus)}
                        </span>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                            packageItem.role === 'seller'
                              ? 'bg-success/10 text-success'
                              : packageItem.role === 'manager'
                              ? 'bg-danger/10 text-danger'
                              : 'bg-warning/10 text-warning'
                          }`}
                        >
                          {capitalizeFirstLetter(packageItem.role)}
                        </span>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-6 dark:border-strokedark">
                        <ActionDropdown
                          handleAction={handleAction}
                          setUserId={setUserId}
                          selectedUser={packageItem}
                        />
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && filteredUsers.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <p className="text-sm text-body dark:text-bodydark">
            Showing {startIndex + 1} to{' '}
            {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length}{' '}
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

      {/* Modal */}
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-boxdark relative p-6 rounded-lg shadow-xl max-w-sm w-full">
            <p className="text-black dark:text-white text-lg font-medium mb-4">
              This feature is under maintenance
            </p>
            <button
              onClick={closeModal}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-boxdark"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
