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
} from 'lucide-react';
import Message from '../alerts/Message';
// import { getUsers } from '../../api/user_manager';
import ModalAlert from '../alerts/Alert';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import ClickOutside from '../ClickOutside';
import { getUsers } from '../../api/user_manager';
import ProductTransfer from '../inventory/ProductTransfer';

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
  ];

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
      } catch (error: any) {
        alert("An error occurred while fetching users");
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
        // setShop(assignedShop);
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
        setOutletFormData({
          name: outlet.name,
          address: outlet.address,
          id: outlet.id,
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
      console.log("@@@@@@@@", mobiles)
      const accessories = accessoryResponse.data.shop.filteredShop.accessoryItems?.items || [];
      console.log("!@!@!@accessories", accessories)
      setPendingMobiles(mobiles);
      setPendingAccessories(accessories);
      setNewStockTally(mobiles.length + accessories.length);
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
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/update/${outletFormData.id
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





  const renderContent = () => {
    switch (activeSection) {
      case 'Transfer':
        return <ProductTransfer 
                  currentUser={currentUser} 
                  mobileItems={mobileItems} 
                  accessoryItems={accessoryItems}
                  refreshData={() => {
                    fetchMobileItems(mobilePage);
                    fetchAccessoryItems(accessoryPage);
                  }}
                />;
      case 'Phones':
      case 'Accessories': {
        const isPhones = activeSection === 'Phones';
        const items = isPhones ? mobileItems : accessoryItems;
        const page = isPhones ? mobilePage : accessoryPage;
        const setPage = isPhones ? setMobilePage : setAccessoryPage;
        const searchItems = isPhones ? searchResults?.phoneItems : searchResults?.stockItems;

        const displayItems = searchResults ? searchItems?.items : items?.items;

        return (
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
            <div className="p-4 bg-gray-50 dark:bg-meta-4 flex justify-between items-center">
              <h2 className="md:text-xl font-bold text-gray-800 dark:text-white">
                Inventory / <span className="text-sm text-primary">{activeSection}</span>
              </h2>
              <div className="flex items-center space-x-4">
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by IMEI or name" className="p-2 border rounded-lg dark:bg-boxdark" />
                <button onClick={handleSearch} className="px-4 py-2 rounded-lg bg-primary text-white">Search</button>
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
                    <th className="p-3">Cost</th>
                    <th className="p-3">{isPhones ? 'IMEI' : 'Batch'}</th>
                  </tr>
                </thead>
                <tbody className="text-xs md:text-sm lg:text-base text-center">
                  {displayItems?.map((item: any, index: number) => {
                    const details = isPhones ? item.mobiles : item.accessories;
                    return (
                      <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-opacity-90 transition-colors ${index % 2 === 1
                        ? 'bg-bodydark3 dark:bg-meta-4'
                        : 'bg-white dark:bg-boxdark'
                        }`}>
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3 font-medium">{details.categories.itemName}</td>
                        <td className="p-3">{details.categories.itemModel}</td>
                        <td className="p-3">{details.categories.brand}</td>
                        <td className="p-3">{item.quantity}</td>
                        <td className="p-3">{details.productCost}</td>
                        <td className="p-3">{isPhones ? details.IMEI : details.batchNumber}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {!searchResults && items && <div className="flex justify-end mt-4 p-4">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(prev => prev + 1)}
                disabled={page === items.totalPages}
                className="px-4 py-2 mx-1 bg-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>}
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
                              className={`px-2 py-1 rounded-full text-xs font-medium ${seller.assignmentHistory[
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
