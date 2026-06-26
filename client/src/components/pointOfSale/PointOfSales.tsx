import React, { useEffect } from 'react';
import Message from '../alerts/Message';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { CartItem } from './types/Cart';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { DecodedToken } from '@/types/decodedToken';
import { PRODUCTS_PER_PAGE } from './constants';
import { ConsolidatedData } from './types/ConsolidatedData';
import { GroupedCartItem } from './types/GroupedCartItem';
import { Product } from './types/Product';
import { Receipt } from './components/Receipt';
import { SaleResponse, Financer } from './types/types';
import { ShopHeader } from './components/ShopHeader';
import { ProductSection } from './components/ProductSection';
import { CartSection } from './components/CartSection';

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
  const [total, setTotal] = React.useState<number>(0);
  const [soldprice, setSoldPrice] = React.useState<{ [key: string]: number }>(
    {},
  );
  const [financeDetails, setFinanceDetails] = React.useState<{ [key: string]: { amount: number, status: string, financerId: string } }>(
    {},
  );
  type PaymentMethod = 'cash' | 'mpesa' | 'creditcard';

  interface Payment {
    paymentMethod: PaymentMethod;
    amount: number;
    transactionId: string;
  }

  const [payments, setPayments] = React.useState<Payment[]>([
    { paymentMethod: 'cash', amount: 0, transactionId: '' },
  ]);
  const [showCustomerDetails, setShowCustomerDetails] =
    React.useState<boolean>(false);
  const [saleResponse, setSaleResponse] = React.useState<SaleResponse[] | null>(
    null,
  );
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

  const handlePaymentChange = (
    index: number,
    field: keyof Payment,
    value: string | number,
  ) => {
    const newPayments = [...payments];
    (newPayments[index] as any)[field] = value;
    setPayments(newPayments);
  };

  const addPayment = () => {
    setPayments([
      ...payments,
      { paymentMethod: 'mpesa', amount: 0, transactionId: '' },
    ]);
  };

  const removePayment = (index: number) => {
    const newPayments = payments.filter((_, i) => i !== index);
    setPayments(newPayments);
  };

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

  const clearCart = () => {
    setCart([]);
    setFormData({ name: '', email: '', phonenumber: '' });
    setPayments([
      {
        paymentMethod: 'cash',
        amount: 0,
        transactionId: '',
      },
    ]);
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

  const totalPaid = React.useMemo(
    () => payments.reduce((sum, p) => sum + Number(p.amount), 0),
    [payments],
  );

  useEffect(() => {
    if (payments.length === 1) {
      setPayments((prev) => [{ ...prev[0], amount: total }]);
    }
  }, [total]);

  useEffect(() => {
    const pricesInvalid =
      Object.values(soldprice).some((price) => price <= 0) && cart.length > 0;
    const paymentInvalid = total !== totalPaid && cart.length > 0;

    if (pricesInvalid || paymentInvalid) {
      setCheckoutDisabled(true);
    } else {
      setCheckoutDisabled(false);
    }
  }, [soldprice, payments, total, cart, totalPaid]);

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

      const paymentsForApi = payments.map((p) => ({
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        transactionId: p.transactionId || null,
      }));

      groupedCart.forEach((product: any) => {
        //console.log("products received", product)
        const items = product.items.map((item: any) => ({
          productId: item.stock.productId,
          itemId: item.stock.id,
          soldprice:
            product.categoryId.itemType === 'accessories'
              ? (soldprice[product.categoryId.id] || 0) * item.quantity
              : soldprice[product.categoryId.id],
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
          payments: paymentsForApi,
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
      //console.log("@@@@@@@@@@@consoloditaed data",consolidatedData)
      if (response.status === 200) {
        setMessage({
          text: response.data?.message || 'Sale processed successfully',
          type: 'success',
        });
        setSaleResponse(response.data.data);
        clearCart();
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
          <ShopHeader shopInfo={consolidatedData.shopInfo} />

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
              <ProductSection
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                brands={brands}
                paginatedProducts={paginatedProducts}
                filteredProducts={filteredProducts}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                totalPages={totalPages}
                isInCart={isInCart}
                addToCart={addToCart}
                formatPrice={formatPrice}
              />
            ) : (
              <CartSection
                cart={cart}
                groupedCart={groupedCart}
                total={total}
                totalPaid={totalPaid}
                soldprice={soldprice}
                setSoldPrice={setSoldPrice}
                financeDetails={financeDetails}
                setFinanceDetails={setFinanceDetails}
                financers={financers}
                showCustomerDetails={showCustomerDetails}
                setShowCustomerDetails={setShowCustomerDetails}
                formData={formData}
                setFormData={setFormData}
                payments={payments}
                handlePaymentChange={handlePaymentChange}
                addPayment={addPayment}
                removePayment={removePayment}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                clearCart={clearCart}
                handleCheckout={handleCheckout}
                checkoutDisabled={checkoutDisabled}
                submitting={submitting}
                formatPrice={formatPrice}
              />
            )}
          </div>
        </div>
      </>
    );
};

export default PointOfSales;
