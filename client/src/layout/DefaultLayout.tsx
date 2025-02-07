import React, { useState, ReactNode, useEffect } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import { Outlet, useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { DecodedToken } from '../types/decodedToken';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/alerts/Modal';

const DefaultLayout: React.FC<{ children: ReactNode }> = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<object>({});
  const { successMessage, setSuccessMessage } = useAppContext(); 
  const navigate = useNavigate();

  useEffect(() => {
    const tokenObj = localStorage.getItem('tk');
    if (tokenObj) {
      const decoded = jwt_decode(tokenObj) as DecodedToken;
      if (decoded.role === 'superuser' || decoded.role === 'manager' || decoded.role === 'seller') {
        setUser(decoded);
        setLoggedIn(true);
      }
    } else {
      navigate('/auth/signin');
    }
  }, []);

  return (
    <>
      {loggedIn && (
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {/* <!-- ===== Page Wrapper Start ===== --> */}
          <div className="flex h-screen overflow-hidden">
            {/* <!-- ===== Sidebar Start ===== --> */}
            <Sidebar
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            />
            {/* <!-- ===== Sidebar End ===== --> */}

            {/* <!-- ===== Content Area Start ===== --> */}
            <div id='content-area' className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden sm:m-2">
              {/* <!-- ===== Header Start ===== --> */}
              <Header
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                userData={user}
              />
              {/* <!-- ===== Header End ===== --> */}

              {/* <!-- ===== Modal Start ===== --> */}
              {successMessage && (
                <Modal
                  message={successMessage}
                  onClose={() => setSuccessMessage('')} // Clear the message when closing
                />
              )}
              {/* <!-- ===== Modal End ===== --> */}

              {/* <!-- ===== Main Content Start ===== --> */}
              <main className='p-2'>
                  <Outlet />
              </main>
              {/* <!-- ===== Main Content End ===== --> */}
            </div>
            {/* <!-- ===== Content Area End ===== --> */}
          </div>
          {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
      )}
    </>
  );
};

export default DefaultLayout;
