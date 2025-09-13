import {
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Package,
  Search,
  ShoppingCartIcon,
  Smartphone,
  TriangleAlert,
  UserPlus,
  X,
} from 'lucide-react';
import React, { useEffect } from 'react';
import SuchEmpty from '../suchEmpty';
import Message from '../alerts/Message';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { CartItem } from './types/Cart';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { DecodedToken } from '@/types/decodedToken';
import { ITEMS_PER_PAGE, PRODUCTS_PER_PAGE } from './constants';
import { ConsolidatedData } from './types/ConsolidatedData';
import { GroupedCartItem } from './types/GroupedCartItem';
import { Product } from './types/Product';
import Receipt from './components/Receipt';
import { SaleResponse, Financer } from './types/types';

const PointOfSales: React.FC = () => {
  const [message, setMessage] = React.useState<{
    text: string;
    type: string;
  } | null>(null);
  const [activeTab, setActiveTab] = React.useState<'products' | 'cart'>(
    'products',
  );
  const [consolidatedData, setConsolidatedData] =
    React.useState<ConsolidatedData | null>(null);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [checkoutDisabled, setCheckoutDisabled] =
    React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [selectedBrand, setSelectedBrand] = React.useState<string>('');
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [expandedProducts, setExpandedProducts] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [itemPages, setItemPages] = React.useState<{ [key: string]: number }>(
    {},
  );
  const [total, setTotal] = React.useState<number>(0);
  const [soldprice, setSoldPrice] = React.useState<{ [key: string]: number }>(
    {},
  );
  const [financeDetails, setFinanceDetails] = React.useState<{ [key: string]: { amount: number, status: string, financerId: string } }>(
    {},
  );
  const [paymentMethod, setPaymentMethod] = React.useState<
    'cash' | 'mpesa' | 'creditcard'
  >('cash');
  const [transactionId, setTransactionId] = React.useState<string>('');
  const [showCustomerDetails, setShowCustomerDetails] =
    React.useState<boolean>(false);
  const [saleResponse, setSaleResponse] = React.useState<SaleResponse[] | null>(null);
  const [financers, setFinancers] = React.useState<Financer[]>([]);
  const [formData, setFormData] = React.useState<{
    email: string;
    name: string;
    phonenumber: string;
  }>({
    email: '',
    name: '',
    phonenumber: '',
  });

  // Check if an item is in the cart
  const isInCart = (productId: number | string, itemId?: number) => {
    const product = groupedCart.find(
      (product: any) => product.categoryId.id === productId,
    );
    if (!product) return false;
    const item = product?.items.find((itm: any) => itm.stock.id === itemId);
    return !!item;
  };

  // Add an item to the cart
  const addToCart = (category: any, item?: any) => {
    setCart((prevCart: any) => {
      const existingItem = prevCart.find(
        (cartItem: any) => cartItem.stock.id === item.id,
      );

      if (existingItem) {
        // Handle accessory quantity increase
        if (category.itemType === 'accessories') {
          const newQuantity = existingItem.quantity + 1;
          if (newQuantity > item.quantity) return prevCart;
          return prevCart.map((cartItem: any) =>
            cartItem.stock.id === item.id
              ? { ...cartItem, quantity: newQuantity }
              : cartItem,
          );
        }
        return prevCart.filter(
          (cartItem: any) => cartItem.stock.id !== item.id,
        );
      }

      setSoldPrice({
        ...soldprice,
        [category.id]: soldprice[category.id] || category.minPrice,
      });

      return [
        ...prevCart,
        {
          category: category,
          stock: item,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: number | string) => {
    setCart((prevCart) => {
      return prevCart.filter(
        (cartItem: any) => cartItem.category.id !== productId,
      );
    });
  };

  // Toggle grouped items visibility
  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));

    if (!itemPages[productId]) {
      setItemPages((prev) => ({
        ...prev,
        [productId]: 1,
      }));
    }
  };

  const updateTotal = () => {
    const newtotal = groupedCart.reduce(
      (sum: number, product: GroupedCartItem) => {
        const price = soldprice?.[product.categoryId.id] ?? 0;
        const units =
          product.categoryId.itemType === 'mobiles'
            ? product.items.length
            : product.quantity;
        return sum + price * units;
      },
      0,
    );
    setTotal(newtotal);
  };

  useEffect(() => {
    updateTotal();
  }, [soldprice, cart]);

  useEffect(() => {
    if (Object.values(soldprice).some((price) => price <= 0)) {
      setCheckoutDisabled(true);
    } else {
      setCheckoutDisabled(false);
    }
  }, [soldprice]);

  const updateQuantity = (productId: number | string, units: number) => {
    const selected: any = groupedProducts.find(
      (item: any) => item.categoryId.id === productId,
    );
    if (units < 1 || (selected?.quantity && selected?.quantity < units)) return;
    setCart((prevCart: any) => {
      return prevCart.map((cartItem: any) =>
        cartItem.category.id === productId
          ? { ...cartItem, quantity: units }
          : cartItem,
      );
    });
  };

  const [shopName, setShopName] = React.useState<string>('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const tokenObj = localStorage.getItem('tk');
        if (!tokenObj) {
          throw new Error('Invalid or missing token');
        }
        const decoded: DecodedToken = jwt_decode(tokenObj);
        if (!decoded.email || decoded.email === undefined) {
          throw new Error('User email not found in token');
        }
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${decoded.email
          }`,
          { withCredentials: true },
        );
        const { assignedShop } = response.data.user;
        if (!assignedShop) {
          throw new Error('Shop data not found in user profile');
        }
        setShopName(assignedShop.shopName);

        const shopInfoResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD
          }/api/shop/${assignedShop.shopName}?itemType=mobile&status=confirmed&limit=1`,
          { withCredentials: true },
        );
        const shopInfoData = shopInfoResponse.data.shop.filteredShop;
        setConsolidatedData({
          shopInfo: {
            name: shopInfoData.name,
            address: shopInfoData.address,
            seller:
              shopInfoData.sellers.length > 0 ? shopInfoData.sellers[0] : null,
          },
          products: { mobiles: [], accessories: [] },
        });

        // Fetch financers
        const financersResponse = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/financer/all`,
          { withCredentials: true },
        );
        setFinancers(financersResponse.data.data);
      } catch (error: any) {
        setMessage({
          text:
            error.response?.data.message ||
            error.message ||
            'Failed to load initial data',
          type: 'error',
        });
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!shopName) return;

      try {
        let mobileItems: any[] = [];
        let accessoryItems: any[] = [];

        if (searchTerm.trim() !== '') {
          const searchResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_HEAD
            }/api/shop/searchproducts/${shopName}?productName=${searchTerm}`,
            { withCredentials: true },
          );
          mobileItems = searchResponse.data.products.phoneItems.items;
          accessoryItems = searchResponse.data.products.stockItems.items;
        } else {
          const mobileResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_HEAD
            }/api/shop/${shopName}?itemType=mobile&status=confirmed`,
            { withCredentials: true },
          );
          const accessoryResponse = await axios.get(
            `${import.meta.env.VITE_SERVER_HEAD
            }/api/shop/${shopName}?itemType=accessory&status=confirmed`,
            { withCredentials: true },
          );
          mobileItems = mobileResponse.data.shop.filteredShop.mobileItems.items;
          //console.log("transforimg item", mobileItems)
          accessoryItems =
            accessoryResponse.data.shop.filteredShop.accessoryItems.items;
        }

        const transformedMobiles = mobileItems.map((item: any) => ({
          id: item.id,
          productId: item.mobileID,
          categoryId: item.mobiles.categories.id,
          type: 'mobiles',
          name: item.mobiles.categories.itemName,
          brand: item.mobiles.categories.brand,
          model: item.mobiles.categories.itemModel,
          priceRange: {
            min: item.mobiles.categories.minPrice,
            max: item.mobiles.categories.maxPrice,
          },
          quantity: item.quantity,
          IMEI: item.mobiles.IMEI,
          transferId: item.transferId,
          ...item,
        }));

        const transformedAccessories = accessoryItems.map((item: any) => ({
          id: item.id,
          productId: item.accessoryID,
          categoryId: item.accessories.categories.id,
          type: 'accessories',
          name: item.accessories.categories.itemName,
          brand: item.accessories.categories.brand,
          model: item.accessories.categories.itemModel,
          priceRange: {
            min: item.accessories.categories.minPrice,
            max: item.accessories.categories.maxPrice,
          },
          quantity: item.quantity,
          transferId: item.transferId,
          ...item,
        }));

        setConsolidatedData((prevData) => ({
          ...prevData,
          products: {
            mobiles: transformedMobiles,
            accessories: transformedAccessories,
          },
        } as ConsolidatedData));
      } catch (error: any) {
        setMessage({
          text:
            error.response?.data.message ||
            error.message ||
            'Failed to load data',
          type: 'error',
        });
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [shopName, searchTerm]);

  const handleCheckout = async () => {
    try {
      setSubmitting(true);
      const bulkSales: Array<any> = [];
      if (cart.length === 0) {
        setMessage({ text: 'Cart is empty', type: 'error' });
        return;
      }

      groupedCart.forEach((product: any) => {
        //console.log("products received", product)
        const items = product.items.map((item: any) => ({
          productId: item.stock.productId,
          itemId: item.stock.id,
          soldprice: soldprice[product.categoryId.id],
          soldUnits:
            product.categoryId.itemType === 'accessories' ? item.quantity : 1,
          financeAmount:
            financeDetails[product.categoryId.id]?.amount?.toString() || '0',
          financeStatus:
            financeDetails[product.categoryId.id]?.status || 'paid',
          financeId:
            Number(financeDetails[product.categoryId.id]?.financerId) || 1,
        }));

        // console.log(
        //   'Items structure for category:',
        //   product.categoryId.itemName,
        //   JSON.stringify(items, null, 2),
        // );

        bulkSales.push({
          CategoryId: product.categoryId.id.split('-')[1],
          itemType: product.categoryId.itemType,
          items: [...items],
          paymentmethod: paymentMethod,
          transactionId: transactionId,
        });
      });

      const token = localStorage.getItem('tk');
      if (!token) throw new Error('Token not found. User not authenticated.');

      // console.log('Checkout data being sent:', {
      //   customerdetails: formData,
      //   shopName: consolidatedData?.shopInfo.name,
      //   bulksales: [...bulkSales],
      // });

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/sales/items/sale`,
        {
          customerdetails: formData,
          shopName: consolidatedData?.shopInfo.name,
          bulksales: [...bulkSales],
        },
        { withCredentials: true },
      );

      if (response.status === 200) {
        setMessage({
          text: response.data?.message || 'Sale processed successfully',
          type: 'success',
        });
        setSaleResponse(response.data.data);
        setCart([]);
        setFormData({ name: '', email: '', phonenumber: '' });
        setTransactionId('');
      }
    } catch (error: any) {
      setMessage({
        text:
          error.response?.data?.message ||
          error.message ||
          'There was an issue with the sales processing',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleItemPageChange = (productId: string, page: number) => {
    setItemPages((prev) => ({
      ...prev,
      [productId]: page,
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Memos
  const groupedCart = React.useMemo<GroupedCartItem[]>(() => {
    if (!cart) return [];
    const grouped = cart.reduce((acc: any, item: CartItem) => {
      const categoryId = item?.category.id;
      if (!categoryId) return acc;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId: item.category,
          items: [],
          quantity: 0,
        };
      }

      acc[categoryId].items.push(item);
      acc[categoryId].quantity += item.quantity;
      return acc;
    }, {});

    return Object.values(grouped);
  }, [cart]);

  const allProducts = React.useMemo(() => {
    if (!consolidatedData) return [];
    return [
      ...consolidatedData.products.mobiles,
      ...consolidatedData.products.accessories,
    ];
  }, [consolidatedData]);

  const groupedProducts = React.useMemo(() => {
    if (!allProducts) return [];

    const grouped = allProducts.reduce((acc: any, product: Product & { mobiles?: any; accessories?: any }) => {
      const itemType = product.type;

      // FIX: Get the correct category ID from the nested structure
      const realCategoryId =
        itemType === 'mobiles'
          ? product.mobiles.categories.id
          : product.accessories.categories.id;

      // Create the unique internal ID using the REAL category ID
      const categoryId =
        itemType === 'mobiles'
          ? `m-${realCategoryId}`
          : `a-${realCategoryId}`;

      if (!categoryId) return acc;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId: {
            id: categoryId, // The internal, prefixed ID ('m-1')
            itemName: product.name,
            itemType: product.type,
            brand: product.brand,
            itemModel: product.model,
            minPrice: product.priceRange.min,
            maxPrice: product.priceRange.max,
          },
          stock: product,
          items: [],
          quantity: 0,
        };
      }
      acc[categoryId].items.push(product);
      if (itemType === 'accessories') {
        acc[categoryId].quantity += product.quantity;
      } else {
        acc[categoryId].quantity = acc[categoryId].items.length;
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }, [allProducts]);

  const filteredProducts = React.useMemo(() => {
    return groupedProducts.filter((product: any) => {
      const matchesSearch =
        product.categoryId.itemName
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.categoryId.brand
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.categoryId.itemModel
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        product.stock?.IMEI?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand =
        !selectedBrand || product.categoryId.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [groupedProducts, searchTerm, selectedBrand]);

  const paginatedProducts = React.useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const brands = React.useMemo(
    () => [
      ...new Set(
        groupedProducts.map((product: any) => product.categoryId.brand),
      ),
    ],
    [groupedProducts],
  );

  if (!consolidatedData) {
    return (
      <div className="dark:bg-boxdark-2 min-h-screen mx-auto py-4">
        <Breadcrumb pageName="Point of Sale" />
        <div className="flex justify-center items-center h-64">
          <p>Loading shop data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      {saleResponse && <Receipt saleResponse={saleResponse} onClose={() => setSaleResponse(null)} />}
      <div className="dark:bg-boxdark-2 min-h-screen mx-auto py-4">
        <Breadcrumb pageName="Point of Sale" />

        {/* Shop Info Header */}
        <div className="mb-6 p-4 bg-bodydark1 dark:bg-boxdark rounded-lg">
          <h1 className="text-xl font-bold text-black dark:text-slate-200">
            {consolidatedData.shopInfo.name}
          </h1>
          <p className="text-gray-600 dark:text-slate-400">
            {consolidatedData.shopInfo.address}
          </p>
          {consolidatedData.shopInfo.seller && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-slate-400">
                Seller: {consolidatedData.shopInfo.seller.name} (
                {consolidatedData.shopInfo.seller.phone})
              </p>
            </div>
          )}
        </div>

        {/* Navigation Tab */}
        <div className="sticky flex justify-center mb-8 border-b dark:border-boxdark border-slate-300">
          <button
            className={`px-4 py-2 w-1/2 text-center outline-none ${activeTab === 'products'
              ? 'text-lg font-bold border-b-2 border-primary/60'
              : 'text-sm text-gray-500'
              }`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`px-4 py-2 w-1/2 text-center outline-none ${activeTab === 'cart'
              ? 'text-lg font-bold border-b-2 border-primary/60'
              : 'text-sm text-gray-500'
              }`}
            onClick={() => setActiveTab('cart')}
          >
            Cart
            <span className="ml-2 px-2 p-1 rounded-full bg-amber-400 text-black font-bold text-center text-sm">
              {`${groupedCart.length} (${cart.length})`}
            </span>
          </button>
        </div>

        <div className="w-full flex justify-center mx-auto gap-6">
          {/* Products Section */}
          {activeTab === 'products' ? (
            <div className="md:p-6 w-full mx-auto">
              {/* Header and Controls */}
              <div className="mb-6">
                <div className="flex gap-2 md:gap-4 mb-6 mx-auto pr-2">
                  {/* Search */}
                  <div className="flex-1 w-full">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 dark:bg-boxdark border border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Brand Filter */}
                  <div className="w-auto md:min-w-[200px]">
                    <select
                      className="w-full p-2 dark:bg-boxdark border border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary/50"
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                    >
                      <option value="">All Brands</option>
                      {brands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Results Summary */}
                <div className="text-gray-600 mb-4">
                  Showing {paginatedProducts.length} of{' '}
                  {filteredProducts.length} products
                </div>
              </div>

              {paginatedProducts.length === 0 ? (
                <SuchEmpty
                  message="No products found"
                  description="Try searching for a different product or brand"
                  variant="emptyListing"
                />
              ) : (
                <>
                  {/* Product List */}
                  <div className="grid gap-4">
                    {paginatedProducts.map((product: any) => (
                      <div
                        key={product.categoryId.id}
                        className="overflow-hidden rounded-md"
                      >
                        <div
                          className={`cursor-pointer bg-bodydark/50 p-3 dark:bg-boxdark text-black transition-all duration-500 rounded-lg shadow-sm border dark:border-slate-700`}
                          onClick={() =>
                            toggleExpand(product.categoryId.id.toString())
                          }
                        >
                          <div className="flex flex-col justify-start">
                            <div className="w-full flex justify-between">
                              <div className="flex items-center gap-4">
                                <div className="bg-bodydark/40 dark:bg-boxdark-2/40 p-2 rounded-lg">
                                  <Smartphone className="w-6 h-6 text-primary dark:text-blue-600" />
                                </div>
                                <div className="text-gray-500 dark:text-slate-200">
                                  <h2 className="md:text-xl font-semibold">
                                    {product.categoryId.itemName}
                                  </h2>
                                  <h3 className="text-sm text-gray-500 dark:text-slate-400">
                                    {product.stock.batchNumber}
                                  </h3>
                                  <p className="text-gray-500 dark:text-slate-400">
                                    {product.categoryId.brand} -{' '}
                                    {product.categoryId.itemModel}
                                  </p>
                                </div>
                              </div>
                              {expandedProducts[product.categoryId.id] ? (
                                <ChevronUp className="w-5 h-5 text-boxdark-2 dark:text-gray-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-boxdark-2 dark:text-gray-400" />
                              )}
                            </div>
                            <div className="w-full flex justify-between items-center mt-4">
                              <div className="text-right flex gap-2 text-xs md:text-base text-gray-600">
                                <p className="hidden md:block text-gray-600 dark:text-slate-400">
                                  Price Range
                                </p>
                                <p className="font-medium text-slate-400">
                                  <span className="text-red-600 dark:text-red-400/70">
                                    {formatPrice(product.categoryId.minPrice)}
                                  </span>{' '}
                                  /{' '}
                                  <span className="text-green-600 dark:text-green-400/70">
                                    {Number(
                                      product.categoryId.maxPrice,
                                    ).toLocaleString()}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center space-x-2 dark:text-gray-400 md:text-lg">
                                <Package className="w-5 h-5" />
                                <span className="font-medium">
                                  {product.quantity}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          className={`bg-bodydark1 dark:bg-boxdark/60 p-2 transition-all duration-500 ${expandedProducts[product.categoryId.id]
                            ? 'max-h-screen opacity-100'
                            : 'max-h-0 opacity-0 overflow-hidden'
                            }`}
                        >
                          {/* Items Pagination */}
                          <div className="flex justify-between items-center mb-4 text-gray-600 dark:text-slate-400">
                            <p className="text-sm">
                              Showing items{' '}
                              {(itemPages[product.categoryId.id] - 1) *
                                ITEMS_PER_PAGE +
                                1}{' '}
                              -
                              {Math.min(
                                itemPages[product.categoryId.id] *
                                ITEMS_PER_PAGE,
                                product.items.length,
                              )}{' '}
                              of {product.items.length}
                            </p>
                            <div className="flex gap-2 dark:text-slate-400">
                              <button
                                className="px-3 py-1 text-xs md:text-base border border-primary/40 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-500"
                                disabled={
                                  itemPages[product.categoryId.id] === 1
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemPageChange(
                                    product.categoryId.id.toString(),
                                    itemPages[product.categoryId.id] - 1,
                                  );
                                }}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                className="px-3 py-1 text-xs md:text-base border border-primary/40 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-500"
                                disabled={
                                  itemPages[product.categoryId.id] *
                                  ITEMS_PER_PAGE >=
                                  product.items.length
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemPageChange(
                                    product.categoryId.id.toString(),
                                    itemPages[product.categoryId.id] + 1,
                                  );
                                }}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Items List */}
                          {product.items.length === 0 ? (
                            <div className="w-full h-12 flex justify-center items-center gap-4 text-yellow-500">
                              <TriangleAlert />
                              <span>This product is out of stock</span>
                            </div>
                          ) : (
                            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 pb-3">
                              {product.items
                                .slice(
                                  (itemPages[product.categoryId.id] - 1) *
                                  ITEMS_PER_PAGE,
                                  itemPages[product.categoryId.id] *
                                  ITEMS_PER_PAGE,
                                )
                                .map((item: any) => (
                                  <div
                                    key={item.id}
                                    onClick={() =>
                                      addToCart(product.categoryId, item)
                                    }
                                    className={`relative cursor-pointer bg-bodydark/50 dark:bg-boxdark p-4 rounded-lg shadow-sm flex justify-between items-center border hover:scale-110 transition-transform duration-300
                                    ${isInCart(
                                      product.categoryId.id,
                                      item.id,
                                    )
                                        ? 'border-primary/70'
                                        : 'dark:border-slate-700'
                                      }`}
                                  >
                                    {isInCart(
                                      product.categoryId.id,
                                      item.id,
                                    ) && (
                                        <CheckCircle className="text-primary absolute top-2 right-2 h-4 w-4" />
                                      )}
                                    <div className="text-xs">
                                      {product.categoryId.itemType ===
                                        'mobiles' ? (
                                        <p className="font-medium text-black dark:text-slate-300">
                                          IMEI: {item.IMEI}
                                        </p>
                                      ) : (
                                        <div className="font-medium text-black dark:text-slate-300">
                                          <p>Batch: {item.batchNumber}</p>
                                          <p>Stock: {item.quantity}</p>
                                        </div>
                                      )}
                                      <div className="text-sm dark:text-slate-400 mt-1">
                                        {item.discount > 0 && (
                                          <p className="text-green-600">
                                            Discount:{' '}
                                            {formatPrice(item.discount)}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Products Pagination */}
                  <div className="mt-6 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                      >
                        Previous
                      </button>
                      <button
                        className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="w-full md:w-3/4 xl:w-1/2 mx-auto">
              <div className="bg-bodydark/50 dark:bg-boxdark rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-black dark:text-slate-200 flex items-center">
                    <ShoppingCartIcon className="h-6 w-6 mr-2 text-primary" />
                    Shopping Cart
                  </h2>
                  <p className="text-lg font-semibold text-black dark:text-slate-200">
                    Total: {formatPrice(total)}
                  </p>
                </div>

                {cart.length === 0 ? (
                  <div className="border-4 border-dashed border-slate-400/20 rounded-lg">
                    <SuchEmpty
                      message="Your cart is empty"
                      description="Add items from the products section to get started"
                      variant="emptyCart"
                    />
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {groupedCart.map((product: any) => (
                      <>
                        <div
                          key={product.categoryId.id}
                          className="bg-bodydark1 dark:bg-boxdark/60 p-4 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-grow">
                            <h3 className="font-semibold text-black dark:text-slate-200">
                              {product.categoryId.itemName}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-slate-400">
                              {product.categoryId.brand} -{' '}
                              {product.categoryId.itemModel}
                            </p>
                            <div className="flex items-center mt-2 space-x-3">
                              {product.categoryId.itemType === 'mobiles' ? (
                                <span className="text-black dark:text-slate-200">
                                  {product.items.length}
                                </span>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() =>
                                      updateQuantity(
                                        product.categoryId.id,
                                        Number(
                                          cart.find(
                                            (item: any) =>
                                              item.category.id ===
                                              product.categoryId.id,
                                          )?.quantity,
                                        ) - 1,
                                      )
                                    }
                                    className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                                  >
                                    <ChevronDown className="h-4 w-4 text-black dark:text-red-400" />
                                  </button>
                                  <span className="text-black dark:text-slate-200">
                                    {
                                      cart.find(
                                        (item: CartItem) =>
                                          item.category.id ===
                                          product.categoryId.id,
                                      )?.quantity
                                    }
                                  </span>
                                  <button
                                    onClick={() => {
                                      updateQuantity(
                                        product.categoryId.id,
                                        Number(
                                          cart.find(
                                            (item: any) =>
                                              item.category.id ===
                                              product.categoryId.id,
                                          )?.quantity,
                                        ) + 1,
                                      );
                                    }}
                                    className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                                  >
                                    <ChevronUp className="h-4 w-4 text-black dark:text-green-400" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col justify-between h-full items-end gap-2">
                            <button
                              onClick={() =>
                                removeFromCart(product.categoryId.id)
                              }
                              className="text-red-500 hover:text-red-600"
                            >
                              <X className="h-5 w-5" />
                            </button>
                            <input
                              type="number"
                              min={product.categoryId.minPrice}
                              max={product.categoryId.maxPrice}
                              defaultValue={product.categoryId.minPrice}
                              value={soldprice?.[product.categoryId.id] || 0}
                              onChange={(e) => {
                                setSoldPrice({
                                  ...soldprice,
                                  [product.categoryId.id]: Number(
                                    e.target.value,
                                  ),
                                });
                              }}
                              className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md"
                            />
                            {'per Item'}
                          </div>
                        </div>
                        <div className="bg-bodydark1 dark:bg-boxdark/60 p-4 rounded-lg flex items-center justify-between mt-2">
                          <div className="flex items-center gap-4">
                            <input
                              type="number"
                              placeholder="Finance Amount"
                              className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md"
                              value={financeDetails[product.categoryId.id]?.amount || ''}
                              onChange={(e) => setFinanceDetails({
                                ...financeDetails,
                                [product.categoryId.id]: {
                                  ...financeDetails[product.categoryId.id],
                                  amount: Number(e.target.value)
                                }
                              })}
                            />
                            <select
                              className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md"
                              value={financeDetails[product.categoryId.id]?.status || 'paid'}
                              onChange={(e) => setFinanceDetails({
                                ...financeDetails,
                                [product.categoryId.id]: {
                                  ...financeDetails[product.categoryId.id],
                                  status: e.target.value
                                }
                              })}
                            >
                              <option value="paid">Paid</option>
                              <option value="pending">Pending</option>
                            </select>
                            <select
                              className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md"
                              value={financeDetails[product.categoryId.id]?.financerId || ''}
                              onChange={(e) => setFinanceDetails({
                                ...financeDetails,
                                [product.categoryId.id]: {
                                  ...financeDetails[product.categoryId.id],
                                  financerId: e.target.value
                                }
                              })}
                            >
                              <option value="">Select Financer</option>
                              {financers.map((financer) => (
                                <option key={financer.id} value={financer.id}>
                                  {financer.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {(soldprice?.[product.categoryId.id] ?? 0) >
                          product.categoryId.maxPrice && (
                            <>
                              <span className="text-xs text-red-400 font-bold animate-pulse">{`Max Price should be ${formatPrice(
                                product.categoryId.maxPrice,
                              )}`}</span>
                            </>
                          )}
                        {(soldprice?.[product.categoryId.id] ?? 0) <
                          product.categoryId.minPrice && (
                            <>
                              <span className="text-xs text-red-400 font-bold animate-pulse">{`Min Price should be ${formatPrice(
                                product.categoryId.minPrice,
                              )}`}</span>
                            </>
                          )}
                      </>
                    ))}
                  </div>
                )}

                {/* Customer Details Section */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                    className="w-full flex items-center justify-center py-2 px-4 bg-bodydark dark:bg-accent1 text-black dark:text-slate-400 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {showCustomerDetails ? 'Hide' : 'Add'} Customer Details{' '}
                    {!showCustomerDetails ? '(optional)' : ''}
                  </button>

                  {showCustomerDetails && (
                    <div className="space-y-4 mt-4">
                      <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg"
                      />
                      <div className="flex flex-col md:flex-row gap-4">
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg"
                        />
                        <input
                          type="phone"
                          placeholder="Phone Number"
                          value={formData.phonenumber}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              phonenumber: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="mt-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) =>
                          setPaymentMethod(
                            e.target.value as 'cash' | 'mpesa' | 'creditcard',
                          )
                        }
                        className={`w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg`}
                      >
                        <option value="cash">Cash</option>
                        <option value="mpesa">M-pesa</option>
                        <option value="creditcard">Credit Card</option>
                      </select>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                      Transaction ID (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., RKT... for M-Pesa"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => {
                        setCart([]);
                        setFormData({ name: '', email: '', phonenumber: '' });
                        setTransactionId('');
                      }}
                      className={`flex justify-center rounded-lg border border-slate-300 dark:border-slate-600 py-2 px-6 font-medium text-black dark:text-white hover:bg-opacity-90`}
                    >
                      Clear Cart
                    </button>
                    <button
                      className="text-white py-2 px-4 rounded-lg bg-primary hover:bg-opacity-90 disabled:opacity-50"
                      disabled={cart.length === 0 || checkoutDisabled}
                      onClick={handleCheckout}
                    >
                      {submitting ? 'Processing...' : 'Checkout'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PointOfSales;
