import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Package,
  Share2,
  Edit,
  TrendingUp,
} from 'lucide-react';
import ProductTransferHistory from './product/TransferHistory';
import ProductDetail from './product/ProductDetail';
import { Product } from '../types/product';
import { DecodedToken } from '../types/decodedToken';
import jwt_decode from 'jwt-decode';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import { getUserProfile } from '../api/user_manager';
import { Shop } from '@/types/shop';
import CategorySalesReport from '../components/inventory/CategorySalesReport';

import ProductNavigationTabs, {
  SectionItem,
} from './product/components/ProductNavigationTabs';
import MobileDistributeSection from './product/components/MobileDistributeSection';
import AccessoriesDistributeSection from './product/components/AccessoriesDistributeSection';
import ShopsInStockTable, { Outlet } from './product/components/ShopsInStockTable';
import SuccessModal from './product/components/SuccessModal';

interface SelectedItem {
  stockId: string;
  category: string;
  quantity: number;
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
  const [quantity, setQuantity] = useState<number>(0);
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
  const [openHistories, setOpenHistories] = useState<Record<string, boolean>>({});

  const handleCloseModal = () => setShowMessage('');

  const toggleHistory = (batchId: string) => {
    setOpenHistories((prev) => ({ ...prev, [batchId]: !prev[batchId] }));
  };

