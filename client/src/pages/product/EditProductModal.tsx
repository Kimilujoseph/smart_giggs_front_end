import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';
import Message from '../../components/alerts/Message';

// Define types for the data we'll be fetching and using
interface Category {
  id: number;
  itemName: string;
  itemModel: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface ProductItem {
  id: number;
  itemType: 'mobiles' | 'accessories';
  [key: string]: any;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productItem: ProductItem | null;
  onUpdate: () => void; // To refresh data on successful update
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  productItem,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(
    null,
  );

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!productItem) return;
      setFetchingDetails(true);
      setMessage(null);
      try {
        const isMobile = productItem.itemType === 'mobiles';
        const url = isMobile
          ? `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/inventory/profile/mobile/${productItem.id}`
          : `${
              import.meta.env.VITE_SERVER_HEAD
            }/api/inventory/profile/accessory/${productItem.id}`;

        const response = await axios.get(url, { withCredentials: true });
        const productData = isMobile
          ? response.data.data.findSpecificProduct
          : response.data.data;
        setFormData({ ...productData, itemType: productItem.itemType });
      } catch (err) {
        console.error('Failed to fetch product details', err);
        setMessage({
          text: 'Failed to load product details.',
          type: 'error',
        });
      } finally {
        setFetchingDetails(false);
      }
    };

    if (isOpen && productItem) {
      fetchProductDetails();
    }
  }, [isOpen, productItem]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [catRes, supRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/category/all`, {
            withCredentials: true,
          }),
          axios.get(
            `${import.meta.env.VITE_SERVER_HEAD}/api/supplier/supplier`,
            { withCredentials: true },
          ),
        ]);
        setCategories(catRes.data.data);
        setSuppliers(supRes.data.data);
      } catch (err) {
        console.error('Failed to fetch categories or suppliers', err);
        setMessage({
          text: 'Failed to load necessary data.',
          type: 'error',
        });
      }
    };

    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productItem) return;

    console.log('Submitting product item:', productItem);

    setLoading(true);
    setMessage(null);

    const isMobile = productItem.itemType === 'mobiles';
    const url = isMobile
      ? `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/update-phone-product/${
          productItem.id
        }`
      : `${
          import.meta.env.VITE_SERVER_HEAD
        }/api/inventory/update-accessory-product/${productItem.id}`;

    const payload: any = {
      stockStatus: formData.stockStatus,
      commission: Number(formData.commission),
      productCost: Number(formData.productCost),
      discount: Number(formData.discount),
      color: formData.color,
      batchNumber: formData.batchNumber,
      CategoryId: formData.CategoryId,
      supplierId: formData.supplierId,
    };

    if (isMobile) {
      payload.IMEI = formData.IMEI;
    } else {
      payload.productType = formData.productType;
    }

    try {
      await axios.put(url, payload, { withCredentials: true });
      setMessage({ text: 'Product updated successfully!', type: 'success' });
      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setMessage({
        text:
          err.response?.data?.message ||
          'An error occurred while updating the product.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !productItem) {
    return null;
  }

  const isMobile = productItem.itemType === 'mobiles';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg w-full max-w-2xl mx-4">
        <div className="p-4 border-b dark:border-strokedark flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Edit Product
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {message && (
            <Message
              type={message.type}
              message={message.text}
              onClose={() => setMessage(null)}
            />
          )}
          {fetchingDetails ? (
            <div className="flex justify-center items-center h-48">
              <p>Loading product details...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Product Cost
                  </label>
                  <input
                    type="number"
                    name="productCost"
                    value={formData.productCost || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Commission
                  </label>
                  <input
                    type="number"
                    name="commission"
                    value={formData.commission || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock Status
                  </label>
                  <select
                    name="stockStatus"
                    value={formData.stockStatus || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  >
                    {isMobile ? (
                      <>
                        <option value="available">Available</option>
                        <option value="faulty">Faulty</option>
                        <option value="reserved">Reserved</option>
                      </>
                    ) : (
                      <>
                        <option value="available">Available</option>
                        <option value="faulty">Faulty</option>
                        <option value="suspended">Suspended</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    name="CategoryId"
                    value={formData.CategoryId || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.itemName} - {cat.itemModel}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Supplier
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId || ''}
                    onChange={handleChange}
                    className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name}
                      </option>
                    ))}
                  </select>
                </div>

                {isMobile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      IMEI
                    </label>
                    <input
                      type="text"
                      name="IMEI"
                      value={formData.IMEI || ''}
                      onChange={handleChange}
                      className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                    />
                  </div>
                )}

                {!isMobile && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Product Type
                    </label>
                    <input
                      type="text"
                      name="productType"
                      value={formData.productType || ''}
                      onChange={handleChange}
                      className="w-full mt-1 p-2 border rounded dark:bg-form-input dark:border-form-strokedark"
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 mr-2 bg-gray-200 dark:bg-gray-700 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-white rounded disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;
