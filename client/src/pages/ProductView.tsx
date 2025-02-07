import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Share2,
  Edit,
  X,
  CheckCircle,
  Shuffle,
  List,
  Bolt,
  Store,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import ProductTransferHistory from './product/TransferHistory';
import ProductDetail from './product/ProductDetail';
import { Product } from '../types/product';
import { DecodedToken } from '../types/decodedToken';
import jwt_decode from 'jwt-decode';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { getUserProfile } from '../api/user_manager';

interface Outlet {
  id: string;
  name: string;
  location?: string;
  contact?: string;
  address?: string;
  availableStock?: number;
}

interface SelectedItem {
  stockId: string;
  category: string;
}

const useQuery = () => new URLSearchParams(useLocation().search);

const ProductView = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const { productId, isMobile } = useParams<{
    productId: string;
    isMobile: string;
  }>();
  const token = localStorage.getItem('tk');
  const [state, setState] = useState(useLocation().state as any);
  const user: DecodedToken | null = token ? jwt_decode(token) : null;
  const [currentUser, setCurrentUser] = useState<any>(null);

  if (!token || !user) {
    localStorage.clear();
    navigate('/auth/signin');
    return null;
  }

  const [activeSection, setActiveSection] = useState<string>(
    query.get('tab') || 'distribute_product',
  );
  const [product, setProduct] = useState<Product | null>(null);
  const [shopName, setShopName] = useState<string>('');
  const [quantity, setQuantity] = useState<number>();
  const [remarks, setRemarks] = useState<string>('');
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [outletListings, setOutletListings] = useState<Outlet[]>([]);
  const [showMessage, setShowMessage] = useState<string>('');
  const [distributeError, setDistributeError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [distributing, setDistributing] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [selectionMode, setSelectionMode] = useState<'random' | 'manual'>(
    'random',
  );
  const [availableItems, setAvailableItems] = useState<any[]>([]);

  const handleCloseModal = () => setShowMessage('');

  const sections = [
    {
      name: user.role === 'manager' ? 'Distribute Product' : 'Transfer Product',
      key: 'distribute_product',
      icon: Share2,
    },
    { name: 'Product Details', key: 'product_details', icon: Edit },
    // { name: 'Transfer History', key: 'transfer_history', icon: History },
    { name: 'Shops in Stock', key: 'shops_in_stock', icon: Package },
  ];

  const fetchOutlets = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/all`,
        { withCredentials: true },
      );
      if (res.data) {
        const mappedOutlets = res.data.shops.map((shop: any) => ({
          ...shop,
          location: shop.location || '--',
          contact: shop.contact || '--',
          availableStock: shop.availableStock || 0,
        }));
        setOutletListings(mappedOutlets);
      }
    } catch (error) {
      console.error('Error fetching outlets:', error);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    if (user.role === 'seller' && !currentUser) {
      return;
    }
    try {
      setLoading(true);
      console.log(shopName);
      
      // console.log(`/api/category/get-category/shop/${currentUser.assignedShop.shopName}/${productId}`);
      console.log(user.role, currentUser.role);
      
      const response = await axios.get(
        currentUser.role === 'seller'
          ? `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/category/get-category/shop/${currentUser.assignedShop.shopName}/${productId}`
          : `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/category/get-category/${productId}`,
        {
          withCredentials: true,
        },
      );
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch product');
      }
      const fetchedProduct = response.data.data;
      console.log(fetchedProduct);

      // if (user.role === 'seller') {
      //   fetchedProduct.Items = fetchedProduct.Items.filter(
      //     (item: any) => item.stockStatus?.toLowerCase() === 'distributed',
      //   );
      // }
      const uniqueOutlets = new Set();
      fetchedProduct.Items.forEach((item: any) => {
        item.mobileItems.forEach((mobileItem: any) => {
          console.log(
            mobileItem.shops.shopName,
            shopName,
            mobileItem.shops.shopName === shopName,
          );

          if (mobileItem.shops.shopName !== shopName) {
            uniqueOutlets.add(JSON.stringify(mobileItem.shops));
          }
        });
      });
      setOutlets(Array.from(uniqueOutlets).map((shop) => JSON.parse(shop)));
      setProduct(fetchedProduct);
    } catch (error: any) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [productId, user.role, currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_res = await getUserProfile({ email: user.email });
        if (user_res?.data) {
          setCurrentUser(user_res?.data.user);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUserData();
  }, [window.onload]);

  useEffect(() => {
    fetchOutlets();
    fetchProduct();
  }, [fetchProduct]);

  const selectRandomItems = useCallback(
    (n: number) => {
      if (
        !product?.Items ||
        product.Items.filter((item) => {
          return (
            item.stockStatus?.toLowerCase() === 'available' ||
            item.stockStatus?.toLowerCase() === 'ok' ||
            item.stockStatus?.toLowerCase() === 'distributed'
          );
        }).length < n
      ) {
        setDistributeError('Not enough items available for distribution');
        return;
      }

      const shuffled = [
        ...product.Items.filter(
          (item) =>
            item.stockStatus?.toLowerCase() === 'available' ||
            item.stockStatus?.toLowerCase() === 'ok' ||
            item.stockStatus?.toLowerCase() === 'distributed',
        ),
      ].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, n).map((item) => ({
        stockId: item.id,
        category: product.itemType,
        quantity: 1,
      }));

      setSelectedItems(selected);
    },
    [product],
  );

  const toggleItemSelection = useCallback(
    (item: any) => {
      const itemData = {
        stockId: item.id,
        category: product?.itemType,
      };

      setSelectedItems((prev) => {
        const isSelected = prev.some((i) => i.stockId === item.id);
        if (isSelected) {
          return prev.filter((i) => i.stockId !== item.id);
        } else {
          if (prev.length >= quantity!) {
            setDistributeError(
              'Cannot select more items than specified quantity',
            );
            return prev;
          }
          return [...prev, { ...itemData, category: itemData.category || '' }];
        }
      });
    },
    [product, quantity],
  );

  const handleDistribute = async (event: React.FormEvent) => {
    event.preventDefault();
    // if (user.role !== 'manager' && user.role !== 'superuser') {
    //   return setDistributeError(
    //     'You are not authorized to distribute products',
    //   );
    // }
    if (!shopName || !quantity || !productId || selectedItems.length === 0) {
      return setDistributeError(
        'Please fill in all required fields and select items',
      );
    }
    if (selectedItems.length !== quantity) {
      return setDistributeError(
        'Selected items count must match the specified quantity',
      );
    }

    setDistributing(true);
    try {
      // return;
      const response = await axios.post(
        user.role === 'manager' || user.role === 'superuser'
          ? `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/distribution/bulk-distribution`
          : `${import.meta.env.VITE_SERVER_HEAD}/api/transfer/bulk-transfer`,
        user.role === 'manager' || user.role === 'superuser'
          ? {
              shopDetails: {
                mainShop: 'Kahawa 2323',
                distributedShop: shopName,
              },
              category: product?.itemType,
              bulkDistribution: selectedItems,
            }
          : {
              shopDetails: {
                mainShop: currentUser.assignedShop.shopName,
                distributedShop: shopName,
              },
              category: product?.itemType,
              bulkDistribution: selectedItems,
            },
        { withCredentials: true },
      );

      if (response.data.error) {
        throw new Error(
          response.data.details.map((detail: any) => detail.reason).join(', '),
        );
      }

      if (response.status === 200) {
        setShowMessage('Products successfully distributed');
        setQuantity(0);
        setRemarks('');
        setSelectedItems([]);
        fetchProduct(); // Refresh product data
      }
    } catch (error: any) {
      console.error('Error:', error);
      setDistributeError(
        error.response?.data?.message ||
          error.message ||
          'Failed to distribute product',
      );
    } finally {
      setDistributing(false);
    }
  };

  useEffect(() => {
    if (quantity && selectionMode === 'random') {
      selectRandomItems(quantity);
    } else if (quantity && selectionMode === 'manual') {
      setSelectedItems([]); // Reset selections when switching to manual mode
    }
  }, [quantity, selectionMode, selectRandomItems]);
  //

  const renderDistributeSection = () => (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-md">
      <div className="p-4 bg-gray-50 dark:bg-meta-4 border-b dark:border-strokedark">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          {user.role === 'manager' ? 'Distribute Product' : 'Transfer Product'}
        </h2>
      </div>
      {/* {user.role === 'seller' ? (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
          <p className="text-gray-500 dark:text-yellow-400">
            Feature is under Maintenance
          </p>
        </div>
      ) : ( */}
      <form onSubmit={handleDistribute} className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Shop
            </label>
            <select
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
            >
              <option value="">Select a shop</option>
              {outletListings.map((shop) => (
                <option key={shop.id} value={shop.shopName}>
                  {shop.shopName} -- {shop.address}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Quantity
            </label>
            <input
              min={1}
              type="number"
              max={product?.Items?.length}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
            />
          </div>
        </div>

        <div className="flex space-x-4 items-center">
          <button
            type="button"
            onClick={() => setSelectionMode('random')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectionMode === 'random'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-meta-4 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Random Selection
          </button>
          <button
            type="button"
            onClick={() => setSelectionMode('manual')}
            className={`flex items-center px-4 py-2 rounded-lg ${
              selectionMode === 'manual'
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-meta-4 text-gray-700 dark:text-gray-300'
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            Manual Selection
          </button>
        </div>

        {quantity! > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">
              Selected Items ({selectedItems.length}/{quantity})
            </h3>
            <div className="max-h-60 overflow-y-auto">
              <pre className="p-3">{`${
                product?.itemType === 'mobiles' ? 'IMEI' : 's/No'
              } - Batch Number\n`}</pre>
              {product?.Items?.filter(
                (available: any) =>
                  available.stockStatus?.toLowerCase() === 'available' ||
                  available.stockStatus?.toLowerCase() === 'ok' ||
                  available.stockStatus?.toLowerCase() === 'distributed',
              )
                .sort((a, b) =>
                  selectedItems.some((i) => i.stockId === a.id) ? -1 : 1,
                )
                .map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() =>
                      selectionMode === 'manual' && toggleItemSelection(item)
                    }
                    className={`p-3 border rounded-lg mb-2 cursor-pointer ${
                      selectedItems.some((i) => i.stockId === item.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 dark:border-strokedark'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{`${
                        item.IMEI || item.serialNumber
                      } - ${item.batchNumber} / ${item.id}`}</span>
                      <CheckCircle
                        className={`w-5 h-5 ${
                          selectedItems.some((i) => i.stockId === item.id)
                            ? 'text-primary'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {distributeError && (
          <div className="text-red-500 text-sm mt-2">{distributeError}</div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={distributing || selectedItems.length !== quantity}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            {distributing
              ? 'Processing...'
              : user.role === 'manager'
              ? 'Distribute'
              : 'Transfer'}
          </button>
        </div>
      </form>
      {/* )} */}
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'distribute_product':
        return renderDistributeSection();

      case 'transfer_history':
        return (
          <div className="bg-white dark:bg-boxdark-2 rounded-lg shadow-md">
            <ProductTransferHistory
              product={product!}
              productId={productId || null}
              isMobile={isMobile === 'true'}
            />
          </div>
        );

      case 'product_details':
        return (
          <ProductDetail product={product!} refreshProductData={fetchProduct} />
        );

      case 'shops_in_stock':

        return (
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                Shops in Stock
              </h2>
            </div>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <Store className="h-4 w-4" />
                          <span>Shop Name</span>
                        </div>
                      </th>
                      <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <span>Address</span>
                      </th>
                      <th className="whitespace-nowrap px-6 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">
                        <span>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {!outlets || outlets.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8">
                          <div className="flex flex-col items-center justify-center gap-3">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                            <p className="text-base text-gray-500 dark:text-gray-400">
                              No shops are currently in stock
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      outlets.map((shop) => (
                        <tr
                          key={shop.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {shop.shopName}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                            {shop.address}
                          </td>
                          <td className="whitespace-nowrap px-6 py-2 text-sm">
                            <button
                              onClick={() =>
                                navigate(`/outlets/${shop.shopName}`)
                              }
                              className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors duration-200"
                            >
                              View
                              <ArrowRight className="ml-2 h-4 w-4" />
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

      default:
        setActiveSection('product_details');
        return (
          <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
            <p className="text-gray-500 dark:text-gray-400">
              Select an option from the menu
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center space-x-4 w-full justify-end">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Available Stock:
        </div>
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
          {product?.Items?.filter(
            (item) => item.stockStatus.toLowerCase() !== 'sold',
          ).length || 0}{' '}
          {`${product?.Items?.length !== 1 ? 'Units' : 'Unit'}`}
        </div>
      </div>
      <Breadcrumb pageName="Product Details" header={product?.itemName} />

      <div className="mb-6">
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md overflow-x-auto">
          <div className="flex">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => {
                  setActiveSection(section.key);
                  navigate(`?tab=${section.key}`);
                }}
                className={`w-full md:w-auto flex items-center justify-center md:justify-start p-4 border-b md:border-b-0 last:border-b-0 outline-none ${
                  activeSection === section.key
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-meta-4'
                }`}
              >
                <section.icon className="mr-3 w-5 h-5 block" />
                <div className="text-sm font-medium whitespace-nowrap">
                  {section.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {!product ? (
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-md p-6">
          <p className="text-gray-500 dark:text-gray-400">
            Could not fetch product details :(
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-12">{renderContent()}</div>
        </div>
      )}

      {showMessage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-sm mx-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Success
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300">{showMessage}</p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductView;
