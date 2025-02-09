import { useState, useEffect, useMemo } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import {
  ShoppingCartIcon,
  X,
  UserPlus,
  Smartphone,
  Package,
  ChevronUp,
  ChevronDown,
  Search,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  TriangleAlert,
} from 'lucide-react';
import SuchEmpty from '../suchEmpty';
import Message from '../alerts/Message';
import { useNavigate } from 'react-router-dom';
import { DecodedToken } from '../../types/decodedToken';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';

type Product = {
  id: string;
  stock: {
    itemName: string;
    maxprice: number;
  };
  category: string;
};

const PRODUCTS_PER_PAGE = 10;
const ITEMS_PER_PAGE = 10;

const PointOfSales = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phonenumber: '',
  });
  const [errors, setErrors] = useState(0);
  const navigate = useNavigate();
  const [soldprice, setSoldPrice] = useState<{ [key: string]: number }>({});
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [financeCompany, setFinanceCompany] = useState<string>('watu');
  const [outletData, setOutletData] = useState<any | null>(null);
  const [inventoryLoading, setInventoryLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState('products');
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [salesType, setSalesType] = useState<string>('direct');
  const [submitting, setSubmitting] = useState(false);
  const [checkoutDisabled, setCheckoutDisabled] = useState<boolean>(false);
  const currency = 'Ksh';
  const vatRate = 0.0;
  const [expandedProducts, setExpandedProducts] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [itemPages, setItemPages] = useState<any>({});

  const addToCart = (category: any, item: any) => {
    setCart((prevCart: any) => {
      const existingItem = prevCart.find(
        (cartItem: any) => cartItem.stock.id === item.id,
      );
      if (existingItem) {
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
        },
      ];
    });
    updateTotal();
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      return prevCart.filter(
        (cartItem: any) => cartItem.category.id !== productId,
      );
    });
    updateTotal();
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart((prevCart: any) =>
      prevCart.map((item: any) =>
        item.stock.id === itemId ? { ...item, soldunits: newQuantity } : item,
      ),
    );
    updateTotal();
  };

  const updateTotal = (newValue?: number) => {
    // const newTotal = groupedCart.reduce((acc: number, product: any) => {
    //   return (
    //     acc +
    //     product.items.reduce((itemAcc: number, item: any) => {
    //       return itemAcc + item.productcost;
    //     }, 0)
    //   );
    // }, 0);

    const newTotal = Object.values(soldprice).reduce(
      (acc: number, price: number) => acc + price,
      0, // Initial value
    );

    const newtotal = groupedCart.reduce((sum: number, product: any) => {
      const price = soldprice[product.categoryId.id];
      return sum + price * product.items.length;
    }, 0);
    setTotal(newtotal);
  };

  useEffect(() => {
    updateTotal();
  }, [cart, soldprice]);

  // Check if an item is in cart
  const isInCart = (productId: string, itemId: string) => {
    const product = groupedCart.find((p: any) => {
      return p.categoryId.id === productId;
    });
    if (!product) return false;
    return product.items.some((item: any) => item.id === itemId);
  };

  useEffect(() => {
    const fetchUserData = async () => {
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
          `${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${
            decoded.email
          }`,
          { withCredentials: true },
        );
        const { assignedShop } = response.data.user;
        if (!assignedShop) {
          throw new Error('Shop data not found in user profile');
        }
        setOutletData(assignedShop);
      } catch (error: any) {
        setMessage({
          text:
            error.response?.data.message ||
            error.message ||
            'Failed to load user data',
          type: 'error',
        });
      }
    };

    fetchUserData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${outletData.shopName}`,
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        const { phoneItems = [], stockItems = [] } =
          response.data.shop.filteredShop;
        let products: Product[] = [];
        for (const item of phoneItems) {
          products.push({
            ...item,
            category: 'phone',
          });
        }
        for (const item of stockItems) {
          products.push({
            ...item,
            category: 'accessory',
          });
        }
        setInventory([...products]);
      } else {
        setMessage({
          text: response.data.message || 'Shop data could not be fetched.',
          type: 'error',
        });
      }
    } catch (error: any) {
      setMessage({
        text:
          error.response?.message || error?.message || 'Something went wrong',
        type: 'error',
      });
    }
  };
  useEffect(() => {
    if (outletData) {
      fetchInventoryData();
    }
  }, [outletData]);

  const handleCheckout = async () => {
    try {
      setSubmitting(true);
      const bulkSales: Array<any> = [];
      if (cart.length === 0) {
        setMessage({ text: 'Cart is empty', type: 'error' });
        return;
      }

      groupedCart.forEach((product: any) => {
        const items = product.items.map((item: any) => ({
          productId: item.id,
          soldprice: soldprice[product.categoryId.id],
          soldUnits: 1
        }));
        bulkSales.push({
          CategoryId: product.categoryId.id,
          itemType: product.categoryId.itemType,
          items: [...items],
          paymentmethod: paymentMethod,
        });
      });
      
      const token = localStorage.getItem('tk');
      if (!token) throw new Error('Token not found. User not authenticated.');

      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/sales/items/sale`,
        {
          customerdetails: formData,
          shopName: outletData.shopName,
          bulksales: [...bulkSales],
        },
        {
          withCredentials: true,
        },
      );

      if (response.status === 200) {
        setMessage({
          text: response.data?.message || 'Sale processed successfully',
          type: 'success',
        });
        setCart([]);
        setFormData({ name: '', email: '', phonenumber: '' });
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
      fetchInventoryData();
    }
  };

  const groupedItems = useMemo(() => {
    if (!inventory) return [];

    const grouped = inventory.reduce((acc: any, item: any) => {
      const categoryId = item.categoryId.id;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId: item.categoryId,
          items: [],
          quantity: 0,
        };
      }

      if (item.stock.stockStatus.toLowerCase() === 'distributed') {
        acc[categoryId].items.push(item.stock);
        acc[categoryId].quantity += item.quantity;
      }

      return acc;
    }, {});
    return Object.values(grouped);
  }, [inventory]);

  type GroupedCartItem = {
    categoryId: {
      id: string;
      itemName: string;
      brand: string;
      itemModel: string;
      minPrice: number;
      maxPrice: number;
    };
    items: any[];
    quantity: number;
  };

  const groupedCart = useMemo<GroupedCartItem[]>(() => {
    if (!cart) return [];
    const grouped = cart.reduce((acc: any, item: any) => {
      const categoryId = item.category.id;

      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryId: item.category,
          items: [],
          quantity: 0,
        };
      }

      acc[categoryId].items.push(item.stock);
      acc[categoryId].quantity += item.soldunits;
      return acc;
    }, {});

    return Object.values(grouped);
  }, [cart]);

  useEffect(() => {
    const hasInvalidPrice = Object.values(soldprice).some(
      (price, index) =>
        price > groupedCart[index]?.categoryId.maxPrice ||
        price < groupedCart[index]?.categoryId.minPrice,
    );
    setCheckoutDisabled(hasInvalidPrice);
  }, [soldprice, groupedCart]);

  // Filtering and search logic
  const filteredProducts = useMemo(() => {
    console.log(inventory);
    
    return Object.entries(groupedItems).filter(([_, product]: any) => {
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
        product.items.some((item: any) =>
          item.IMEI.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      const matchesBrand =
        !selectedBrand || product.categoryId.brand === selectedBrand;
      return matchesSearch && matchesBrand;
    });
  }, [groupedItems, searchTerm, selectedBrand]);

  // Pagination logic
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const brands = useMemo(
    () => [
      ...new Set(
        Object.values(groupedItems).map((p: any) => p.categoryId.brand),
      ),
    ],
    [groupedItems],
  );

  const toggleExpand = (productId: string) => {
    setExpandedProducts((prev: any) => {
      const newExpandedProducts = Object.keys(prev).reduce(
        (acc: any, key: string) => {
          acc[key] = false;
          return acc;
        },
        {},
      );
      return {
        ...newExpandedProducts,
        [productId]: !prev[productId],
      };
    });
    // Initialize item pagination when expanding
    if (!itemPages[productId]) {
      setItemPages((prev: any) => ({
        ...prev,
        [productId]: 1,
      }));
    }
  };

  const handleItemPageChange = (productId: string, page: number) => {
    setItemPages((prev: any) => ({
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

  return (
    <>
      {message && (
        <Message
          message={message.text}
          type={message.type}
          onClose={() => setMessage(null)}
        />
      )}
      <div className="dark:bg-boxdark-2 min-h-screen mx-auto py-4">
        <Breadcrumb pageName="Point of Sale" />

        {/* Navigation Tab */}
        <div className="sticky flex justify-center mb-8 border-b dark:border-boxdark border-slate-300">
          <button
            className={`px-4 py-2 w-1/2 text-center outline-none ${
              activeTab === 'products'
                ? 'text-lg font-bold border-b-2 border-primary/60'
                : 'text-sm text-gray-500'
            }`}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
          <button
            className={`px-4 py-2 w-1/2 text-center outline-none ${
              activeTab === 'cart'
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
                    {paginatedProducts.map(([productId, product]: any) => (
                      <div
                        key={productId}
                        className="overflow-hidden rounded-md"
                      >
                        
                        <div
                          className="cursor-pointer bg-bodydark/50 p-3 dark:bg-boxdark text-black transition-all duration-500 rounded-lg shadow-sm"
                          onClick={() => toggleExpand(productId)}
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
                                  <p className="text-gray-500 dark:text-slate-400">
                                    {product.categoryId.brand} -{' '}
                                    {product.categoryId.itemModel}
                                  </p>
                                </div>
                              </div>
                              {expandedProducts[productId] ? (
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
                          className={`bg-bodydark1 dark:bg-boxdark/60 p-2 transition-all duration-500 ${
                            expandedProducts[productId]
                              ? 'max-h-screen opacity-100'
                              : 'max-h-0 opacity-0 overflow-hidden'
                          }`}
                        >
                          {/* Items Pagination */}
                          <div className="flex justify-between items-center mb-4 text-gray-600 dark:text-slate-400">
                            <p className="text-sm">
                              Showing items{' '}
                              {(itemPages[productId] - 1) * ITEMS_PER_PAGE + 1}{' '}
                              -
                              {Math.min(
                                itemPages[productId] * ITEMS_PER_PAGE,
                                product.items.length,
                              )}{' '}
                              of {product.items.length}
                            </p>
                            <div className="flex gap-2 dark:text-slate-400">
                              <button
                                className="px-3 py-1 text-xs md:text-base border border-primary/40 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-500"
                                disabled={itemPages[productId] === 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemPageChange(
                                    productId,
                                    itemPages[productId] - 1,
                                  );
                                }}
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                className="px-3 py-1 text-xs md:text-base border border-primary/40 rounded hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed disabled:border-slate-500"
                                disabled={
                                  itemPages[productId] * ITEMS_PER_PAGE >=
                                  product.items.length
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemPageChange(
                                    productId,
                                    itemPages[productId] + 1,
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
                                  (itemPages[productId] - 1) * ITEMS_PER_PAGE,
                                  itemPages[productId] * ITEMS_PER_PAGE,
                                )
                                .map((item: any) => (
                                  <div
                                    key={item.id}
                                    onClick={() =>
                                      addToCart(product.categoryId, item)
                                    }
                                    className={`relative cursor-pointer bg-bodydark/50 dark:bg-boxdark p-4 rounded-lg shadow-sm flex justify-between items-center border hover:scale-110 transition-transform duration-300
                                      ${
                                        isInCart(
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
                                      <p className="font-medium text-black dark:text-slate-300">
                                        IMEI: {item.IMEI}
                                      </p>
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
            // Cart Section
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
                              {/* <button
                              onClick={() =>
                                updateQuantity(
                                  product.categoryId.id,
                                  product.quantity - 1,
                                )
                              }
                              className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                            >
                              <Minus className="h-4 w-4 text-black dark:text-slate-400" />
                            </button> */}
                              <span className="text-black dark:text-slate-200">
                                {product.items.length}
                              </span>
                              {/* <button
                              onClick={() =>
                                updateQuantity(
                                  product.categoryId.id,
                                  product.quantity + 1,
                                )
                              }
                              className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                            >
                              <Plus className="h-4 w-4 text-black dark:text-slate-400" />
                            </button> */}
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
                              value={soldprice[product.categoryId.id]}
                              onChange={(e) => {
                                setSoldPrice({
                                  ...soldprice,
                                  [product.categoryId.id]: e.target.value,
                                });

                                updateTotal(Number(e.target.value));
                              }}
                              className="dark:bg-boxdark border border-slate-500 px-2 p-1 rounded-md"
                            />
                            {'per Item'}
                            {/* <p className="font-semibold text-black dark:text-slate-200">
                            {formatPrice(product.categoryId.minPrice * product.items.length)}
                          </p> */}
                          </div>
                        </div>
                        {soldprice[product.categoryId.id] >
                          product.categoryId.maxPrice && (
                          <>
                            <span className="text-xs text-red-400 font-bold animate-pulse">{`Max Price should be ${formatPrice(
                              product.categoryId.maxPrice,
                            )}`}</span>
                          </>
                        )}
                        {soldprice[product.categoryId.id] <
                          product.categoryId.minPrice && (
                          <>
                            <span className="text-xs text-red-400 font-bold animate-pulse">{`Min Price should be ${formatPrice(
                              product.categoryId.minPrice,
                            )}`}</span>
                          </>
                        )}
                      </>
                    ))}
                    {/* {groupedCart.map((item) => (
                      <div
                        key={item.stock.id}
                        className="bg-bodydark1 dark:bg-boxdark/60 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex-grow">
                          <h3 className="font-semibold text-black dark:text-slate-200">
                            {item.stock.IMEI}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-slate-400">
                            {item.category.itemName}
                          </p>
                          <div className="flex items-center mt-2 space-x-3">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.stock.id,
                                  item.soldunits - 1,
                                )
                              }
                              className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                            >
                              <Minus className="h-4 w-4 text-black dark:text-slate-400" />
                            </button>
                            <span className="text-black dark:text-slate-200">
                              {item.soldunits}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.stock.id,
                                  item.soldunits + 1,
                                )
                              }
                              className="p-1 rounded-full hover:bg-bodydark2 dark:hover:bg-boxdark-2"
                            >
                              <Plus className="h-4 w-4 text-black dark:text-slate-400" />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="font-semibold text-black dark:text-slate-200">
                            {formatPrice(item.stock.maxprice * item.soldunits)}
                          </p>
                          <button
                            onClick={() => removeFromCart(item.stock.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))} */}
                  </div>
                )}

                {/* Customer Details Section */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowCustomerDetails(!showCustomerDetails)}
                    className="w-full flex items-center justify-center py-2 px-4 bg-bodydark dark:bg-accent1 text-black dark:text-slate-400 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {showCustomerDetails ? 'Hide' : 'Add'} Customer Details {!showCustomerDetails ? '(optional)' : ''}
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
                    {/* <div className='mb-4'>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Financer
                      </label>
                      <select
                        value={salesType}
                        onChange={(e) => setSalesType(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg"
                      >
                        <option value="direct">Direct Payment</option>
                        <option value="finance">Hire Purchase</option>
                      </select>
                    </div> */}
                    {/* {salesType === 'direct' ? ( */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Payment Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className={`w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg`}
                      >
                        <option value="cash">Cash</option>
                        <option value="mpesa">M-pesa</option>
                        <option value="creditcard">Credit Card</option>
                      </select>
                    </div>
                    {/* ) : (
                      <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                        Finance Company
                      </label>
                      <select
                        value={financeCompany}
                        onChange={(e) => setFinanceCompany(e.target.value)}
                        className={`w-full px-3 py-2 bg-white dark:bg-boxdark border border-slate-300 dark:border-slate-600 rounded-lg`}
                      >
                        <option value="mkopa">M-Kopa</option>
                        <option value="watu">Watu Simu</option>
                      </select>
                    </div>
                    )} */}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      onClick={() => {
                        setCart([]);
                        setFormData({ name: '', email: '', phonenumber: '' });
                      }}
                      className={`
                        flex justify-center rounded-lg border border-slate-300 dark:border-slate-600 py-2 px-6 font-medium text-black dark:text-white hover:bg-opacity-90`}
                    >
                      Clear Cart
                    </button>
                    <button
                      className="text-white py-2 px-4 rounded-lg bg-primary hover:bg-opacity-90 disabled:opacity-50"
                      disabled={cart.length === 0 || checkoutDisabled}
                      onClick={handleCheckout}
                    >
                      Checkout
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
