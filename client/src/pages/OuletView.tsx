import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from '../components/outlets/Modal';
import jwt_decode from 'jwt-decode';
import { Shop } from '../types/shop';
import { DecodedToken } from '../types/decodedToken';
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
  LayoutDashboard,
  TrendingUp,
  Package,
  AlertTriangle,
  X,
  UserPlus,
  InfoIcon,
  XIcon,
} from 'lucide-react';
import Message from '../components/alerts/Message';
import ModalAlert from '../components/alerts/Alert';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import ClickOutside from '../components/ClickOutside';
import { getUsers } from '../api/user_manager';

const OutletView: React.FC = () => {
  const [shop, setShop] = useState<Shop | null>(null);
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
  const [showRequestModal, setRequestModalActive] = useState<boolean>(false);
  const [modalAlert, setModalAlert] = useState<{
    text: string;
    type: string;
  } | null>(null);
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
      name: 'Phones',
      key: 'Phones',
      icon: PhoneIcon,
    },
    {
      name: 'Accessories',
      key: 'Accessories',
      icon: HeadphonesIcon,
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
        const user_res = await getUsers();
        if (user_res?.data) {
          setUsers(user_res?.data);
        }
      } catch (error) {
        
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
    const lowStockPhones = phoneItems.filter(
      (item) => item.quantity < 5,
    ).length;
    const lowStockAccessories = accessories.filter(
      (item) => item.quantity < 5,
    ).length;

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
      lowStockItems: lowStockPhones + lowStockAccessories,
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
        setShop(assignedShop);
        setOutletFormData({
          name: assignedShop.name,
          address: assignedShop.address,
          _id: assignedShop._id,
        });
        setShopName(assignedShop.name);
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
    } catch (error) {
      
    }
  };

  useEffect(() => {
    if (userPermissions && userPermissions === 'seller' && !urlShopname) {
      fetchUserData();
    }
    if (shopname) {
      fetchShop();
    }
  }, [userPermissions, shopname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOutletFormData({ ...outletFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/update/${
          outletFormData._id
        }`,
        outletFormData,
        { withCredentials: true },
      );

      if (response.status === 200) {
        alert('Shop updated successfully!');
        let outletUpdated = { ...response.data.shop };
        setOutletFormData({
          name: outletUpdated.name,
          address: outletUpdated.address,
          _id: outletUpdated._id,
        });
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      
      alert('Internal Server Error');
    }
  };

  const items =
    activeSection === 'Phones' ? shop?.phoneItems : shop?.stockItems;

  const groupedItems = useMemo(() => {
    if (!items) return [];

    const grouped = items.reduce((acc: any, item: any) => {
      const categoryId = item.categoryId._id;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId: item.categoryId,
          items: [],
          quantity: 0,
        };
      }

      acc[categoryId].items.push(item.stock);
      acc[categoryId].quantity += item.quantity;

      return acc;
    }, {});

    return Object.values(grouped);
  }, [items]);

  

  const renderContent = () => {
    switch (activeSection) {
      case 'Overview': {
        if (!currentUser && userPermissions !== 'manager') return null;
        const stats = calculateInventoryStats();
        if (!stats) return null;

        const phonesProgress =
          (stats.totalPhones / (stats.totalPhones + stats.totalAccessories)) *
            100 || 0;
        const accessoriesProgress =
          (stats.totalAccessories /
            (stats.totalPhones + stats.totalAccessories)) *
            100 || 0;

        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-2 flex flex-col justify-center space-y-4">
                <div className="flex flex-row items-center justify-between text-bodydark2">
                  <div className="text-lg font-medium">Total Inventory</div>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="dark:text-bodydark">
                  <div className="text-2xl font-bold">{stats.totalItems}</div>
                  <div className="text-xs text-muted-foreground">
                    items in stock
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-2 flex flex-col justify-center space-y-4">
                <div className="flex flex-row items-center justify-between text-bodydark2">
                  <div className="text-lg font-medium">Inventory Value</div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="dark:text-bodydark">
                  <span className="text-xs">KES</span>
                  <div className="pl-4 text-2xl font-bold">
                    {Number(stats.totalValue.toFixed(2)).toLocaleString() ||
                      (0.0).toFixed(2)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    total value
                  </span>
                </div>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow px-4 py-2 flex flex-col justify-center space-y-4">
                <div className="flex flex-row items-center justify-between text-bodydark2">
                  <div className="text-lg font-medium">Products</div>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="dark:text-bodydark">
                  <div className="text-2xl font-bold">
                    {stats.phoneModels + stats.accessoryModels}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    unique models
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
                    {stats.lowStockItems}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    items need restock
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow">
                <div className="p-2 text-xl font-bold">Phones Inventory</div>
                <CardContent className="space-y-4 dark:text-bodydark">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Units</span>
                      <span className="font-medium">{stats.totalPhones}</span>
                    </div>
                    <div
                      className={`h-2 rounded-md
                      ${
                        accessoriesProgress < 20
                          ? 'border border-red-500 bg-red-500'
                          : accessoriesProgress >= 20 &&
                            accessoriesProgress < 50
                          ? 'bg-yellow-500 border-yellow-500'
                          : 'bg-primary border-primary'
                      }
                        `}
                      style={{
                        width: `${phonesProgress}%`,
                      }}
                    ></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Models</span>
                      <span className="font-medium">{stats.phoneModels}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Products</span>
                      <span className="font-medium">
                        {stats.phoneCategories}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="rounded-lg bg-bodydark1 dark:bg-boxdark dark:text-whiten shadow">
                <div className="p-2 text-xl font-bold">
                  Accessories Inventory
                </div>
                <CardContent className="space-y-4 dark:text-bodydark">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Units</span>
                      <span className="font-medium">
                        {stats.totalAccessories}
                      </span>
                    </div>
                    <div
                      className={`h-2 rounded-md
                        ${
                          accessoriesProgress < 20
                            ? 'border border-red-500 bg-red-500'
                            : accessoriesProgress >= 20 &&
                              accessoriesProgress < 50
                            ? 'bg-yellow-500 border-yellow-500'
                            : 'bg-primary border-primary'
                        }
                        `}
                      style={{
                        width: `${accessoriesProgress}%`,
                      }}
                    >
                      {}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Models</span>
                      <span className="font-medium">
                        {stats.accessoryModels}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Categories</span>
                      <span className="font-medium">
                        {stats.accessoryCategories}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        );
      }
      case 'Phones':
      case 'Accessories': {
        return (
          <>
            {/* Request Modal */}
            {showRequestModal && (
              <div className="fixed inset-0 w-full h-full z-999 bg-transparent flex justify-center items-center">
                <div className="absolute w-full h-full bg-gray-500 opacity-50 dark:opacity-20" />
                <div className="bg-bodydark2 dark:bg-boxdark-2 rounded-lg w-1/2 h-1/2 z-9999 text-white">
                  <div className="p-4">
                    <div className="flex justify-between">
                      <h2 className="text-lg font-semibold text-white mb-4">
                        Request Item
                      </h2>
                      <XIcon
                        className="hover:scale-150 transition-all duration-300 cursor-pointer"
                        onClick={() => setRequestModalActive(false)}
                      />
                    </div>
                    <div className="space-y-4">
                      {shop?.sellers?.map((seller) => (
                        <div
                          key={seller._id}
                          className="flex items-center justify-between p-2 bg-gray-800 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium">{seller.name}</p>
                            <p className="text-xs text-gray-400">
                              {seller.phone || 'Not Provided'}
                            </p>
                          </div>
                          <a
                            href={`tel:${seller.phone}`}
                            className="text-blue-400 hover:text-blue-600"
                          >
                            Call
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-bodydark3 dark:bg-boxdark rounded-lg shadow-md">
              <div className="p-4 bg-gray-50 dark:bg-meta-4">
                <h2 className="md:text-xl font-bold text-gray-800 dark:text-white">
                  Inventory /{' '}
                  <span className="text-sm text-primary">{activeSection}</span>
                </h2>
              </div>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto mx-auto">
                  <thead className="text-xs">
                    <tr className="bg-gray-100 dark:bg-meta-4 text-gray-600 dark:text-gray-300 text-center">
                      <th className="p-3">#</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Total Units</th>
                      <th className="p-3">Price Range (KES)</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs md:text-sm lg:text-base text-center">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="h-20 w-full text-center">
                          <div className="flex justify-center items-center h-full">
                            <CircularProgress />
                          </div>
                        </td>
                      </tr>
                    ) : !groupedItems || groupedItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-4 text-center text-black dark:text-white h-24"
                        >
                          No {activeSection} found
                        </td>
                      </tr>
                    ) : (
                      groupedItems.map((group: any, index: number) => (
                        <tr
                          key={group.categoryId._id}
                          className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors
                        ${
                          index % 2 === 1
                            ? 'bg-bodydark3 dark:bg-meta-4'
                            : 'bg-white dark:bg-boxdark'
                        }`}
                        >
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3 font-medium">
                            {group.categoryId.itemName}
                          </td>
                          <td className="p-3">{group.categoryId.itemModel}</td>
                          <td className="p-3">{group.categoryId.brand}</td>
                          <td className="p-3">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                              {group.quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-red-500">
                              {group.categoryId.minPrice}
                            </span>
                            {' - '}
                            <span className="text-blue-500">
                              {group.categoryId.maxPrice}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="relative">
                              <button
                                style={{
                                  transform: 'rotate(90deg)',
                                }}
                                className="text-gray-500 dark:text-white hover:text-gray-700"
                                onClick={() =>
                                  toggleActionsMenu(group.categoryId._id)
                                }
                              >
                                <span className="dots-icon rotate-180">
                                  ...
                                </span>
                              </button>
                              {showActionsMenu === group.categoryId._id && (
                                <ClickOutside
                                  onClick={() => setShowActionsMenu(null)}
                                >
                                  <div className="fixed right-4 mt-4 w-48 flex-col rounded-md border border-stroke bg-white shadow-lg z-50 border-primary/[0.5] dark:bg-boxdark">
                                    <button
                                      className="block px-4 py-2 text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-boxdark-2 w-full"
                                      onClick={() => {
                                        userPermissions === 'manager' ||
                                        userPermissions === 'superuser'
                                          ? navigate(
                                              `/outlet/inventory/${group.categoryId._id}`,
                                            )
                                          : setRequestModalActive(true);
                                      }}
                                    >
                                      {userPermissions === 'manager' ||
                                      userPermissions === 'superuser'
                                        ? `View Items (${group.items.length})`
                                        : 'Request Items'}
                                    </button>

                                    {/* <button
                                      className="block px-4 py-2 text-left text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-boxdark-2 w-full"
                                      onClick={() => alert('Deleting...')}
                                    >
                                      Delete All
                                    </button> */}
                                  </div>
                                </ClickOutside>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
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
                            <option key={user._id} value={user.name}>
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
                          key={seller._id}
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
      <Breadcrumb pageName="Inventory" header={`${shopname || shop?.name}`} />
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
