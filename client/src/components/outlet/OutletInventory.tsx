import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../outlets/Modal';
import jwt_decode from 'jwt-decode';
import { Shop } from '../../types/shop';
import { DecodedToken } from '../../types/decodedToken';
import {
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { CardContent } from '@mui/material';
import { format } from 'date-fns';
import {
  ShoppingCart,
  PhoneIcon,
  HeadphonesIcon,
  UserIcon,
  SettingsIcon,
  Share2,
  TrendingUp,
  Package,
  AlertTriangle,
  X,
  UserPlus,
  Eye,
  CornerUpLeft,
  DollarSign,
  Receipt,
} from 'lucide-react';
import Message from '../alerts/Message';
// import { getAllUsers } from '../../api/user_manager';
import ModalAlert from '../alerts/Alert';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import ClickOutside from '../ClickOutside';
import { getAllUsers } from '../../api/user_manager';
import ProductTransfer from '../inventory/ProductTransfer';
import { ExpenseFormData } from '../../types/expense';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// interface Notification {
//   type: string;
//   message: string;
// }

const OutletInventoryView: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [activeSection, setActiveSection] = useState<string>('Phones');
  const [showNewStock, setShowNewStock] = useState<boolean>(false);
  const [newStockTally, setNewStockTally] = useState<number>(0);
  // const [outletData, setOutletData] = useState<any | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const navigate = useNavigate();
  const [userPermissions, setUserPermissions] = useState<string | null>(null);
  const urlShopname = useParams().shopname;
  const [shopname, setShopName] = useState(useParams().shopname);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [assignToShop, setAssignToShop] = useState<boolean>(false);
  const [modalAlert, setModalAlert] = useState<{
    text: string;
    type: string;
  } | null>(null);
  const [mobileItems, setMobileItems] = useState<any | null>(null);
  const [accessoryItems, setAccessoryItems] = useState<any | null>(null);
  const [mobilePage, setMobilePage] = useState(1);
  const [accessoryPage, setAccessoryPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const [pendingMobiles, setPendingMobiles] = useState<any[]>([]);
  const [pendingAccessories, setPendingAccessories] = useState<any[]>([]);
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [reversingItem, setReversingItem] = useState<any | null>(null);
  const [reversalQuantity, setReversalQuantity] = useState(1);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseFormData, setExpenseFormData] = useState<ExpenseFormData>({
    shopId: 0,
    amount: 0,
    category: 'OTHER',
    subcategory: '',
    description: '',
    paymentMethod: 'CASH',
    vendorName: '',
    vendorContact: '',
  });
  const [submittingExpense, setSubmittingExpense] = useState(false);
  const [parsedShopId, setParsedShopId] = useState<number>(0);

  // Personal expense tracking
  const [myExpenseData, setMyExpenseData] = useState<any | null>(null);
  const [myExpensePage, setMyExpensePage] = useState(1);
  const [myExpenseLimit] = useState(10);
  const [myExpenseLoading, setMyExpenseLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('tk');

    if (token) {
      const decoded: any = jwt_decode(token);
      setUserPermissions(decoded.role);
    } else {
      localStorage.clear();
      navigate('/auth/signin');
    }
  }, []);

  const toggleActionsMenu = (id: string) => {
    setShowActionsMenu((prev) => (prev === id ? null : id));
  };
  const [outletFormData, setOutletFormData] = useState({
    name: '',
    address: '',
    id: '',
  });

  const sections = [
    {
      name: 'Phones',
      key: 'Phones',
      icon: PhoneIcon,
    },
    {
      name: 'Accessories',
      key: 'Accessories',
      icon: HeadphonesIcon,
    },
    {
      name: 'Transfer',
      key: 'Transfer',
      icon: Share2,
    },
    {
      name: 'Expenses',
      key: 'Expenses',
      icon: Receipt,
    },
    userPermissions === 'manager' || userPermissions === 'superuser'
      ? {
          name: 'Outlet Sellers',
          key: 'Sellers',
          icon: UserIcon,
        }
      : null,
    {
      name: 'Outlet Settings',
      key: 'Outlet Settings',
      icon: SettingsIcon,
    },
  ].filter(Boolean);

  const [assignmentData, setAssignmentData] = useState({
    name: '',
    shopname: shopname,
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    toDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleAssignmentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setAssignmentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (!shop) {
      return;
    }
    if (userPermissions !== 'manager' && userPermissions !== 'superuser') {
      return;
    }
    const fetchUsers = async () => {
      try {
        const user_res = await getAllUsers();
        if (user_res?.data) {
          setUsers(user_res?.data);
        }
      } catch (error: any) {
        alert('An error occurred while fetching users');
      }
    };
    fetchUsers();
  }, [shop]);

  const handleAssignSeller = async () => {
    if (
      !assignmentData.name ||
      !assignmentData.fromDate ||
      !assignmentData.toDate
    ) {
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/assignment/add`,
        assignmentData,
        { withCredentials: true },
      );

      if (response.status === 200) {
        setMessage({ text: 'Seller assigned successfully!', type: 'success' });
        setAssignToShop(false);
        // fetchShop();
      }
    } catch (error: any) {
      setMessage({
        text:
          error.response.data.message ||
          error.message ||
          'Failed to assign seller',
        type: 'error',
      });
    }
  };

  const calculateInventoryStats = () => {
    if (!shop) return null;

    const phoneItems = shop.phoneItems || [];
    const accessories = shop.stockItems || [];
    const totalPhones = phoneItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    const totalAccessories = accessories.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    const soldPhones = phoneItems.filter(
      (item: any) => item.stock.stockStatus.toLowerCase() === 'sold',
    ).length;

    const soldAccessories = accessories
      .filter((item: any) => item.stock.stockStatus === 'sold')
      .reduce((sum, item) => sum + item.quantity, 0);

    const phonesInStock = phoneItems.filter(
      (item: any) => item.stock.stockStatus.toLowerCase() === 'distributed',
    ).length;
    const accessoriesInStock = accessories.filter(
      (item: any) => item.stock.stockStatus.toLowerCase() === 'distributed',
    ).length;

    // Calculate items with low stock (less than 5 units)
    // const lowStockPhones = phoneItems.filter(
    //   (item) => item.quantity < 5,
    // ).length;
    // const lowStockAccessories = accessories.filter(
    //   (item) => item.quantity < 5,
    // ).length;

    // Calculate inventory value
    const phoneValue = phoneItems.reduce(
      (sum, item) =>
        sum + item.quantity * (Number(item.stock.productcost) || 0),
      0,
    );

    const accessoryValue = accessories.reduce(
      (sum, item) =>
        sum + item.quantity * (Number(item.stock.productcost) || 0),
      0,
    );

    return {
      totalPhones,
      totalAccessories,
      totalItems: totalPhones + totalAccessories,
      totalSoldItems: soldPhones + soldAccessories,
      totalItemsInStock: phonesInStock + accessoriesInStock,
      lowStockItems: shop.lowStockItems?.length || 0,
      phoneModels: phoneItems.length,
      accessoryModels: accessories.length,
      totalValue: phoneValue + accessoryValue,
      phoneCategories: [
        ...new Set(phoneItems.map((item) => item.stock.itemModel)),
      ].length,
      accessoryCategories: [
        ...new Set(accessories.map((item) => item.stock.itemModel)),
      ].length,
    };
  };

  const fetchUserData = async () => {
    setModalAlert(null);
    try {
      setLoading(true);
      const token = localStorage.getItem('tk');
      if (token) {
        const decoded = jwt_decode<DecodedToken>(token);
        if (!decoded.email) {
          setMessage({ text: 'Invalid token', type: 'error' });
          return;
        }
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${
            decoded.email
          }`,
          { withCredentials: true },
        );
        const { assignedShop } = response.data.user;

        if (!assignedShop && userPermissions === 'seller') {
          setModalAlert({
            text: 'No shop assigned to this user',
            type: 'error',
          });
        }
        setCurrentUser(response.data.user);
        
        // Parse and store the shopId
        const shopIdNum = Number(assignedShop.id);
        setParsedShopId(shopIdNum);
        
        setOutletFormData({
          name: assignedShop.shopName,
          address: assignedShop.address,
          id: assignedShop.id,
        });
        setShopName(assignedShop.shopName);
      }
    } catch (error: any) {
      setMessage({
        text:
          error.response.data.message ||
          error.message ||
          'Internal Server Error',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchShop = async () => {
    if (
      !shopname &&
      (userPermissions === 'manager' || userPermissions === 'superuser')
    )
      return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${shopname}`,
        {
          withCredentials: true,
        },
      );

      if (response.data) {
        let outlet = { ...response.data.shop.filteredShop };
        setShop(response.data.shop.filteredShop);
        
        // Parse and store the shopId - use _id from shop data
        const shopIdNum = Number(outlet._id || outlet.id);
        setParsedShopId(shopIdNum);
        
        setOutletFormData({
          name: outlet.name,
          address: outlet.address,
          id: outlet._id || outlet.id,
        });
      }
    } catch (error: any) {
      setMessage({
        text:
          error.response.data.message ||
          error.message ||
          'Internal Server Error',
        type: 'error',
      });
    }
  };

  const fetchMobileItems = async (page = 1) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/shop/${shopname}?page=${page}&limit=${itemsPerPage}&itemType=mobile&status=confirmed`,
        { withCredentials: true },
      );
      setMobileItems(response.data.shop.filteredShop.mobileItems);
    } catch (error) {
      console.error('Failed to fetch mobile items', error);
    }
  };

  const fetchAccessoryItems = async (page = 1) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/shop/${shopname}?page=${page}&limit=${itemsPerPage}&itemType=accessory&status=confirmed`,
        { withCredentials: true },
      );
      setAccessoryItems(response.data.shop.filteredShop.accessoryItems);
    } catch (error) {
      console.error('Failed to fetch accessory items', error);
    }
  };

  const fetchPendingStock = async () => {
    try {
      const mobileResponse = await axios.get(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/shop/${shopname}?itemType=mobile&status=pending`,
        { withCredentials: true },
      );
      const accessoryResponse = await axios.get(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/shop/${shopname}?itemType=accessory&status=pending`,
        { withCredentials: true },
      );

      const mobiles =
        mobileResponse.data.shop.filteredShop.mobileItems?.items || [];
      //console.log("@@@@@@@@", mobiles)
      const accessories =
        accessoryResponse.data.shop.filteredShop.accessoryItems?.items || [];
      // console.log("!@!@!@accessories", accessories)
      setPendingMobiles(mobiles);
      setPendingAccessories(accessories);
      setNewStockTally(mobiles.length + accessories.length);
    } catch (error) {
      console.error('Failed to fetch pending stock', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/shop/searchproducts/${shopname}?productName=${searchTerm}`,
        { withCredentials: true },
      );
      setSearchResults(response.data.products);
    } catch (error) {
      console.error('Failed to search products', error);
    }
  };

  useEffect(() => {
    if (userPermissions === 'seller' && !urlShopname) {
      fetchUserData();
    }
  }, [userPermissions]);

  useEffect(() => {
    if (shopname) {
      fetchShop();
      fetchMobileItems(mobilePage);
      fetchAccessoryItems(accessoryPage);
      fetchPendingStock();
    }
  }, [shopname, mobilePage, accessoryPage]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOutletFormData({ ...outletFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/update/${
          outletFormData.id
        }`,
        outletFormData,
        { withCredentials: true },
      );

      if (response.status === 200) {
        alert('Shop updated successfully!');
        let outletUpdated = { ...response.data.shop };
        setOutletFormData({
          name: outletUpdated.shopName,
          address: outletUpdated.address,
          id: outletUpdated.id,
        });
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      alert('Internal Server Error');
    }
  };

  // Fetch personal expenses when currentUser is available
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchMyExpenses = async () => {
      setMyExpenseLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/expenses/?page=${myExpensePage}&limit=${myExpenseLimit}&employeeId=${currentUser.id}`,
          { withCredentials: true },
        );
        setMyExpenseData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch personal expenses:', error);
      } finally {
        setMyExpenseLoading(false);
      }
    };

    fetchMyExpenses();
  }, [currentUser?.id, myExpensePage, myExpenseLimit]);

  // Personal expense data processing
  const myExpenseTrendData = useMemo(() => {
    if (!myExpenseData?.expenses) return [];
    return myExpenseData.expenses
      .slice()
      .sort((a: any, b: any) => new Date(a.expenseDate).getTime() - new Date(b.expenseDate).getTime())
      .map((exp: any) => ({
        date: format(new Date(exp.expenseDate), 'MMM dd'),
        amount: parseFloat(exp.amount),
        status: exp.status,
        category: exp.category,
      }));
  }, [myExpenseData]);

  const myExpenseCategoryBreakdown = useMemo(() => {
    if (!myExpenseData?.expenses) return [];
    const breakdown = myExpenseData.expenses.reduce((acc: any, exp: any) => {
      const category = exp.category || 'OTHER';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0 };
      }
      acc[category].value += parseFloat(exp.amount);
      return acc;
    }, {});
    return Object.values(breakdown);
  }, [myExpenseData]);

  const myExpenseStatusCount = useMemo(() => {
    if (!myExpenseData?.expenses) return {};
    return myExpenseData.expenses.reduce((acc: any, exp: any) => {
      acc[exp.status] = (acc[exp.status] || 0) + 1;
      return acc;
    }, {});
  }, [myExpenseData]);

  const getMyExpenseStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'REJECTED': return 'text-red-600 bg-red-100 dark:bg-red-900';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const myExpensePieColors = ['#0088FE', '#FF8042', '#00C49F', '#FFBB28', '#8884d8', '#82ca9d', '#FF6B6B'];

  const handleReversal = async (
    productItemId: string,
    quantity: number,
    productType: string,
  ) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/distribution/reversal-distribution`,
        {
          productItemId: productItemId,
          quantity: quantity,
          productType: productType,
          fromShop: shopname,
        },
        { withCredentials: true },
      );

      if (response.status === 200) {
        setMessage({ text: 'Product returned successfully!', type: 'success' });
        // Refresh data
        fetchMobileItems(mobilePage);
        fetchAccessoryItems(accessoryPage);
      }
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Failed to return product',
        type: 'error',
      });
    } finally {
      setLoading(false);
      setReversalModalOpen(false);
      setReversingItem(null);
    }
  };

  const handleReturnClick = (
    item: any,
    productType: 'mobile' | 'accessory',
  ) => {
    if (productType === 'mobile') {
      if (
        window.confirm(
          'Are you sure you want to return this mobile? The quantity is 1.',
        )
      ) {
        handleReversal(item.id, 1, 'mobile');
      }
    } else {
      // accessory
      setReversingItem(item);
      setReversalQuantity(1); // Reset quantity
      setReversalModalOpen(true);
    }
  };

  const handleExpenseChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setExpenseFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shop && parsedShopId === 0) {
      setMessage({ text: 'Shop data not available. Please refresh the page.', type: 'error' });
      return;
    }

    // Use parsedShopId which was set when shop data was fetched
    const shopIdToUse = parsedShopId || Number(shop?.id);
    
    if (!shopIdToUse || isNaN(shopIdToUse) || shopIdToUse === 0) {
      setMessage({ 
        text: 'Invalid shop ID. Please refresh the page and try again.', 
        type: 'error' 
      });
      return;
    }

    if (!expenseFormData.amount || expenseFormData.amount <= 0) {
      setMessage({ text: 'Please enter a valid amount', type: 'error' });
      return;
    }

    if (!expenseFormData.description) {
      setMessage({ text: 'Please enter a description', type: 'error' });
      return;
    }

    try {
      setSubmittingExpense(true);
      
      const expensePayload = {
        shopId: shopIdToUse,
        amount: expenseFormData.amount,
        category: expenseFormData.category,
        subcategory: expenseFormData.subcategory,
        description: expenseFormData.description,
        paymentMethod: expenseFormData.paymentMethod,
        vendorName: expenseFormData.vendorName,
        vendorContact: expenseFormData.vendorContact,
      };
      
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/expenses/create`,
        expensePayload,
        { withCredentials: true },
      );

      if (response.status === 200 || response.status === 201) {
        setMessage({ text: 'Expense created successfully!', type: 'success' });
        setExpenseModalOpen(false);
        setExpenseFormData({
          shopId: 0,
          amount: 0,
          category: 'OTHER',
          subcategory: '',
          description: '',
          paymentMethod: 'CASH',
          vendorName: '',
          vendorContact: '',
        });
        // Refresh personal expense data
        setMyExpensePage(1);
        if (currentUser?.id) {
          const response = await axios.get(
            `${import.meta.env.VITE_SERVER_HEAD}/api/expenses/?page=1&limit=${myExpenseLimit}&employeeId=${currentUser.id}`,
            { withCredentials: true },
          );
          setMyExpenseData(response.data.data);
        }
      }
    } catch (error: any) {
      setMessage({
        text:
          error.response?.data?.message ||
          error.message ||
          'Failed to create expense',
        type: 'error',
      });
    } finally {
      setSubmittingExpense(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'Transfer':
        return (
          <ProductTransfer
            currentUser={currentUser}
            mobileItems={mobileItems}
            accessoryItems={accessoryItems}
            refreshData={() => {
              fetchMobileItems(mobilePage);
              fetchAccessoryItems(accessoryPage);
            }}
          />
        );
      case 'Expenses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                My Expense Trend
              </h2>
              <button
                onClick={() => setExpenseModalOpen(true)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Receipt className="w-4 h-4 mr-2" />
                Add New Expense
              </button>
            </div>

            {/* Expense Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</p>
                    <p className="text-2xl font-bold text-primary">
                      Ksh {myExpenseData?.totalAmount ? Number(myExpenseData.totalAmount).toLocaleString() : '0'}
                    </p>
                  </div>
                  <TrendingUp className="h-6 w-6 text-red-500" />
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      Ksh {myExpenseData?.averageAmount ? Number(myExpenseData.averageAmount).toLocaleString() : '0'}
                    </p>
                  </div>
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Count</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {myExpenseData?.totalCount || 0}
                    </p>
                  </div>
                  <Receipt className="h-6 w-6 text-green-500" />
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Status Breakdown</p>
                    <p className="text-sm">
                      <span className="text-green-600">{myExpenseStatusCount['APPROVED'] || 0}</span> /{' '}
                      <span className="text-red-600">{myExpenseStatusCount['REJECTED'] || 0}</span> /{' '}
                      <span className="text-yellow-600">{myExpenseStatusCount['PENDING'] || 0}</span>
                    </p>
                  </div>
                  <Package className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Expense Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Trend Line Chart */}
              <div className="rounded-lg bg-white dark:bg-boxdark shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">My Expenses Over Time</h3>
                {myExpenseLoading ? (
                  <div className="flex items-center justify-center h-60">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                ) : myExpenseTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={myExpenseTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `Ksh ${Number(value).toLocaleString()}`} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#FF6B6B" name="Amount" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 h-60 flex items-center justify-center">No expense trend data</p>
                )}
              </div>

              {/* Expense Category Pie Chart */}
              <div className="rounded-lg bg-white dark:bg-boxdark shadow-md p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">My Expenses by Category</h3>
                {myExpenseLoading ? (
                  <div className="flex items-center justify-center h-60">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                  </div>
                ) : myExpenseCategoryBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={myExpenseCategoryBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {myExpenseCategoryBreakdown.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={myExpensePieColors[index % myExpensePieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `Ksh ${Number(value).toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 h-60 flex items-center justify-center">No category data</p>
                )}
              </div>
            </div>

            {/* Expense Table with Pagination */}
            <div className="rounded-lg bg-white dark:bg-boxdark shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Recent Expenses</h3>
                {myExpenseData && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setMyExpensePage(prev => Math.max(1, prev - 1))}
                      disabled={myExpensePage === 1 || myExpenseLoading}
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-meta-4 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Previous
                    </button>
                    <span className="text-sm dark:text-bodydark">
                      Page {myExpensePage} of {myExpenseData.totalPages}
                    </span>
                    <button
                      onClick={() => setMyExpensePage(prev => Math.min(myExpenseData.totalPages, prev + 1))}
                      disabled={myExpensePage === myExpenseData.totalPages || myExpenseLoading}
                      className="px-3 py-1 rounded bg-gray-200 dark:bg-meta-4 disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>

              {myExpenseLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                </div>
              ) : myExpenseData?.expenses && myExpenseData.expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-6 py-3">Date</th>
                        <th scope="col" className="px-6 py-3">Description</th>
                        <th scope="col" className="px-6 py-3">Category</th>
                        <th scope="col" className="px-6 py-3">Amount</th>
                        <th scope="col" className="px-6 py-3">Shop</th>
                        <th scope="col" className="px-6 py-3">Payment</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                        <th scope="col" className="px-6 py-3">Approved By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myExpenseData.expenses.map((expense: any) => (
                        <tr key={expense.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                          <td className="px-6 py-4">{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</td>
                          <td className="px-6 py-4">{expense.description}</td>
                          <td className="px-6 py-4">{expense.category}{expense.subcategory && ` - ${expense.subcategory}`}</td>
                          <td className="px-6 py-4 font-medium">Ksh {Number(expense.amount).toLocaleString()}</td>
                          <td className="px-6 py-4">{expense.shops?.shopName || '-'}</td>
                          <td className="px-6 py-4">{expense.paymentMethod}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getMyExpenseStatusColor(expense.status)}`}>
                              {expense.status}
                            </span>
                            {expense.status === 'REJECTED' && expense.rejectionReason && (
                              <p className="mt-1 text-xs text-red-500" title={expense.rejectionReason}>
                                {expense.rejectionReason.slice(0, 30)}...
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">{expense.approvedBy?.name || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No personal expense data available</p>
              )}
            </div>
          </div>
        );
      case 'Phones':
      case 'Accessories': {
        const isPhones = activeSection === 'Phones';
        const items = isPhones ? mobileItems : accessoryItems;
        const page = isPhones ? mobilePage : accessoryPage;
        const setPage = isPhones ? setMobilePage : setAccessoryPage;
        const searchItems = isPhones
          ? searchResults?.phoneItems
          : searchResults?.stockItems;

        const displayItems = searchResults ? searchItems?.items : items?.items;

        return (
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
            <div className="p-4 bg-gray-50 dark:bg-meta-4 flex justify-between items-center">
              <h2 className="md:text-xl font-bold text-gray-800 dark:text-white">
                Inventory /{' '}
                <span className="text-sm text-primary">{activeSection}</span>
              </h2>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by IMEI or name"
                  className="p-2 border rounded-lg dark:bg-boxdark"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 rounded-lg bg-primary text-white"
                >
                  Search
                </button>
              </div>
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto mx-auto">
                <thead className="text-xs">
                  <tr className="bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300 text-center">
                    <th className="p-3">#</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Model</th>
                    <th className="p-3">Brand</th>
                    <th className="p-3">Quantity</th>
                    {userPermissions !== 'seller' && (
                      <th className="p-3">Cost</th>
                    )}
                    <th className="p-3">{isPhones ? 'IMEI' : 'Batch'}</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm lg:text-base text-center">
                  {displayItems?.map((item: any, index: number) => {
                    const details = isPhones ? item.mobiles : item.accessories;
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors ${
                          index % 2 === 1
                            ? 'bg-bodydark3 dark:bg-meta-4'
                            : 'bg-white dark:bg-boxdark'
                        }`}
                      >
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">
                          {details.categories.itemName}
                        </td>
                        <td className="p-3">{details.categories.itemModel}</td>
                        <td className="p-3">{details.categories.brand}</td>
                        <td className="p-3">{item.quantity}</td>
                        {userPermissions !== 'seller' && (
                          <td className="p-3">{details.productCost}</td>
                        )}
                        <td className="p-3">
                          {isPhones ? details.IMEI : details.batchNumber}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() =>
                              handleReturnClick(
                                item,
                                isPhones ? 'mobile' : 'accessory',
                              )
                            }
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-primary transition-colors"
                          >
                            <CornerUpLeft className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!searchResults && items && (
              <div className="flex justify-end mt-4 p-4">
                <button
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page === items.totalPages}
                  className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        );
      }

      case 'Sellers':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                Outlet Sellers
              </h2>
              <button
                onClick={() => setAssignToShop(true)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Assign New Seller
              </button>
            </div>

            <Dialog
              open={assignToShop}
              onClose={() => setAssignToShop(false)}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle className="bg-boxdark/95">
                <div className="flex justify-between items-center">
                  <span className="text-title-sm font-medium text-black dark:text-white">
                    Assign Seller to Shop
                  </span>
                  <button
                    onClick={() => setAssignToShop(false)}
                    className="p-1 hover:bg-gray dark:hover:bg-boxdark-2 rounded-full"
                  >
                    <X className="w-5 h-5 text-body dark:text-bodydark" />
                  </button>
                </div>
              </DialogTitle>
              <DialogContent className="dark:bg-boxdark">
                <div className="mt-4 space-y-4">
                  {users.filter((user: any) => user.role === 'seller')
                    .length === 0 && (
                    <div className="dark:text-red-500 text-sm">
                      No sellers to be assigned
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-black dark:text-white">
                      Select Seller
                    </label>
                    <select
                      required
                      name="name"
                      value={assignmentData.name}
                      onChange={handleAssignmentChange}
                      className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select a seller</option>
                      {users.map(
                        (user: any) =>
                          user.role === 'seller' && (
                            <option key={user.id} value={user.name}>
                              {user.name}
                            </option>
                          ),
                      )}
                    </select>
                  </div>

                  <div className="flex md:flex-row flex-col gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black dark:text-white">
                        From Date
                      </label>
                      <input
                        required
                        type="date"
                        name="fromDate"
                        min={format(new Date(), 'yyyy-MM-dd')}
                        value={assignmentData.fromDate}
                        onChange={handleAssignmentChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 text-black dark:text-white bg-transparent dark:bg-boxdark-2/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-black dark:text-white">
                        To Date
                      </label>
                      <input
                        required
                        type="date"
                        name="toDate"
                        value={assignmentData.toDate}
                        onChange={handleAssignmentChange}
                        className="w-full px-3 py-2 rounded-lg border border-slate-700 text-black dark:text-white bg-transparent dark:bg-boxdark-2/50 focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setAssignToShop(false)}
                      className="px-4 py-2 text-body dark:text-bodydark bg-gray dark:bg-boxdark-2 rounded-lg hover:bg-gray-2 dark:hover:bg-boxdark transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignSeller}
                      className="px-4 py-2 text-white bg-primary rounded-lg hover:opacity-90 transition-colors"
                    >
                      Assign Seller
                    </button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <div className="bg-white dark:bg-boxdark rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-meta-4 border-b border-gray-200 dark:border-meta-4">
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        #
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Name
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        From
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        To
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="h-20 w-full text-center">
                          <div className="flex justify-center items-center h-full">
                            <CircularProgress />
                          </div>
                        </td>
                      </tr>
                    ) : shop?.sellers?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-4 text-center text-black dark:text-white"
                        >
                          No sellers assigned.
                        </td>
                      </tr>
                    ) : (
                      shop?.sellers.map((seller, index) => (
                        <tr
                          key={seller.id}
                          className="border-b border-gray-200 dark:border-meta-4 hover:bg-gray-50 dark:hover:bg-meta-4"
                        >
                          <td className="p-4 text-sm">{index + 1}</td>
                          <td className="p-4 text-sm font-medium">
                            {seller.name}
                          </td>
                          <td className="p-4 text-sm">
                            {/* {format(new Date(seller.fromDate), 'yyyy-MM-dd')} */}
                            {seller.assignmentHistory &&
                            seller.assignmentHistory.length > 0
                              ? format(
                                  new Date(
                                    seller.assignmentHistory[
                                      seller.assignmentHistory.length - 1
                                    ].fromDate,
                                  ),
                                  'dd MMM, yyyy',
                                )
                              : 'N/A'}
                          </td>
                          <td className="p-4 text-sm">
                            {/* {format(new Date(seller.toDate), 'yyyy-MM-dd')} */}
                            {seller.assignmentHistory &&
                            seller.assignmentHistory.length > 0
                              ? format(
                                  new Date(
                                    seller.assignmentHistory[
                                      seller.assignmentHistory.length - 1
                                    ].toDate,
                                  ),
                                  'dd MMM, yyyy',
                                )
                              : 'N/A'}
                          </td>
                          <td className="p-4 text-sm">
                            {/* <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      new Date(seller.toDate) > new Date()
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {new Date(seller.toDate) > new Date()
                                      ? 'Active'
                                      : 'Expired'}
                                  </span> */}
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                seller.assignmentHistory[
                                  seller.assignmentHistory.length - 1
                                ].type === 'assigned'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {seller.assignmentHistory &&
                              seller.assignmentHistory.length > 0
                                ? seller.assignmentHistory[
                                    seller.assignmentHistory.length - 1
                                  ].type
                                : 'N/A'}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              className="p-1 hover:bg-gray-100 rounded-full text-gray-600 hover:text-red-600 transition-colors"
                              onClick={() => {
                                /* Handle remove seller */
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'Outlet Settings':
        if (!currentUser) return null;
        return (
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
            <div className="p-4 bg-gray-50 dark:bg-meta-4 border-b dark:border-strokedark">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Outlet Settings
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shop Name
                  </label>
                  <input
                    disabled={userPermissions === 'seller'}
                    type="text"
                    name="name"
                    value={outletFormData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark
                      ${userPermissions === 'seller' && 'cursor-not-allowed'}`}
                    placeholder="Enter shop name"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Shop Address
                  </label>
                  <input
                    disabled={userPermissions === 'seller'}
                    type="text"
                    name="address"
                    value={outletFormData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark
                      ${userPermissions === 'seller' && 'cursor-not-allowed'}`}
                    placeholder="Enter shop address"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  disabled={userPermissions === 'seller'}
                  type="submit"
                  className={`px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors
                    ${userPermissions === 'seller' && 'cursor-not-allowed'}
                    `}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container w-full mx-auto text-sm md:text-base">
      {modalAlert && (
        <ModalAlert
          message={modalAlert.text}
          onClose={() => navigate('/settings')}
        />
      )}
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 w-full">
        {/* New Stock Button */}
        {userPermissions === 'seller' && currentUser && (
          <div className="flex justify-end w-full mt-4">
            <button
              onClick={() => setShowNewStock(true)}
              className="flex items-center cursor-pointer group"
              disabled={!shop}
            >
              <div
                className={`relative mr-3 ${
                  newStockTally > 0 && 'animate-bounce'
                }`}
              >
                <ShoppingCart className="text-primary group-hover:scale-110 transition-transform" />
                {newStockTally > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {newStockTally}
                  </span>
                )}
              </div>
              <div>
                <p
                  className={`text-sm font-medium text-gray-600 dark:text-gray-300`}
                >
                  Incoming Stock
                </p>
              </div>
            </button>
          </div>
        )}
      </div>
      <Breadcrumb
        pageName="Inventory"
        header={`${shopname || shop?.shopName || ''}`}
      />
      {/* Horizontal Navigation */}
      <div className="mb-6">
        {/* Navigation Menu */}
        <div
          className={`
          bg-white dark:bg-boxdark rounded-lg shadow-md overflow-x-auto
        `}
        >
          <div className="flex">
            {sections.map((section) => {
              if (!section) return null;
              return (
                <button
                  key={section.key}
                  onClick={() => {
                    setActiveSection(section.key);
                  }}
                  className={`
                    w-full md:w-auto flex items-center justify-center md:justify-start 
                    p-4 border-b md:border-b-0 last:border-b-0 outline-none
                    ${
                      activeSection === section.key
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-meta-4'
                    }
                  `}
                >
                  <section.icon className="mr-3 h-3 md:w-5 h-5 block" />
                  <div className="text-xs md:text-base font-medium whitespace-nowrap">
                    {section.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {/* Main Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <CircularProgress color="inherit" />
        </div>
      ) : (
        // : !shop && userPermissions === 'seller' ? (
        // <ModalAlert message='You have not been assigned to any shop' onClose={() => navigate('/settings')} />
        //)
        renderContent()
      )}
      {reversalModalOpen && reversingItem && (
        <Dialog
          open={reversalModalOpen}
          onClose={() => setReversalModalOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle className="bg-boxdark/95">
            <div className="flex justify-between items-center">
              <span className="text-title-sm font-medium text-black dark:text-white">
                Return Accessory
              </span>
              <button
                onClick={() => setReversalModalOpen(false)}
                className="p-1 hover:bg-gray dark:hover:bg-boxdark-2 rounded-full"
              >
                <X className="w-5 h-5 text-body dark:text-bodydark" />
              </button>
            </div>
          </DialogTitle>
          <DialogContent className="dark:bg-boxdark">
            <div className="mt-4 space-y-4">
              <p className="dark:text-white">
                Item: {reversingItem.accessories.categories.itemName}
              </p>
              <p className="dark:text-white">
                Available Quantity: {reversingItem.quantity}
              </p>
              <div>
                <label className="block text-sm font-medium text-black dark:text-white mb-2">
                  Quantity to Return
                </label>
                <input
                  type="number"
                  value={reversalQuantity}
                  onChange={(e) => setReversalQuantity(Number(e.target.value))}
                  min="1"
                  max={reversingItem.quantity}
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setReversalModalOpen(false)}
                className="px-4 py-2 text-body dark:text-bodydark bg-gray dark:bg-boxdark-2 rounded-lg hover:bg-gray-2 dark:hover:bg-boxdark transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (reversingItem) {
                    handleReversal(
                      reversingItem.id,
                      reversalQuantity,
                      'accessory',
                    );
                  }
                }}
                className="px-4 py-2 text-white bg-primary rounded-lg hover:opacity-90 transition-colors"
                disabled={
                  !reversalQuantity ||
                  reversalQuantity <= 0 ||
                  reversalQuantity > reversingItem.quantity
                }
              >
                Confirm Return
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* Expense Modal */}
      <Dialog
        open={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="bg-boxdark/95">
          <div className="flex justify-between items-center">
            <span className="text-title-sm font-medium text-black dark:text-white">
              Add New Expense
            </span>
            <button
              onClick={() => setExpenseModalOpen(false)}
              className="p-1 hover:bg-gray dark:hover:bg-boxdark-2 rounded-full"
            >
              <X className="w-5 h-5 text-body dark:text-bodydark" />
            </button>
          </div>
        </DialogTitle>
        <DialogContent className="dark:bg-boxdark">
          <form onSubmit={handleExpenseSubmit} className="mt-4 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Amount *
                </label>
                <input
                  type="number"
                  name="amount"
                  value={expenseFormData.amount}
                  onChange={handleExpenseChange}
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Category *
                </label>
                <select
                  name="category"
                  value={expenseFormData.category}
                  onChange={handleExpenseChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="RENT">Rent</option>
                  <option value="UTILITIES">Utilities</option>
                  <option value="SUPPLIES">Supplies</option>
                  <option value="MARKETING">Marketing</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-black dark:text-white">
                Subcategory
              </label>
              <input
                type="text"
                name="subcategory"
                value={expenseFormData.subcategory}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter subcategory (optional)"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-black dark:text-white">
                Description *
              </label>
              <textarea
                name="description"
                value={expenseFormData.description}
                onChange={handleExpenseChange}
                required
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter expense description"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Payment Method *
                </label>
                <select
                  name="paymentMethod"
                  value={expenseFormData.paymentMethod}
                  onChange={handleExpenseChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="MPESA">M-Pesa</option>
                  <option value="AIRTELMONEY">Airtel Money</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-black dark:text-white">
                  Vendor Name
                </label>
                <input
                  type="text"
                  name="vendorName"
                  value={expenseFormData.vendorName}
                  onChange={handleExpenseChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter vendor name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-black dark:text-white">
                Vendor Contact
              </label>
              <input
                type="text"
                name="vendorContact"
                value={expenseFormData.vendorContact}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 rounded-lg border border-slate-600 text-black dark:text-white bg-transparent dark:bg-boxdark focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter vendor contact (optional)"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setExpenseModalOpen(false)}
                className="px-4 py-2 text-body dark:text-bodydark bg-gray dark:bg-boxdark-2 rounded-lg hover:bg-gray-2 dark:hover:bg-boxdark transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingExpense}
                className="px-4 py-2 text-white bg-primary rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {submittingExpense ? 'Submitting...' : 'Submit Expense'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal for New Stock */}
      {showNewStock && (
        <div className="flex justify-center fixed inset-0 z-9999 p-4">
          <Modal
            message=""
            shopData={{ ...shop, pendingMobiles, pendingAccessories }}
            onClose={() => setShowNewStock(false)}
            refreshShopData={() => {
              fetchShop();
              fetchMobileItems(mobilePage);
              fetchAccessoryItems(accessoryPage);
              fetchPendingStock();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default OutletInventoryView;
