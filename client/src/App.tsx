import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate } from 'react-router-dom';
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
import { useAppContext } from './context/AppContext';
import InventoryManager from './components/inventory/InventoryManage';
import ProductView from './pages/ProductView';
import OutletManager from './components/outlets/Outlets';
import OutletView from './pages/OuletView';
import PointOfSale from './components/pointOfSale/PointOfSale';
import POSLayout from './layout/POSLayout';
import AssignmentHistory from './pages/AssignmentHistory';
import OutletInventoryView from './components/outlet/OutletInventory';
import SalesDashboard from './pages/Dashboard/SalesDashboard';
import OutletSales from './components/outlet/OutletSales';
import { CircularProgress } from '@mui/material';
import ErrorPage from './pages/ErrorPage';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { DecodedToken } from './types/decodedToken';
import jwt_decode from 'jwt-decode';
import Message from './components/alerts/Message';
import SalesBackup from './pages/SalesBackup';
import PointOfSales from './components/pointOfSale/PointOfSales';

import UserSales from './pages/UserSales';
import ShopSales from './pages/ShopSales';
import OutletSalesBackup from './components/outlet/OutletSalesBackup';

import FinancerManager from './components/financers/FinancerManager';
import FinancerSalesReport from './pages/FinancerSalesReport';

import CommissionManager from './components/commissions/CommissionManager';

import SalaryManager from './components/salaries/SalaryManager';

import SupplierManager from './components/suppliers/SupplierManager';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [serverReachable, setServerStatus] = useState<boolean>(true);
  const [message, setMessage] = useState<{
    code: number;
    message: string;
  } | null>(null);
  const { user, setUser } = useAppContext();

  useEffect(() => {
    const token = localStorage.getItem('tk');
    if (token && !user) {
      const decoded: DecodedToken = jwt_decode(token);
      const fetchUser = async () => {
        try {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${decoded.email}`,
            { withCredentials: true },
          );
          setUser(response.data.user);
        } catch (error) {
          setUser(null);
          localStorage.clear();
        }
      };
      fetchUser();
    }
    setLoading(false);
  }, [user, setUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-screen w-full bg-boxdark">
          <CircularProgress size={60} />
        </div>
      ) : (
        <Routes>
          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="Signin | smartGiggs" />
                <SignIn />
              </>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <>
                <PageTitle title="Signup | smartGiggs" />
                <SignUp />
              </>
            }
          />
          <Route path="*" element={<ErrorPage />} />

          {user ? (
            <Route element={<DefaultLayout children={undefined} />}>
              <Route
                path="/"
                element={
                  user?.role === 'seller' ? (
                    <Navigate to="/settings" replace />
                  ) : (
                    <>
                      <PageTitle title="Dashboard | smartGiggs" />
                      <Dashboard />
                    </>
                  )
                }
              />

              <Route
                path="/users"
                element={
                  <>
                    <PageTitle title="Users | smartGiggs" />
                    <UsersManager />
                  </>
                }
              />
              <Route
                path="/outlets"
                element={
                  <>
                    <PageTitle title="Outlets | smartGiggs" />
                    <OutletManager />
                  </>
                }
              />

              <Route
                path="/outlets/:shopname"
                element={
                  <>
                    <PageTitle title="Outlet View | smartGiggs" />
                    <OutletView />
                  </>
                }
              />

              <Route
                path="/inventory"
                element={
                  <>
                    <PageTitle title="Inventory | smartGiggs" />
                    <InventoryManager />
                  </>
                }
              />

              <Route
                path="/sales"
                element={
                  <>
                    <PageTitle title="Sales | smartGiggs" />
                    <SalesDashboard />
                  </>
                }
              />
              <Route
                path="/outlet/inventory"
                element={
                  <>
                    <PageTitle title="Outlet Inventory | smartGiggs" />
                    <OutletInventoryView />
                  </>
                }
              />
              <Route
                path="/outlet/inventory/:productId"
                element={
                  <>
                    <PageTitle title="Outlet Product | smartGiggs" />
                    <ProductView />
                  </>
                }
              />
              <Route
                path="/outlet/sales"
                element={
                  <>
                    <PageTitle title="Outlet Outlet | smartGiggs" />
                    <OutletSalesBackup />
                  </>
                }
              />
              <Route
                path="/inventory/:productId/:isMobile"
                element={
                  <>
                    <PageTitle title="Product View | smartGiggs" />
                    <ProductView />
                  </>
                }
              />
              <Route
                path="/settings"
                element={
                  <>
                    <PageTitle title="Account Settings | smartGiggs" />
                    <Settings2 />
                  </>
                }
              />
              <Route
                path="/assignmentHistory"
                element={
                  <>
                    <PageTitle title="Assignment History | smartGiggs" />
                    <AssignmentHistory />
                  </>
                }
              />
              <Route
                path="/userprofile"
                element={
                  <>
                    <PageTitle title="User View | smartGiggs" />
                    <UserView />
                  </>
                }
              />
              <Route
                path="/pointOfSale"
                element={
                  <>
                    <PageTitle title="Point of sale | smartGiggs" />
                    <PointOfSales />
                  </>
                }
              />
              <Route
                path="/user/sales"
                element={
                  <>
                    <PageTitle title="User Sales | smartGiggs" />
                    <UserSales />
                  </>
                }
              />
              <Route
                path="/shop/sales"
                element={
                  <>
                    <PageTitle title="Shop Sales | smartGiggs" />
                    <ShopSales />
                  </>
                }
              />

              <Route
                path="/financers"
                element={
                  <>
                    <PageTitle title="Financers | smartGiggs" />
                    <FinancerManager />
                  </>
                }
              />

              <Route
                path="/financer/report/:financerId"
                element={
                  <>
                    <PageTitle title="Financer Sales Report | smartGiggs" />
                    <FinancerSalesReport />
                  </>
                }
              />

              <Route
                path="/commissions"
                element={
                  <>
                    <PageTitle title="Commissions | smartGiggs" />
                    <CommissionManager />
                  </>
                }
              />

              <Route
                path="/salaries"
                element={
                  <>
                    <PageTitle title="Salaries | smartGiggs" />
                    <SalaryManager />
                  </>
                }
              />

              <Route
                path="/suppliers"
                element={
                  <>
                    <PageTitle title="Suppliers | smartGiggs" />
                    <SupplierManager />
                  </>
                }
              />

              <Route
                path="/my-commissions"
                element={
                  <>
                    <PageTitle title="My Commissions | smartGiggs" />
                    <CommissionManager />
                  </>
                }
              />

              <Route
                path="/my-salary"
                element={
                  <>
                    <PageTitle title="My Salary | smartGiggs" />
                    <SalaryManager />
                  </>
                }
              />
            </Route>
          ) : (
            <Route path="*" element={<Navigate to="/auth/signin" replace />} />
          )}
        </Routes>
      )}
    </>
  );
}

export default App;
