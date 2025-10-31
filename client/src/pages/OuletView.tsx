import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/outlets/Modal';
import jwt_decode from 'jwt-decode';
import { Shop } from '../types/shop';
import { DecodedToken } from '../types/decodedToken';
import {
  capitalize,
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
  LayoutDashboard,
  TrendingUp,
  Package,
  AlertTriangle,
  X,
  UserPlus,
  InfoIcon,
  XIcon,
  Eye,
  Share,
  Share2,
  Shuffle,
  RefreshCw,
  Check,
} from 'lucide-react';
import Message from '../components/alerts/Message';
import ModalAlert from '../components/alerts/Alert';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ClickOutside from '../components/ClickOutside';
import { getAllUsers } from '../api/user_manager';

const OutletView: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
  const [showNewStock, setShowNewStock] = useState<boolean>(false);
  const [newStockTally, setNewStockTally] = useState<number>(0);
  // const [outletData, setOutletData] = useState<any | null>(null);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [removingSeller, setRemovingSeller] = useState<boolean>(false);
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
  const [showRequestModal, setRequestModalActive] = useState<boolean>(false);
  const [modalAlert, setModalAlert] = useState<{
    text: string;
    type: string;
  } | null>(null);
  const [showPendingStockModal, setShowPendingStockModal] = useState(false);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [lowStockPage, setLowStockPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [overviewData, setOverviewData] = useState<any | null>(null);
  const [mobileItems, setMobileItems] = useState<any | null>(null);
  const [accessoryItems, setAccessoryItems] = useState<any | null>(null);
  const [mobilePage, setMobilePage] = useState(1);
  const [accessoryPage, setAccessoryPage] = useState(1);
  const [inventoryTab, setInventoryTab] = useState('mobiles');
  const [pendingStockTab, setPendingStockTab] = useState('mobiles');
  const [pendingMobiles, setPendingMobiles] = useState<any[]>([]);
  const [pendingAccessories, setPendingAccessories] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any | null>(null);
  const token: string | null = localStorage.getItem('tk') || null;
  const decoded: DecodedToken | null = jwt_decode(token!) || null;
  const sections = [
    currentUser ||
      userPermissions === 'manager' ||
      userPermissions === 'superuser'
      ? {
        name: 'Overview',
        key: 'Overview',
        icon: LayoutDashboard,
      }
      : null,
    {
      name: 'Inventory',
      key: 'Inventory',
      icon: Package,
    },
    {
      name: 'Low Stock',
      key: 'Low Stock',
      icon: AlertTriangle,
    },

    userPermissions === 'manager' || userPermissions === 'superuser'
      ? {
        name: 'Outlet Sellers',
        key: 'Sellers',
        icon: UserIcon,
      }
      : null,
    currentUser ||
      userPermissions === 'manager' ||
      userPermissions === 'superuser'
      ? {
        name: 'Outlet Settings',
        key: 'Outlet Settings',
        icon: SettingsIcon,
      }
      : null,
  ];
  const [activeSection, setActiveSection] = useState<string | undefined>(
    sections[0]?.name || sections[1]?.name,
  );

  useEffect(() => {
    if (token && decoded) {
      setUserPermissions(decoded.role);
    } else {
      localStorage.clear();
      navigate('/auth/signin');
    }
  }, []);

  const handleRemoveSeller = async (id: string) => {
    try {
      setRemovingSeller(true);
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/assignment/remove`,
        { assignmentId: id },
        { withCredentials: true },
      );

      if (response.status === 200) {
        setMessage({ text: 'Seller removed successfully!', type: 'success' });
        fetchShop();
      }
    } catch (error: any) {
      setMessage({
        text:
          error.response.data.message ||
          error.message ||
          'Failed to remove seller',
        type: 'error',
      });
    } finally {
      setRemovingSeller(false);
    }
  };

  const toggleActionsMenu = (id: string) => {
    setShowActionsMenu((prev) => (prev === id ? null : id));
  };
  const [outletFormData, setOutletFormData] = useState({
    name: '',
    address: '',
    _id: '',
  });

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
      } catch (error) { }
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
        fetchShop();
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
      (sum, item) => sum + item.quantity * (Number(item.stock.minprice) || 0),
      0,
    );

    return {
      totalPhones,
      totalAccessories,
      totalItems: totalPhones + totalAccessories,
      lowStockItems: shop.lowStockItems.length,
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
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${decoded.email
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

        setShop(assignedShop);
        setOutletFormData({
          name: assignedShop.shopName,
          address: assignedShop.address,
          _id: assignedShop._id,
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

        const { newPhoneItem, newAccessory } = response.data.shop.filteredShop;

        const phoneItems = Array.isArray(newPhoneItem) ? newPhoneItem : [];
        const accessoryItems = Array.isArray(newAccessory) ? newAccessory : [];

        // Count the items with status "pending"
        const pendingPhoneItemsCount = phoneItems.filter(
          (item) => item.status === 'pending',
        ).length;
        const pendingAccessoryItemsCount = accessoryItems.filter(
          (item) => item.status === 'pending',
        ).length;

        // Update the state with the total count of pending items
        setNewStockTally(pendingPhoneItemsCount + pendingAccessoryItemsCount);


        setOutletFormData({
          name: outlet.name,
          address: outlet.address,
          _id: outlet._id,
        });
      }
    } catch (error) { }
  };

  const fetchOverview = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${shopname}/overview`,
        { withCredentials: true },
      );
      setOverviewData(response.data.overview);
    } catch (error) {
      console.error("Failed to fetch overview data", error);
    }
  };

  const fetchMobileItems = async (page = 1) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${shopname}?page=${page}&limit=${itemsPerPage}&itemType=mobile&status=confirmed`,
        { withCredentials: true },
      );
      setMobileItems(response.data.shop.filteredShop.mobileItems);
    } catch (error) {
      console.error("Failed to fetch mobile items", error);
    }
  };

  const fetchAccessoryItems = async (page = 1) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${shopname}?page=${page}&limit=${itemsPerPage}&itemType=accessory&status=confirmed`,
        { withCredentials: true },
      );
      setAccessoryItems(response.data.shop.filteredShop.accessoryItems);
    } catch (error) {
      console.error("Failed to fetch accessory items", error);
    }
  };

  const fetchPendingStock = async () => {
    try {
      const mobileResponse = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${shopname}?itemType=mobile&status=pending`,
        { withCredentials: true },
      );
      const accessoryResponse = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${shopname}?itemType=accessory&status=pending`,
        { withCredentials: true },
      );

      const mobiles = mobileResponse.data.shop.filteredShop.mobileItems?.items || [];
      const accessories = accessoryResponse.data.shop.filteredShop.accessoryItems?.items || [];
      setPendingMobiles(mobiles);
      setPendingAccessories(accessories);
    } catch (error) {
      console.error("Failed to fetch pending stock", error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm) {
      setSearchResults(null);
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/searchproducts/${shopname}?productName=${searchTerm}`,
        { withCredentials: true },
      );
      setSearchResults(response.data.products);
    } catch (error) {
      console.error("Failed to search products", error);
    }
  };

  useEffect(() => {
    if (userPermissions && userPermissions === 'seller' && !urlShopname) {
      fetchUserData();
    }
    if (shopname) {
      fetchShop();
      fetchOverview();
      fetchMobileItems(mobilePage);
      fetchAccessoryItems(accessoryPage);
    }
  }, [userPermissions, shopname, mobilePage, accessoryPage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOutletFormData({ ...outletFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      shopName: outletFormData.name,
      address: outletFormData.address,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/update/${outletFormData._id
        }`,
        payload,
        { withCredentials: true },
      );

      if (response.status === 200) {
        alert('Shop updated successfully!');
        let outletUpdated = { ...response.data.shop };
        setOutletFormData({
          name: outletUpdated.name,
          address: outletUpdated.address,
          _id: outletFormData._id, // Keep the existing _id
        });
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      alert('Internal Server Error');
    }
  };





  const renderContent = () => {
    switch (activeSection) {
      case 'Overview': {
        if (!currentUser && userPermissions !== 'manager') return null;
        if (!overviewData) return <CircularProgress />;

        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-2 flex flex-col justify-center space-y-4">
                <div className="flex flex-row items-center justify-between text-bodydark2">
                  <div className="text-lg font-medium">Total Stock Value</div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="dark:text-bodydark">
                  <span className="text-xs">KES</span>
                  <div className="pl-4 text-2xl font-bold">
                    {Number(overviewData.totalStockValue).toLocaleString() || (0.0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-2 flex flex-col justify-center space-y-4">
                <div className="flex flex-row items-center justify-between text-bodydark2">
                  <div className="text-lg font-medium">Confirmed Stock Value</div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="dark:text-bodydark">
                  <span className="text-xs">KES</span>
                  <div className="pl-4 text-2xl font-bold">
                    {Number(overviewData.confirmedStockValue).toLocaleString() || (0.0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-2 flex flex-col justify-center space-y-4">
                <div className="flex flex-row items-center justify-between text-bodydark2">
                  <div className="text-lg font-medium">Pending Stock Value</div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="dark:text-bodydark">
                  <span className="text-xs">KES</span>
                  <div className="pl-4 text-2xl font-bold">
                    {Number(overviewData.pendingStockValue).toLocaleString() || (0.0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-2 flex flex-col justify-center space-y-4">
                <div className="flex flex-row items-center justify-between text-bodydark2">
                  <div className="text-lg font-medium">Low Stock Alert</div>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </div>
                <div className="dark:text-bodydark">
                  <div className="text-2xl font-bold">
                    {overviewData.lowStockItems.mobiles.length + overviewData.lowStockItems.accessories.length}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    items need restock
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Stock Button */}
            <div className="flex justify-end gap-4">
              <button onClick={() => navigate(`/shop/sales?shopId=${shop?._id}`)} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Sales Report
              </button>
              <button onClick={async () => { await fetchPendingStock(); setShowPendingStockModal(true); }} className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                <Package className="w-4 h-4 mr-2" />
                View Pending Stock
                {(pendingMobiles.length + pendingAccessories.length) > 0 && <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{pendingMobiles.length + pendingAccessories.length}</span>}
              </button>
            </div>

            {/* Pending Stock Modal */}
            {showPendingStockModal && (
              <div className="fixed inset-0 w-full h-full z-999 bg-black bg-opacity-50 flex justify-center items-center px-4">
                <div className="bg-white dark:bg-boxdark rounded-lg w-full max-w-4xl max-h-full overflow-y-auto">
                  <div className="p-4 border-b border-gray-200 dark:border-strokedark flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-black dark:text-white">Pending Stock</h2>
                    <XIcon className="hover:scale-125 transition-all duration-300 cursor-pointer" onClick={() => setShowPendingStockModal(false)} />
                  </div>
                  <div className="p-4">
                    <div className="flex space-x-4 border-b mb-4">
                        <button onClick={() => setPendingStockTab('mobiles')} className={`px-4 py-2 rounded-t-lg ${pendingStockTab === 'mobiles' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-boxdark-2'}`}>Mobiles</button>
                        <button onClick={() => setPendingStockTab('accessories')} className={`px-4 py-2 rounded-t-lg ${pendingStockTab === 'accessories' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-boxdark-2'}`}>Accessories</button>
                    </div>

                    {pendingStockTab === 'mobiles' && (
                      <div className="max-w-full overflow-x-auto">
                        <table className="w-full table-auto mx-auto">
                          <thead className="text-xs">
                            <tr className="bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300 text-center">
                              <th className="p-3">#</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">Model</th>
                              <th className="p-3">Brand</th>
                              <th className="p-3">Quantity</th>
                              <th className="p-3">IMEI</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs md:text-sm lg:text-base text-center">
                            {pendingMobiles && pendingMobiles.map((item: any, index: number) => (
                              <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors ${index % 2 === 1
                                ? 'bg-bodydark3 dark:bg-meta-4'
                                : 'bg-white dark:bg-boxdark'
                                }`}>
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 font-medium">{item.mobiles.categories.itemName}</td>
                                <td className="p-3">{item.mobiles.categories.itemModel}</td>
                                <td className="p-3">{item.mobiles.categories.brand}</td>
                                <td className="p-3">{item.quantity}</td>
                                <td className="p-3">{item.mobiles.IMEI}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status.toLowerCase() === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {pendingStockTab === 'accessories' && (
                      <div className="max-w-full overflow-x-auto">
                        <table className="w-full table-auto mx-auto">
                          <thead className="text-xs">
                            <tr className="bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300 text-center">
                              <th className="p-3">#</th>
                              <th className="p-3">Name</th>
                              <th className="p-3">Model</th>
                              <th className="p-3">Brand</th>
                              <th className="p-3">Quantity</th>
                              <th className="p-3">Batch</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs md:text-sm lg:text-base text-center">
                            {pendingAccessories && pendingAccessories.map((item: any, index: number) => (
                              <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors ${index % 2 === 1
                                ? 'bg-bodydark3 dark:bg-meta-4'
                                : 'bg-white dark:bg-boxdark'
                                }`}>
                                <td className="p-3">{index + 1}</td>
                                <td className="p-3 font-medium">{item.accessories.categories.itemName}</td>
                                <td className="p-3">{item.accessories.categories.itemModel}</td>
                                <td className="p-3">{item.accessories.categories.brand}</td>
                                <td className="p-3">{item.quantity}</td>
                                <td className="p-3">{item.accessories.batchNumber || 'N/A'}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.status.toLowerCase() === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'Inventory': {
        return (
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
            <div className="p-4 bg-gray-50 dark:bg-meta-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white self-start">Confirmed Inventory</h2>
              <div className="flex items-center space-x-4 w-full md:w-auto">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by IMEI or name" className="p-2 border rounded-lg dark:bg-boxdark w-full" />
                <button onClick={handleSearch} className="px-4 py-2 rounded-lg bg-primary text-white">Search</button>
              </div>
              <div className="flex space-x-4 w-full md:w-auto">
                <button onClick={() => setInventoryTab('mobiles')} className={`px-4 py-2 rounded-lg w-1/2 md:w-auto ${inventoryTab === 'mobiles' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-boxdark-2'}`}>Mobiles</button>
                <button onClick={() => setInventoryTab('accessories')} className={`px-4 py-2 rounded-lg w-1/2 md:w-auto ${inventoryTab === 'accessories' ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-boxdark-2'}`}>Accessories</button>
              </div>
            </div>
            {inventoryTab === 'mobiles' && (searchResults ? searchResults.phoneItems : mobileItems) && (
              <>
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full table-auto mx-auto">
                    <thead className="text-xs">
                      <tr className="bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300 text-center">
                        <th className="p-3">#</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Model</th>
                        <th className="p-3">Brand</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Cost</th>
                        <th className="p-3">IMEI/Batch</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm lg:text-base text-center">
                      {(searchResults ? searchResults.phoneItems.items : mobileItems.items).map((item: any, index: number) => (
                        <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors ${index % 2 === 1
                          ? 'bg-bodydark3 dark:bg-meta-4'
                          : 'bg-white dark:bg-boxdark'
                          }`}>
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium">{item.mobiles.categories.itemName}</td>
                          <td className="p-3">{item.mobiles.categories.itemModel}</td>
                          <td className="p-3">{item.mobiles.categories.brand}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">{item.mobiles.productCost}</td>
                          <td className="p-3">{item.mobiles.IMEI}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!searchResults && <div className="flex justify-end mt-4 p-4">
                  <button
                    onClick={() => setMobilePage(prev => Math.max(prev - 1, 1))}
                    disabled={mobilePage === 1}
                    className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setMobilePage(prev => prev + 1)}
                    disabled={mobilePage === mobileItems.totalPages}
                    className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>}
              </>
            )}
            {inventoryTab === 'accessories' && (searchResults ? searchResults.stockItems : accessoryItems) && (
              <>
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full table-auto mx-auto">
                    <thead className="text-xs">
                      <tr className="bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300 text-center">
                        <th className="p-3">#</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Model</th>
                        <th className="p-3">Brand</th>
                        <th className="p-3">Quantity</th>
                        <th className="p-3">Cost</th>
                        <th className="p-3">Batch</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs md:text-sm lg:text-base text-center">
                      {(searchResults ? searchResults.stockItems.items : accessoryItems.items).map((item: any, index: number) => (
                        <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors ${index % 2 === 1
                          ? 'bg-bodydark3 dark:bg-meta-4'
                          : 'bg-white dark:bg-boxdark'
                          }`}>
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium">{item.accessories.categories.itemName}</td>
                          <td className="p-3">{item.accessories.categories.itemModel}</td>
                          <td className="p-3">{item.accessories.categories.brand}</td>
                          <td className="p-3">{item.quantity}</td>
                          <td className="p-3">{item.accessories.productCost}</td>
                          <td className="p-3">{item.accessories.batchNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!searchResults && <div className="flex justify-end mt-4 p-4">
                  <button
                    onClick={() => setAccessoryPage(prev => Math.max(prev - 1, 1))}
                    disabled={accessoryPage === 1}
                    className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setAccessoryPage(prev => prev + 1)}
                    disabled={accessoryPage === accessoryItems.totalPages}
                    className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>}
              </>
            )}
          </div>
        )
      }
      case 'Low Stock': {
        if (!overviewData) return <CircularProgress />;
        const lowStockItems = [...overviewData.lowStockItems.mobiles, ...overviewData.lowStockItems.accessories];
        return (
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
            <div className="p-4 bg-gray-50 dark:bg-meta-4">
              <h2 className="md:text-xl font-bold text-gray-800 dark:text-white">Low Stock Items</h2>
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
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm lg:text-base text-center">
                  {lowStockItems.map((item: any, index: number) => (
                    <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors ${index % 2 === 1
                      ? 'bg-bodydark3 dark:bg-meta-4'
                      : 'bg-white dark:bg-boxdark'
                      }`}>
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3 font-medium">{item.name}</td>
                      <td className="p-3">{item.model}</td>
                      <td className="p-3">{item.brand}</td>
                      <td className="p-3">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
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
                            {format(new Date(seller.fromDate), 'dd MMM, yyyy')}
                            {/* {seller.assignmentHistory &&
                            seller.assignmentHistory.length > 0
                              ? format(
                                  new Date(
                                    seller.assignmentHistory[
                                      seller.assignmentHistory.length - 1
                                    ].fromDate,
                                  ),
                                  'dd MMM, yyyy',
                                )
                              : 'N/A'} */}
                          </td>
                          <td className="p-4 text-sm">
                            {format(new Date(seller.toDate), 'dd MMM, yyyy')}
                            {/* {seller.assignmentHistory &&
                            seller.assignmentHistory.length > 0
                              ? format(
                                  new Date(
                                    seller.assignmentHistory[
                                      seller.assignmentHistory.length - 1
                                    ].toDate,
                                  ),
                                  'dd MMM, yyyy',
                                )
                              : 'N/A'} */}
                          </td>
                          <td className="p-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${seller.status.toLowerCase() === 'assigned'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}
                            >
                              {capitalize(seller.status)}
                            </span>
                            {/* <span
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
                            </span> */}
                          </td>
                          <td className="p-4">
                            <button
                              disabled={removingSeller}
                              className={`p-1 rounded-full text-gray-600`}
                              onClick={() => {
                                seller.status.toLowerCase() === 'assigned'
                                  ? handleRemoveSeller(seller.assignmentId)
                                  : alert('Seller already removed');
                              }}
                            >
                              {seller.status.toLowerCase() === 'assigned' ? (
                                removingSeller ? (
                                  <CircularProgress
                                    size={24}
                                    className="w-2 h-2 text-red-400"
                                  />
                                ) : (
                                  <X className="w-5 h-5 text-red-400 hover:transform hover:rotate-180 duration-300 transition-all" />
                                )
                              ) : (
                                <Check className="w-4 h-4 text-green-400" />
                              )}
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
        if (
          !currentUser &&
          userPermissions !== 'manager' &&
          userPermissions !== 'superuser'
        )
          return null;
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

  // useEffect(() => {
  //   setTimeout(() => {
  //
  //   if (shop) {
  //     setModalAlert(null);
  //   }
  //   if (!shop && userPermissions === 'seller') {
  //     setModalAlert({
  //       text: message?.text || 'You have not been assigned to any shop',
  //       type: 'error',
  //     });
  //     // navigate('/settings');
  //   }
  // }, 5000)
  // }, [shop, userPermissions, message]);

  return (
    <div className="container mx-auto text-sm md:text-base">
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
      <div className="flex items-center justify-between mb-6">
        {/* <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary hover:text-primary-dark transition-colors"
        >
          <ChevronLeft className="mr-2" />
          <span className="font-medium">Back</span>
        </button> */}

        {/* New Stock Button */}
        {userPermissions === 'seller' && currentUser && (
          <div className="flex justify-end w-full mt-4">
            <button
              onClick={() => setShowNewStock(true)}
              className="flex items-center cursor-pointer group"
              disabled={!shop}
            >
              <div
                className={`relative mr-3 ${newStockTally > 0 && 'animate-bounce'
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
        header={`${shopname || shop?.shopName}`}
      />
      {!currentUser && userPermissions === 'seller' && (
        <span className="flex items-center gap-2 text-slate-500 p-2">
          <InfoIcon size={16} />
          You can request low stock items for your shop
        </span>
      )}
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
                    ${activeSection === section.key
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
      {/* Modal for New Stock */}
      {showNewStock && (
        <div className="flex justify-center fixed inset-0 z-9999 p-4">
          <Modal
            message=""
            shopData={shop!}
            onClose={() => setShowNewStock(false)}
            refreshShopData={fetchShop}
          />
        </div>
      )}
    </div>
  );
};

export default OutletView;
