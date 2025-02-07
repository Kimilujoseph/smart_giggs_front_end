import { Link } from 'react-router-dom';
import { Package } from '../../types/package';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import UserTable from './UserTable';
import { getUsers } from '../../api/user_manager';
import axios from 'axios';
import Message from '../alerts/Message';

const UsersManager = () => {
  const [toggleAddUser, setToggleAddUser] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [userType, setUserType] = useState<string>('seller');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [nextofKinName, setNextofKinName] = useState<string>('');
  const [nextofKinPhone, setNextofKinPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [packageData, setPackageData] = useState<Package[]>([]);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  const fetchUsers = async () => {
    try {
      const user_res = await getUsers();
      if (user_res?.data) {
        setPackageData(user_res?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  interface ApiResponse {
    message: string;
    // Add other response fields if needed
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url =
        userType === 'seller'
          ? `${import.meta.env.VITE_SERVER_HEAD}/api/user/seller/signup`
          : userType === 'manager'
          ? `${import.meta.env.VITE_SERVER_HEAD}/api/user/manager/signup`
          : '';

      if (!url) {
        throw new Error('Invalid user type');
      }

      const res = await axios.post<ApiResponse>(
        url,
        {
          email: email,
          password: password,
          name: userName,
          phonenumber: phone,
          nextofkinname: nextofKinName,
          nextofkinphonenumber: nextofKinPhone,
        },
        { withCredentials: true },
      );

      if (res.status === 201) {
        setMessage({
          text: res?.data?.message || 'User created successfully',
          type: 'success',
        });
        fetchUsers();
      }
    } catch (error: any) {
      setMessage({
        text:
          error?.response?.data?.message ||
          error.message ||
          'An error occurred',
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
      <Breadcrumb pageName="Users" />
      <div className="flex items-center justify-between">
        {!toggleAddUser && (
          <Link
            to="#"
            className="inline-flex items-center justify-center gap-2.5 rounded-full border border-primary py-2 px-10 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10 mb-4"
            onClick={() => setToggleAddUser((prev) => !prev)}
          >
            <span>
              <svg
                className="fill-current"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_182_46495)">
                  <path
                    d="M18.875 11.4375C18.3125 10.8438 17.5625 10.5312 16.75 10.5312C16.125 10.5312 15.5625 10.7188 15.0625 11.0938C15 11.125 14.9688 11.1562 14.9062 11.2188C14.8438 11.1875 14.8125 11.125 14.75 11.0938C14.25 10.7188 13.6875 10.5312 13.0625 10.5312C12.9062 10.5312 12.7812 10.5312 12.6562 10.5625C11.7188 9.5 10.5625 8.75 9.3125 8.40625C10.625 7.75 11.5312 6.40625 11.5312 4.875C11.5312 2.6875 9.75 0.9375 7.59375 0.9375C5.40625 0.9375 3.65625 2.71875 3.65625 4.875C3.65625 6.4375 4.5625 7.78125 5.875 8.40625C4.5625 8.78125 3.40625 9.53125 2.4375 10.6562C1.125 12.2188 0.375 14.4062 0.3125 16.7812C0.3125 17.0312 0.4375 17.25 0.65625 17.3438C1.5 17.75 4.4375 19.0938 7.59375 19.0938C9.28125 19.0938 10.8438 18.8125 10.9062 18.8125C11.25 18.75 11.4688 18.4375 11.4062 18.0938C11.3438 17.75 11.0312 17.5312 10.6875 17.5938C10.6875 17.5938 9.15625 17.875 7.59375 17.875C5.0625 17.8438 2.65625 16.875 1.5625 16.375C1.65625 14.4375 2.3125 12.7187 3.375 11.4375C4.46875 10.125 5.96875 9.40625 7.59375 9.40625C9.03125 9.40625 10.375 10 11.4375 11.0312C11.2812 11.1562 11.125 11.2812 11 11.4062C10.4688 11.9688 10.1875 12.75 10.1875 13.5938C10.1875 14.4375 10.5 15.2188 11.1562 16C11.6875 16.6562 12.4375 17.2812 13.2812 18L13.3125 18.0312C13.5937 18.25 13.9062 18.5312 14.2188 18.8125C14.4062 19 14.6875 19.0938 14.9375 19.0938C15.1875 19.0938 15.4687 19 15.6562 18.8125C16 18.5312 16.3125 18.25 16.5938 18C17.4375 17.2812 18.1875 16.6562 18.7188 16C19.375 15.2188 19.6875 14.4375 19.6875 13.5938C19.6875 12.7812 19.4062 12.0312 18.875 11.4375ZM4.875 4.875C4.875 3.375 6.09375 2.1875 7.5625 2.1875C9.0625 2.1875 10.25 3.40625 10.25 4.875C10.25 6.375 9.03125 7.5625 7.5625 7.5625C6.09375 7.5625 4.875 6.34375 4.875 4.875ZM17.75 15.2188C17.2812 15.7812 16.5938 16.375 15.7812 17.0625C15.5312 17.2812 15.2188 17.5312 14.9062 17.7812C14.625 17.5312 14.3438 17.2812 14.0938 17.0938L14.0625 17.0625C13.25 16.375 12.5625 15.7812 12.0938 15.2188C11.625 14.6562 11.4062 14.1562 11.4062 13.625C11.4062 13.0937 11.5938 12.625 11.9062 12.2812C12.2188 11.9375 12.6563 11.75 13.0938 11.75C13.4375 11.75 13.75 11.8438 14 12.0625C14.125 12.1562 14.2188 12.25 14.3125 12.375C14.5938 12.7188 15.1875 12.7188 15.5 12.375C15.5938 12.25 15.7187 12.1562 15.8125 12.0625C16.0937 11.8438 16.4062 11.75 16.7188 11.75C17.1875 11.75 17.5938 11.9375 17.9062 12.2812C18.2188 12.625 18.4062 13.0937 18.4062 13.625C18.4375 14.1875 18.2188 14.6562 17.75 15.2188Z"
                    fill=""
                  />
                </g>
                <defs>
                  <clipPath id="clip0_182_46495">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </span>
            Add User
          </Link>
        )}
      </div>

      {/* form */}
      {/* <!-- Sign Up Form --> */}
      {toggleAddUser && (
        <div className="rounded mb-10 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <form onSubmit={handleAddUser}>
          <h1 className='p-4'>Account Information</h1>
          <div className="px-6.5 grid sm:grid-cols-4 gap-x-4 items-end">
              <div className="mb-3">
                <label className="mb-2.5 block text-black dark:text-white">
                  User Type
                </label>

                <div className="relative z-20 bg-transparent dark:bg-form-input">
                  <select
                    required
                    value={selectedOption}
                    onChange={(e) => {
                      setSelectedOption(e.target.value);
                      setUserType(e.target.value);
                      changeTextColor();
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary ${
                      isOptionSelected ? 'text-black dark:text-white' : ''
                    }`}
                  >
                    <option
                      value=""
                      disabled
                      className="text-body dark:text-bodydark"
                    >
                      Select user type
                    </option>
                    <option
                      value="seller"
                      className="text-body dark:text-bodydark"
                    >
                      Seller
                    </option>
                    <option
                      value="manager"
                      className="text-body dark:text-bodydark"
                    >
                      Manager
                    </option>
                    {/* <option
                      value="admin"
                      className="text-body dark:text-bodydark"
                    >
                      Seller Executive
                    </option> */}
                  </select>

                  <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                    <svg
                      className="fill-current"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g opacity="0.8">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                          fill=""
                        ></path>
                      </g>
                    </svg>
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <label className="mb-2.5 block text-black dark:text-white">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-3">
                <label className="mb-2.5 block text-black dark:text-white">
                  Email
                </label>
                <input
                  required
                  type="email"
                  placeholder="Enter your email address"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-3">
                <label className="mb-2.5 block text-black dark:text-white">
                  Phone
                </label>
                <input
                  required
                  type="tel"
                  placeholder="Enter phone number"
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="mb-3">
                <label className="mb-2 block text-black dark:text-white">
                  Password
                </label>
                <input
                  required
                  minLength={8}
                  type="password"
                  placeholder="Enter password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            <h1 className='px-4'>Next of Kin Information</h1>
            <div className="px-6.5 py-4 grid sm:grid-cols-4 gap-x-4 items-end">
              <div className="mb-3">
                <label className="mb-2.5 block text-black dark:text-white">
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  placeholder="Enter full name"
                  onChange={(e) => setNextofKinName(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>

              <div className="mb-3">
                <label className="mb-2.5 block text-black dark:text-white">
                  Phone Number
                </label>
                <input
                  required
                  type="phone"
                  placeholder="Enter phone number"
                  onChange={(e) => setNextofKinPhone(e.target.value)}
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
            </div>
            <div className='flex justify-end w-full'>
              <div className="flex gap-4 m-2 w-full md:w-1/3 xl:w-1/4">
                <button
                  onClick={() => setToggleAddUser(false)}
                  className={`mb-2.5 flex w-full justify-center rounded bg-warning p-3 font-medium text-boxdark hover:bg-opacity-90 ${
                    submitting && 'cursor-not-allowed opacity-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`mb-2.5 flex w-full justify-center rounded bg-primary p-3 font-medium text-boxdark hover:bg-opacity-90 ${
                    submitting && 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* user table */}
      {!toggleAddUser && <UserTable />}
    </>
  );
};

export default UsersManager;
