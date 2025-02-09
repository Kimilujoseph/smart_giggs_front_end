import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Plus,
  Archive,
  RotateCcw,
  Tag,
  Search,
  Download,
  Smartphone,
  PlusCircleIcon,
  ChevronDown,
  PlusCircle,
  Edit,
  User,
  ChevronUpIcon,
  ChevronDownIcon,
} from 'lucide-react';
import { Alert, Typography } from '@mui/material';
import { Product } from '../../types/product';
import axios from 'axios';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Message from '../../components/alerts/Message';
import { format, set } from 'date-fns';
import capitalizeFirstLetter from '../../common/Loader/TitleCase';
import { DecodedToken } from '../../types/decodedToken';
import jwt_decode from 'jwt-decode';

const useQuery = () => new URLSearchParams(useLocation().search);

const ProductDetail = ({
  product,
  refreshProductData,
}: {
  product: Product;
  refreshProductData: () => void;
}) => {
  const token = localStorage.getItem('tk');
  const user: DecodedToken = jwt_decode(token!);
  if (!token || !user) {
    return (
      <div>
        You seem to be logged out. Click{' '}
        <a onClick={() => localStorage.clear()} href="/auth/signin">
          here
        </a>{' '}
        to login again
      </div>
    );
  }
  if (!product) return null;
  const [isOpen, setIsOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<{
    [key: string]: boolean;
  }>({});
  const navigate = useNavigate();
  const query = useQuery();
  const [activeTab, setActiveTab] = useState(query.get('subtab') || 'details');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);

  // Item details
  const [IMEI, setIMEI] = useState('');
  const [productcost, setCost] = useState('');
  const [color, setColor] = useState('');
  const [commission, setCommission] = useState('');
  const [discount, setDiscount] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [newserialNumber, setNewSerialNumber] = useState('');
  const [financer, setFinancer] = useState('captech');
  const [addingUnit, setAddingUnit] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const { productId } = useParams<{ productId: string }>();
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );
  const [disabledFields, setDisabledFields] = useState({
    itemName: true,
    itemModel: true,
    brand: true,
    maxPrice: true,
    minPrice: true,
  });

  const handleDisabled = (fieldName: string, value: boolean) => {
    setDisabledFields((prev) => ({
      ...prev,
      itemName: true,
      itemModel: true,
      brand: true,
      maxPrice: true,
      minPrice: true,
    }));
    setDisabledFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const batches = [
    {
      id: 'B001',
      quantity: 100,
      unit: 'Pieces',
      status: 'active',
      expiryDate: '2024-12-31',
    },
    {
      id: 'B002',
      quantity: 50,
      unit: 'Boxes',
      status: 'disabled',
      expiryDate: '2024-11-30',
    },
  ];

  const handleAddUnit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setAddingUnit(true);
      console.log(productId);
      // return;
      const data = {
        CategoryId: productId,
        IMEI,
        serialNumber: newserialNumber,
        batchNumber: newBatchNumber,
        availableStock: 1,
        supplierName,
        productcost,
        color,
        stockStatus: 'Available',
        commission,
        discount,
      };
      const response = await axios.post(
        product?.itemType === 'mobiles'
          ? `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/add-phone-stock`
          : `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/create-stock`,
        {
          ...(product?.itemType === 'mobiles'
            ? {
                phoneDetails: data,
                financeDetails: {
                  financer: financer,
                  financeAmount: financer === 'captech' ? productcost : 0,
                  financeStatus: financer === 'captech' ? 'paid' : 'pending',
                },
              }
            : data),
        },
        { withCredentials: true },
      );

      if (response.status !== 201) {
        throw new Error(
          response.data.message || 'Failed to add new unit to inventory',
        );
      }
      setMessage({
        text: 'New unit added successfully',
        type: 'success',
      });
      refreshProductData();
    } catch (error: any) {
      setMessage({
        text: error.response?.data.message || 'Failed to add new unit',
        type: `${error.response.status === 404 ? 'warning' : 'error'}`,
      });
    } finally {
      setAddingUnit(false);
    }
  };

  const toggleActionsMenu = (itemId: string) => {
    setActionMenuOpen((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };
  const handleStatusChange = (unitId: number, newStatus: string) => {
    // Implement status change logic
  };

  const handleAddBatch = () => {
    // Implement batch addition logic
    console.log('Adding new batch:', {
      newBatchNumber,
      quantity,
      unitPrice,
      selectedUnit,
      expiryDate,
    });
  };

  const handleToggleBatchStatus = (batchId: string) => {
    // Implement batch status toggle logic
  };

  const getStatusBadgeClass = (status: string) => {
    const baseClass = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status.toLowerCase()) {
      case 'available':
        return `${baseClass} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
      case 'defective':
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      case 'distributed':
        return `${baseClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
      case 'sold':
        return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400`;
      case 'suspended':
        return `${baseClass} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
      default:
        return `${baseClass} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`;
    }
  };

  const filteredUnits = product?.Items.filter((item) => {
    if (!product?.Items) return [];
    const matchesSearch =
      searchQuery.toLowerCase() === '' ||
      item.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.IMEI?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      selectedStatus === 'all' ||
      item.stockStatus.toLowerCase() === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white dark:bg-boxdark rounded-lg shadow-md w-auto">
      {message && (
        <Message
          type={message.type}
          message={message.text}
          onClose={() => setMessage(null)}
        />
      )}
      <div className="p-4 sm:p-6 w-auto">
        {/* Responsive Tabs */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="flex space-x-2 sm:space-x-4 px-4 sm:px-0 mb-6 border-b dark:border-strokedark whitespace-nowrap">
            {['details', 'units'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  navigate(`?tab=product_details&subtab=${tab}`);
                }}
                className={`pb-2 px-3 sm:px-4 text-sm font-medium transition-colors min-w-fit ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Product Name
                </label>
                <input
                  type="text"
                  defaultValue={product?.itemName}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                />
              </div>
              {/* Model */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Model
                </label>
                <input
                  type="text"
                  defaultValue={product?.itemModel}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                />
              </div>
              {/* Brand */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Brand
                </label>
                <input
                  defaultValue={product?.brand}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                />
              </div>
              {/* Min/Max Price */}
              <div className="flex gap-4">
                <div>
                  <label className="flex justify-between block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 px-4">
                    <span>Min Price</span>
                    <Edit
                      onClick={() => handleDisabled('minPrice', false)}
                      className="h-4 w-4 text-primary"
                    />
                  </label>
                  <input
                    type="number"
                    defaultValue={product?.minPrice}
                    disabled={disabledFields.minPrice}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary  dark:border-form-strokedark dark:text-white
                      ${
                        disabledFields.minPrice
                          ? 'bg-boxdark border-none'
                          : 'dark:bg-form-input'
                      }`}
                  />
                </div>
                <div>
                  <label className="flex justify-between block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300 px-4">
                    <span>Max Price</span>
                    <Edit
                      onClick={() => handleDisabled('maxPrice', false)}
                      className="h-4 w-4 text-primary"
                    />
                  </label>
                  <input
                    type="number"
                    defaultValue={product?.maxPrice}
                    disabled={disabledFields.maxPrice}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'units' && (
            <div className="space-y-6 max-w-[80vw]">
              {/* Add New Unit Section - More Responsive */}
              {(user.role === 'manager' || user.role === 'superuser') && (
                <div className="bg-white dark:bg-boxdark rounded-xl shadow-sm border border-gray-100 dark:border-strokedark overflow-hidden">
                  {/* Header - Always visible */}
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full p-4 sm:p-5 flex items-center justify-between text-left bg-bodydark1 dark:bg-boxdark-2/60 hover:bg-bodydark1/60 dark:hover:bg-boxdark-2/40 transition-colors duration-150"
                    aria-expanded={isOpen}
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                      <PlusCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3 text-primary" />
                      Add New Item
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-500 dark:text-gray-400 transform transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Collapsible Form Content */}
                  <div
                    className={`transition-all duration-500 ease-in-out ${
                      isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                    } overflow-y-auto`}
                  >
                    <form
                      onSubmit={handleAddUnit}
                      className="p-4 sm:p-5 border-t dark:border-strokedark bg-bodydark1 dark:bg-boxdark-2"
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                        {product.itemType === 'mobiles' && (
                          <div>
                            <label
                              htmlFor="imei"
                              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                            >
                              IMEI Number
                            </label>
                            <input
                              id="imei"
                              type="text"
                              value={IMEI}
                              placeholder="15 digit IMEI"
                              onChange={(e) => setIMEI(e.target.value)}
                              className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                            />
                          </div>
                        )}
                        {/* Serial Number */}
                        {/* <div>
                          <label
                            htmlFor="serialNumber"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Serial Number
                          </label>
                          <input
                            id="serialNumber"
                            type="text"
                            value={newserialNumber}
                            onChange={(e) => setNewSerialNumber(e.target.value)}
                            placeholder="1111-2222-XXXX"
                            className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                          />
                        </div> */}
                        {/* Batch Number */}
                        <div>
                          <label
                            htmlFor="batch"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Batch Number
                          </label>
                          <input
                            id="batch"
                            type="text"
                            value={newBatchNumber}
                            onChange={(e) => setNewBatchNumber(e.target.value)}
                            placeholder="S20241230-XXXX-XXXXX"
                            className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                          />{' '}
                        </div>
                        {/* Color */}
                        <div className="col-span-1 lg:col-span-1">
                          <label
                            htmlFor="color"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Color
                          </label>
                          <input
                            id="color"
                            type="text"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="Color variant"
                            className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                          />
                        </div>
                        {/* Cost */}
                        <div className="col-span-2 lg:col-span-1">
                          <label
                            htmlFor="productcost"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Item Cost
                          </label>
                          <input
                            id="productcost"
                            min={0}
                            type="number"
                            value={productcost}
                            onChange={(e) => setCost(e.target.value)}
                            placeholder="Buying price"
                            className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                          />
                        </div>
                        {/* Supplier */}
                        <div className="col-span-1">
                          <label
                            htmlFor="supplierName"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Supplier
                          </label>
                          <input
                            id="supplierName"
                            type="text"
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            placeholder="Techno Mobile Dist."
                            className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                          />
                        </div>
                        {/* Financer */}
                        {product.itemType === 'mobiles' && (
                          <div className="col-span-1">
                            <label
                              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                              htmlFor="financer"
                            >
                              Financer
                            </label>
                            <select
                              name="financer"
                              id="financer"
                              placeholder="Select Financer"
                              onChange={(e) => setFinancer(e.target.value)}
                              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            >
                              <option value="captech">Captech</option>
                              <option value="watu">Watu Simu</option>
                              <option value="mkopa">M-Kopa</option>
                            </select>
                          </div>
                        )}
                        {/* Commission */}
                        <div className="col-span-1 lg:col-span-1">
                          <label
                            htmlFor="commission"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Commission Payable
                          </label>
                          <input
                            id="commission"
                            min={0}
                            type="number"
                            value={commission}
                            onChange={(e) => setCommission(e.target.value)}
                            placeholder="Comm. Payable to seller"
                            className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                          />
                        </div>
                        {/* Discount */}
                        <div className="col-span-1 lg:col-span-1">
                          <label
                            htmlFor="discount"
                            className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
                          >
                            Discount
                          </label>
                          <input
                            id="discount"
                            min={0}
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="Discount on item"
                            className="w-full px-4 py-2.5 bg-white dark:bg-form-input border border-gray-200 dark:border-strokedark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:text-white text-sm transition-all duration-150"
                          />
                        </div>
                      </div>
                      {/* Submit */}
                      <div className="mt-5 flex justify-end">
                        <button
                          onClick={() => setIsOpen(!isOpen)}
                          disabled={addingUnit}
                          type="submit"
                          className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all duration-150 flex items-center justify-center font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-boxdark"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          {addingUnit ? 'Processing...' : 'Add Unit'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Search and Filter Section - More Responsive */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by Serial or IMEI..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                  />
                </div>
                <div className="flex gap-4 sm:gap-6">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="distributed">
                      {user.role === 'manager' ? 'Distributed' : 'In Stock'}
                    </option>
                    <option value="sold">Sold</option>
                    <option value="defective">Defective</option>
                  </select>
                  {(user.role === 'manager' || user.role === 'superuser') && (
                    <button className="w-full sm:w-auto px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center justify-center">
                      <Download className="w-4 h-4 mr-2" />
                      Import
                    </button>
                  )}
                </div>
              </div>

              {/* Units List - More Responsive */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 overflow-y-auto h-[500px] border border-slate-700 rounded-lgs">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-strokedark">
                    <thead className="bg-bodydark1 dark:bg-meta-4 sticky top-0 z-10">
                      <tr>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider table-cell">
                          IMEI
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider table-cell">
                          Batch Number
                        </th>
                        {product.itemType === 'mobiles' ? (
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider table-cell">
                            Color
                          </th>
                        ) : (
                          <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider table-cell">
                            Units
                          </th>
                        )}
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider table-cell">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-strokedark">
                      {!filteredUnits || filteredUnits.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                          >
                            No items available
                          </td>
                        </tr>
                      ) : (
                        filteredUnits.map((item) => (
                          <tr
                            key={item.id}
                            className="hover:bg-bodydark1 dark:hover:bg-meta-4"
                          >
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 table-cell">
                              {item.IMEI}
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 table-cell">
                              {item.batchNumber || '-'}
                            </td>
                            {product.itemType === 'mobiles' ? (
                              <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 table-cell">
                                {item.color}
                              </td>
                            ) : (
                              <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 table-cell">
                                {item.availableStock}
                              </td>
                            )}
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                              <span
                                className={getStatusBadgeClass(
                                  item.stockStatus,
                                )}
                              >
                                {item.stockStatus
                                  .replace('_', ' ')
                                  .toUpperCase()}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 table-cell">
                              {item.updatedAt
                                ? format(
                                    new Date(item.updatedAt),
                                    'MMM dd, HH:mm',
                                  )
                                : 'N/A'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'batches' && (
            <>
              {setActiveTab('details')}
              <div className="space-y-6">
                <div className="flex gap-2 items-center">
                  <AlertCircle className="h-4 w-4" />
                  <Typography>
                    Manage product batches and their status. Disabled batches
                    won't be available for distribution.
                  </Typography>
                </div>

                {/* Add New Batch Form */}
                <div className="p-4 border dark:border-strokedark rounded-lg">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                    Add New Batch
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Batch Number
                      </label>
                      <input
                        type="text"
                        value={newBatchNumber}
                        onChange={(e) => setNewBatchNumber(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-form-input dark:border-form-strokedark dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleAddBatch}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
                    >
                      Add Batch
                    </button>
                  </div>
                </div>

                {/* Batch List */}
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div
                      key={batch.id}
                      className={`p-4 border dark:border-strokedark rounded-lg ${
                        batch.status === 'disabled' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-800 dark:text-white">
                            Batch #{batch.id}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {batch.quantity} {batch.unit} • Expires:{' '}
                            {batch.expiryDate}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleBatchStatus(batch.id)}
                            className={`p-2 rounded-lg ${
                              batch.status === 'active'
                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                                : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                            }`}
                          >
                            {batch.status === 'active' ? (
                              <Archive className="w-5 h-5" />
                            ) : (
                              <RotateCcw className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
