import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Dashboard from './pages/Dashboard/Dashboard';
import DefaultLayout from './layout/DefaultLayout';
import UsersManager from './components/users/UsersManager';
import Settings from './pages/Settings';
import Settings2 from './pages/Settings2';
import UserView from './pages/UserView';
import { AppProvider } from './context/AppContext';
import InventoryManager from './components/inventory/InventoryManage';
import ProductView from './pages/ProductView';
import OutletManager from './components/outlets/Outlets';
import OutletView from './pages/OuletView';
import PointOfSales from './components/pointOfSale/PointOfSale';
import POSLayout from './layout/POSLayout';
import AssignmentHistory from './pages/AssignmentHistory';
import OutletInventoryView from './components/outlet/OutletInventory';
import Sales from './pages/Sales';
import OutletSales from './components/outlet/OutletSales';
import { CircularProgress } from '@mui/material';
import ErrorPage from './pages/ErrorPage';
import axios from 'axios';
import { set } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DecodedToken } from './types/decodedToken';
import jwt_decode from 'jwt-decode';
import Message from './components/alerts/Message';
import SalesBackup from './pages/SalesBackup';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [serverReachable, setServerStatus] = useState<boolean>(true);
  const [message, setMessage] = useState<{
    code: number;
    message: string;
  } | null>(null);
  const token = localStorage.getItem('tk');
  const user: DecodedToken | null = token ? jwt_decode(token) : null;
  const [currentUser, setCurrentUser] = useState<DecodedToken | null>(null);

  // Validate token on mount
  const validateToken = async () => {
    if (!token || !user) {
      localStorage.clear();
      navigate('/auth/signin');
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${user.email}`,
        { withCredentials: true },
      );
      if (response.status === 401) {
        localStorage.clear();
        navigate('/auth/signin');
      }
      setCurrentUser(response.data.user);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/auth/signin');
      }
    }
  };

  useEffect(() => {
    const serverStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/status`,
        );
        if (response.status !== 200) {
          throw new Error(
            response.data.message ||
              'Our servers are unreachable at the moment',
          );
        }
      } catch (error: any) {
        console.log(error);

        console.log(
          error.response?.data?.message ||
            error.message ||
            'Our servers are unreachable at the moment',
        );
        setServerStatus(false);
        setMessage({
          code: error.response?.status || error.code || 500,
          message:
            error.response?.data?.message ||
            error.message ||
            'Our servers are unreachable at the moment',
        });
        console.log(serverReachable);
      }
    };
    serverStatus();
    validateToken();
    // if (user?.role !== currentUser?.role) {
    //   localStorage.clear();
    //   navigate('/auth/signin');
    // } else {
    if (token && currentUser?.workingstatus.toLowerCase() === 'inactive') {
      setMessage({
        code: 403,
        message:
          'Your account has not been approved. Contact the manager for more information',
      });
    } else if (
      token &&
      currentUser?.workingstatus.toLowerCase() === 'suspended'
    ) {
      setMessage({
        code: 403,
        message:
          'Your account has been suspended. Contact the manager for more information',
      });
    }
    // }
    setLoading(false);
  }, [token, currentUser?.role, currentUser?.workingstatus, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 3000);
  }, []);

  if (!serverReachable) {
    return <ErrorPage code={message?.code} message={message?.message} />;
  }

  return (
    <AppProvider>
      {loading ? (
        <div className="flex justify-center items-center h-screen w-full bg-boxdark">
          <CircularProgress size={60} />
        </div>
      ) : message ? (
        <ErrorPage code={message.code} message={message.message} />
      ) : (
        <>
          <Routes>
            <Route element={<DefaultLayout children={undefined} />}>
              <Route
                path="/"
                element={
                  <>
                    <PageTitle title="Dashboard | Captech" />
                    <Dashboard />
                  </>
                }
              />

              <Route
                path="/users"
                element={
                  <>
                    <PageTitle title="Users | Captech" />
                    <UsersManager />
                  </>
                }
              />
              <Route
                path="/outlets"
                element={
                  <>
                    <PageTitle title="Outlets | Captech" />
                    <OutletManager />
                  </>
                }
              />

              <Route
                path="/outlets/:shopname"
                element={
                  <>
                    <PageTitle title="Outlet View | Captech" />
                    <OutletView />
                  </>
                }
              />

              <Route
                path="/inventory"
                element={
                  <>
                    <PageTitle title="Inventory | Captech" />
                    <InventoryManager />
                  </>
                }
              />

              <Route
                path="/sales"
                element={
                  <>
                    <PageTitle title="Sales | Captech" />
                    <SalesBackup />
                  </>
                }
              />
              <Route
                path="/outlet/inventory"
                element={
                  <>
                    <PageTitle title="Outlet Inventory | Captech" />
                    <OutletInventoryView />
                  </>
                }
              />
              <Route
                path="/outlet/inventory/:productId"
                element={
                  <>
                    <PageTitle title="Outlet Product | Captech" />
                    <ProductView />
                  </>
                }
              />
              <Route
                path="/outlet/sales"
                element={
                  <>
                    <PageTitle title="Outlet Outlet | Captech" />
                    <OutletSales />
                  </>
                }
              />
              <Route
                path="/inventory/:productId/:isMobile"
                element={
                  <>
                    <PageTitle title="Product View | Captech" />
                    <ProductView />
                  </>
                }
              />
              <Route
                path="/settings"
                element={
                  <>
                    <PageTitle title="Account Settings | Captech" />
                    <Settings2 />
                  </>
                }
              />
              <Route
                path="/assignmentHistory"
                element={
                  <>
                    <PageTitle title="Assignment History | Captech" />
                    <AssignmentHistory />
                  </>
                }
              />
              <Route
                path="/userprofile"
                element={
                  <>
                    <PageTitle title="User View | Captech" />
                    <UserView />
                  </>
                }
              />
              <Route
                path="/pointOfSale"
                element={
                  <>
                    <PageTitle title="Point of sale | Captech" />
                    <PointOfSales />
                  </>
                }
              />
            </Route>
            <Route
              path="/auth/signin"
              element={
                <>
                  <PageTitle title="Signin | Captech" />
                  <SignIn />
                </>
              }
            />
            <Route
              path="/auth/signup"
              element={
                <>
                  <PageTitle title="Signup | Captech" />
                  <SignUp />
                </>
              }
            />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </>
      )}
    </AppProvider>
  );
}

export default App;
