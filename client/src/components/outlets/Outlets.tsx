import { Link } from 'react-router-dom';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import axios from 'axios';
import OutletsTable from './OutletsTable';
import jwt_decode from 'jwt-decode';
import Message from '../alerts/Message';

const OutletManager = () => {
  const [toggleAddUser, setToggleAddUser] = useState<boolean>(false);
  const [formData, setFormData] = useState({ name: '', address: '' });
  const [userPermissions, setUserPermissions] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    type: string;
  } | null>();

  useEffect(() => {
    const token = localStorage.getItem('tk');

    if (token) {
      const decoded: any = jwt_decode(token);
      setUserPermissions(decoded.role);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/create-shop`,
        formData,
        { withCredentials: true },
      );

      if (response.status === 201) {
        setMessage({ text: 'Shop created successfully!', type: 'success' });
        setFormData({ name: '', address: '' });
      } else {
        throw new Error(response.data?.message || 'Failed to create shop');
      }
    } catch (error: any) {
      console.error('Error creating shop:', error);
      setMessage({
        text:
          error.response.data.message ||
          error.message ||
          'Something went wrong. Please try again later.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
      setToggleAddUser(false);
    }
  };

  return (
    <>
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      <Breadcrumb
        pageName={
          userPermissions === 'seller' ? 'Other Outlets' : 'Manage Outlets'
        }
      />

      <div className="w-full flex flex-col ">
        <div
          className={`flex items-center ${
            userPermissions === 'seller' && 'hidden'
          }`}
        >
          {!toggleAddUser && (
            <Link
              to="#"
              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-primary py-2 px-10 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10 mb-4"
              onClick={() => setToggleAddUser((prev) => !prev)}
            >
              <span>
                {/* SVG omitted for brevity */}
                Add Outlet
              </span>
            </Link>
          )}
        </div>
        {toggleAddUser && (
          <form
            onSubmit={handleSubmit}
            className="flex justify-center bg-white dark:bg-boxdark"
          >
            <div className="px-6.5 py-4 grid sm:grid-cols-2 gap-x-4 items-end w-full space-y-4">
              <div className="col-span-1 w-full">
                <label className="mb-2.5 block text-black dark:text-white">
                  Outlet Name
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Enter shop name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="col-span-1">
                <label className="mb-2.5 block text-black dark:text-white">
                  Outlet Address
                </label>
                <input
                  required
                  type="text"
                  name="address"
                  placeholder="Enter shop address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="sm:col-span-2 col-span-1 pt-6 flex justify-end gap-4">
                <button
                  disabled={submitting}
                  type="button"
                  onClick={() => setToggleAddUser(false)}
                  className={`flex justify-center rounded bg-warning p-2 px-4 font-medium text-gray hover:bg-opacity-90 ${
                    submitting && 'cursor-not-allowed opacity-50'
                  } `}
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className={`flex justify-center rounded bg-primary p-2 px-4 font-medium text-gray hover:bg-opacity-90 ${
                    submitting && 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
      {!toggleAddUser && <OutletsTable />}
    </>
  );
};

export default OutletManager;