  const sections: SectionItem[] = [
    {
      name: user.role === 'manager' ? 'Distribute Product' : 'Transfer Product',
      key: 'distribute_product',
      icon: Share2,
    },
    { name: 'Product Details', key: 'product_details', icon: Edit },
    { name: 'Shops in Stock', key: 'shops_in_stock', icon: Package },
    { name: 'Sales Report', key: 'sales_report', icon: TrendingUp },
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
    } catch (error: any) {
      alert(error.response?.message || error.message || "An error occurred while fetching outlets");
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    if (user.role === 'seller' && !currentUser) {
      return;
    }
    try {
      setLoading(true);
      const response = await axios.get(
        currentUser?.role === 'seller'
          ? `${import.meta.env.VITE_SERVER_HEAD}/api/category/get-category/shop/${currentUser.assignedShop.shopName}/${productId}`
          : `${import.meta.env.VITE_SERVER_HEAD}/api/category/get-category/${productId}`,
        {
          withCredentials: true,
        },
      );
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Failed to fetch product');
      }
      const fetchedProduct = response.data.data;

      if (
        fetchedProduct.itemType === 'smartphones' ||
        fetchedProduct.itemType === 'smallphones'
      ) {
        fetchedProduct.category = 'mobiles';
      } else {
        fetchedProduct.category = 'accessories';
      }

      const uniqueOutlets = new Set();
      fetchedProduct.Items.forEach((item: any) => {
        if (fetchedProduct.category === 'mobiles') {
          item.mobileItems.forEach((mobileItem: any) => {
            if (mobileItem.shops.shopName !== shopName) {
              uniqueOutlets.add(JSON.stringify(mobileItem.shops));
            }
          });
        }
        if (fetchedProduct.category === 'accessories') {
          item.accessoryItems.forEach((accessoryItem: any) => {
            if (accessoryItem.shops.shopName !== shopName) {
              uniqueOutlets.add(JSON.stringify(accessoryItem.shops));
            }
          });
        }
      });
      setOutlets(Array.from(uniqueOutlets).map((shop: any) => JSON.parse(shop)));
      setProduct(fetchedProduct);
    } catch (error: any) {
      alert(error.response?.message || error.message || "An error occurred while fetching product details");
    } finally {
      setLoading(false);
    }
  }, [productId, user?.role, currentUser, shopName]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_res = await getUserProfile({ email: user.email });
        if (user_res?.data) {
          setCurrentUser(user_res?.data.user);
        }
      } catch (error: any) {
        alert(error.response?.message || error.message || "An error occurred user data");
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    fetchOutlets();
    fetchProduct();
  }, [fetchProduct, fetchOutlets]);

  const handleQuantityChange = (stockId: string, newQuantity: number) => {
    setSelectedItems((prev) =>
      prev.map((item) =>
        item.stockId === stockId
          ? {
              ...item,
              quantity: Math.min(
                newQuantity,
                product?.Items?.find((i) => i.id === stockId)?.availableStock || 0,
              ),
            }
          : item,
      ),
    );
  };

  const selectRandomItems = useCallback(
    (n: number) => {
      if (!product) return;
      if (product.category === 'mobiles') {
        // Mobile random selection logic can be placed here if needed
      } else {
        const availableItems = product.Items?.filter(
          (item) => (item.availableStock || 0) > 0,
        ) || [];
        let remaining = n;
        const selected: SelectedItem[] = [];
        const shuffled = [...availableItems].sort(() => 0.5 - Math.random());
        for (const item of shuffled) {
          if (remaining <= 0) break;
          const allocate = Math.min(item.availableStock || 0, remaining);
          selected.push({
            stockId: item.id,
            category: product.category,
            quantity: allocate,
          });
          remaining -= allocate;
        }
        if (remaining > 0) {
          setDistributeError('Not enough stock available');
          return;
        }
        setSelectedItems(selected);
      }
    },
    [product],
  );

  const toggleItemSelection = useCallback(
    (item: any) => {
      setSelectedItems((prev) => {
        const isSelected = prev.some((i) => i.stockId === item.id);
        if (isSelected) {
          return prev.filter((i) => i.stockId !== item.id);
        } else {
          if (product?.category === 'mobiles') {
            if (prev.length >= quantity!) {
              setDistributeError(
                'Cannot select more items than specified quantity',
              );
              return prev;
            }
            return [
              ...prev,
              { stockId: item.id, category: product.category, quantity: 1 },
            ];
          } else {
            const currentTotal = prev.reduce((sum, i) => sum + i.quantity, 0);
            if (currentTotal >= quantity!) return prev;
            const allocate = Math.min(
              item.availableStock,
              quantity! - currentTotal,
            );
            return [
              ...prev,
              {
                stockId: item.id,
                category: product.category,
                quantity: allocate,
              },
            ];
          }
        }
      });
    },
    [product?.category, quantity],
  );

  const handleDistribute = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shopName || !quantity || !productId || selectedItems.length === 0) {
      return setDistributeError(
        'Please fill in all required fields and select items',
      );
    }

    const totalQuantity = selectedItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );
    if (totalQuantity !== quantity) {
      return setDistributeError(
        'Selected items quantity must match the specified quantity',
      );
    }

    setDistributing(true);
    try {
      const response = await axios.post(
        user?.role === 'manager' || user?.role === 'superuser'
          ? `${import.meta.env.VITE_SERVER_HEAD}/api/distribution/bulk-distribution`
          : `${import.meta.env.VITE_SERVER_HEAD}/api/transfer/bulk-transfer`,
        {
          shopDetails: {
            mainShop:
              user.role === 'manager' || user.role === 'superuser'
                ? 'Kahawa 2323'
                : currentUser?.assignedShop?.shopName,
            distributedShop: shopName,
          },
          category: product?.category,
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
        fetchProduct();
      }
    } catch (error: any) {
      alert(error.response?.message || error.message || "An error occurred during distribution");
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
      setSelectedItems([]);
    }
  }, [quantity, selectionMode, selectRandomItems]);

  const handleSelectTab = (key: string) => {
    setActiveSection(key);
    navigate(`?tab=${key}`);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'distribute_product':
        return product?.category === 'mobiles' ? (
          <MobileDistributeSection
            user={user}
            shopName={shopName}
            setShopName={setShopName}
            quantity={quantity}
            setQuantity={setQuantity}
            outletListings={outletListings}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            product={product}
            selectedItems={selectedItems}
            toggleItemSelection={toggleItemSelection}
            distributeError={distributeError}
            distributing={distributing}
            handleDistribute={handleDistribute}
          />
        ) : (
          <AccessoriesDistributeSection
            user={user}
            shopName={shopName}
            setShopName={setShopName}
            quantity={quantity}
            setQuantity={setQuantity}
            outletListings={outletListings}
            selectionMode={selectionMode}
            setSelectionMode={setSelectionMode}
            product={product}
            selectedItems={selectedItems}
            toggleItemSelection={toggleItemSelection}
            handleQuantityChange={handleQuantityChange}
            openHistories={openHistories}
            toggleHistory={toggleHistory}
            distributeError={distributeError}
            distributing={distributing}
            handleDistribute={handleDistribute}
          />
        );

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
          <ShopsInStockTable
            outlets={outlets}
            onNavigateOutlet={(shopNameStr) => navigate(`/outlets/${shopNameStr}`)}
          />
        );

      case 'sales_report':
        return <CategorySalesReport categoryId={productId!} />;

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
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Breadcrumb pageName="Product Details" header={product?.itemName} />

      <ProductNavigationTabs
        sections={sections}
        activeSection={activeSection}
        onSelectTab={handleSelectTab}
      />

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

      <SuccessModal showMessage={showMessage} onClose={handleCloseModal} />
    </div>
  );
};

export default ProductView;
