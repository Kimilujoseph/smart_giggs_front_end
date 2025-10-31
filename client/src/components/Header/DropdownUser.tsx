import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ClickOutside from '../ClickOutside';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../../types/decodedToken';
import { User } from '../../types/user';
import axios from 'axios';
import Message from '../alerts/Message';
import { Avatar } from '@mui/material';
import { useAppContext } from '../../context/AppContext';

const DropdownUser = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, setUser } = useAppContext();
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const navigate = useNavigate();

  useEffect(() => {
    const tokenObj = localStorage.getItem('tk');
    if (!tokenObj) {
      setUser(null);
      navigate('/auth/signin');
      return;
    }
    const decoded: DecodedToken | null = jwt_decode(tokenObj!);
    if (!decoded?.email) {
      localStorage.clear();
      setUser(null);
      navigate('/auth/signin');
    }
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_SERVER_HEAD
          }/api/user/profile/${decoded?.email}`,
          { withCredentials: true },
        );
        if (response.status !== 200) {
          throw new Error(
            response.data.message ||
              'Failed to load user data. Try again later',
          );
        }
        setUser(response.data.user);
      } catch (error: any) {
        if (error.response.status === 404) {
          localStorage.clear();
          setUser(null);
          return navigate('/auth/signin');
        }
        setMessage({
          text: error.response?.data.message || 'Failed to load user data',
          type: `${error.response.status === 404 ? 'warning' : 'error'}`,
        });
      }
    };
    if (!user) {
      fetchUser();
    }
  }, [user, navigate, setUser]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/auth/signin');
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
      {user && (
        <ClickOutside
          onClick={() => setDropdownOpen(false)}
          className="relative max-sm:"
        >
          <Link
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-4"
            to="#"
          >
            <span className="hidden text-right lg:block">
              <span className="block text-md font-medium text-black dark:text-white">
                {user.name || 'Guest'}
              </span>
            </span>
            <div className="relative bg-slate-500 rounded-full h-12 w-12">
            <Avatar
              src={`${user.profileimage as string}`}
              alt={user.name}
              className="bg-red-400"
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              }}
              // className="w-24 h-24 md:w-100 md:h-100 rounded-full object-cover border-4 border-white shadow-lg"
            />
            </div>
            <svg
              className="hidden fill-current sm:block"
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M0.410765 0.910734C0.736202 0.585297 1.26384 0.585297 1.58928 0.910734L6.00002 5.32148L10.4108 0.910734C10.7362 0.585297 11.2638 0.585297 11.5893 0.910734C11.9147 1.23617 11.9147 1.76381 11.5893 2.08924L6.58928 7.08924C6.26384 7.41468 5.7362 7.41468 5.41077 7.08924L0.410765 2.08924C0.0853277 1.76381 0.0853277 1.23617 0.410765 0.910734Z"
                fill=""
              />
            </svg>
          </Link>

          {/* <!-- Dropdown Start --> */}
          {dropdownOpen && (
            <div
              className={`absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
            >
              <ul className="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
                <li>
                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                  >
                    <svg
                      className="fill-current"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M20.8656 8.86874C20.5219 8.49062 20.0406 8.28437 19.525 8.28437H19.4219C19.25 8.28437 19.1125 8.18124 19.0781 8.04374C19.0437 7.90624 18.975 7.80312 18.9406 7.66562C18.8719 7.52812 18.9406 7.39062 19.0437 7.28749L19.1125 7.21874C19.4906 6.87499 19.6969 6.39374 19.6969 5.87812C19.6969 5.36249 19.525 4.88124 19.1469 4.50312L17.8062 3.12812C17.0844 2.37187 15.8469 2.33749 15.0906 3.09374L14.9875 3.16249C14.8844 3.26562 14.7125 3.29999 14.5406 3.23124C14.4031 3.16249 14.2656 3.09374 14.0937 3.05937C13.9219 2.99062 13.8187 2.85312 13.8187 2.71562V2.54374C13.8187 1.47812 12.9594 0.618744 11.8937 0.618744H9.96875C9.45312 0.618744 8.97187 0.824994 8.62812 1.16874C8.25 1.54687 8.07812 2.02812 8.07812 2.50937V2.64687C8.07812 2.78437 7.975 2.92187 7.8375 2.99062C7.76875 3.02499 7.73437 3.02499 7.66562 3.05937C7.52812 3.12812 7.35625 3.09374 7.25312 2.99062L7.18437 2.88749C6.84062 2.50937 6.35937 2.30312 5.84375 2.30312C5.32812 2.30312 4.84687 2.47499 4.46875 2.85312L3.09375 4.19374C2.3375 4.91562 2.30312 6.15312 3.05937 6.90937L3.12812 7.01249C3.23125 7.11562 3.26562 7.28749 3.19687 7.39062C3.12812 7.52812 3.09375 7.63124 3.025 7.76874C2.95625 7.90624 2.85312 7.97499 2.68125 7.97499H2.57812C2.0625 7.97499 1.58125 8.14687 1.20312 8.52499C0.824996 8.86874 0.618746 9.34999 0.618746 9.86562L0.584371 11.7906C0.549996 12.8562 1.40937 13.7156 2.475 13.75H2.57812C2.75 13.75 2.8875 13.8531 2.92187 13.9906C2.99062 14.0937 3.05937 14.1969 3.09375 14.3344C3.12812 14.4719 3.09375 14.6094 2.99062 14.7125L2.92187 14.7812C2.54375 15.125 2.3375 15.6062 2.3375 16.1219C2.3375 16.6375 2.50937 17.1187 2.8875 17.4969L4.22812 18.8719C4.95 19.6281 6.1875 19.6625 6.94375 18.9062L7.04687 18.8375C7.15 18.7344 7.32187 18.7 7.49375 18.7687C7.63125 18.8375 7.76875 18.9062 7.94062 18.9406C8.1125 19.0094 8.21562 19.1469 8.21562 19.2844V19.4219C8.21562 20.4875 9.075 21.3469 10.1406 21.3469H12.0656C13.1312 21.3469 13.9906 20.4875 13.9906 19.4219V19.2844C13.9906 19.1469 14.0937 19.0094 14.2281 18.9406C14.3656 18.8719 14.5031 18.8031 14.6406 18.7344C14.7781 18.6656 14.9156 18.7 15.0187 18.8031L15.0875 18.8719C15.8437 19.6281 17.0812 19.6625 17.8031 18.9062L19.1437 17.5312C19.5219 17.1531 19.6937 16.6719 19.6937 16.1562C19.6937 15.6406 19.5219 15.1594 19.1437 14.7812L19.075 14.7125C18.9719 14.6094 18.9375 14.4375 19.0062 14.3344C19.075 14.1969 19.1094 14.0937 19.1781 13.9562C19.2469 13.8187 19.35 13.75 19.5219 13.75H19.625C20.5531 13.7156 21.4125 12.8562 21.4469 11.7906L21.4812 9.86562C21.4812 9.34999 21.275 8.86874 20.8656 8.86874Z"
                        fill=""
                      />
                      <path
                        d="M11 6.32498C8.42189 6.32498 6.32501 8.42186 6.32501 11C6.32501 13.5781 8.42189 15.675 11 15.675C13.5781 15.675 15.675 13.5781 15.675 11C15.675 8.42186 13.5781 6.32498 11 6.32498ZM11 14.1281C9.28126 14.1281 7.87189 12.7187 7.87189 11C7.87189 9.28123 9.28126 7.87186 11 7.87186C12.7188 7.87186 14.1281 9.28123 14.1281 11C14.1281 12.7187 12.7188 14.1281 11 14.1281Z"
                        fill=""
                      />
                    </svg>
                    Account Settings
                  </Link>
                </li>
              </ul>
              <button
                onClick={() => {
                  handleLogout();
                  setDropdownOpen(false);
                }}
                className="flex items-center gap-3.5 px-6 py-4 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
              >
                <svg
                  className="fill-current"
                  width="22"
                  height="22"
                  viewBox="0 0 22 22"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.5375 0.618744H11.6531C10.7594 0.618744 10.0031 1.37499 10.0031 2.26874V4.64062C10.0031 5.05312 10.3469 5.39687 10.7594 5.39687C11.1719 5.39687 11.55 5.05312 11.55 4.64062V2.23437C11.55 2.16562 11.5844 2.13124 11.6531 2.13124H15.5375C16.3625 2.13124 17.0156 2.78437 17.0156 3.60937V18.3562C17.0156 19.1812 16.3625 19.8344 15.5375 19.8344H11.6531C11.5844 19.8344 11.55 19.8 11.55 19.7312V17.3594C11.55 16.9469 11.2062 16.6031 10.7594 16.6031C10.3125 16.6031 10.0031 16.9469 10.0031 17.3594V19.7312C10.0031 20.625 10.7594 21.3812 11.6531 21.3812H15.5375C17.2219 21.3812 18.5625 20.0062 18.5625 18.3562V3.64374C18.5625 1.95937 17.1875 0.618744 15.5375 0.618744Z"
                    fill=""
                  />
                  <path
                    d="M6.05001 11.7563H12.2031C12.6156 11.7563 12.9594 11.4125 12.9594 11C12.9594 10.5875 12.6156 10.2438 12.2031 10.2438H6.08439L8.21564 8.07813C8.52501 7.76875 8.52501 7.2875 8.21564 6.97812C7.90626 6.66875 7.42501 6.66875 7.11564 6.97812L3.67814 10.4844C3.36876 10.7938 3.36876 11.275 3.67814 11.5844L7.11564 15.0906C7.25314 15.2281 7.45939 15.3312 7.66564 15.3312C7.87189 15.3312 8.04376 15.2625 8.21564 15.125C8.52501 14.8156 8.52501 14.3344 8.21564 14.025L6.05001 11.7563Z"
                    fill=""
                  />
                </svg>
                Log Out
              </button>
            </div>
          )}
          {/* <!-- Dropdown End --> */}
        </ClickOutside>
      )}
    </>
  );
};

export default DropdownUser;