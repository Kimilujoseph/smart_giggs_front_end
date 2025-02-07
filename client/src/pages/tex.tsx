import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import axios from 'axios';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { CircularProgress } from '@mui/material';

interface Sale {
  id: string;
  seller: string;
  quantity: number;
  date: string;
  type: string;
}

interface Product {
  itemName: string;
  category: string;
  brand: string;
  itemModel: string;
  availableStock: number;
  faultyItems: number;
  maxprice: number;
  minprice: number;
  discount: number;
  history: Sale[];
}

const ProductView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeSection, setActiveSection] = useState<string>('Product Details'); // Default section
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/product/${id}`,
          {
            withCredentials: true,
          },
        );
        if (response.data) {
          setProduct(response.data.product);
        }
      } catch (error) {
        console.error('Error fetching product data:', error);
      }
    };

    fetchProduct();
  }, [id]);

  if (!product) {
    return <CircularProgress />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'Product Details':
        return (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="max-w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Product Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1.5 px-4">
                      <p className="text-black dark:text-white text-md">
                        Item Name: {product.itemName}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Category: {product.category}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Brand: {product.brand}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Model: {product.itemModel}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Available Stock: {product.availableStock}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Faulty Items: {product.faultyItems}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Max Price: {product.maxprice}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Min Price: {product.minprice}
                      </p>
                      <p className="text-black dark:text-white text-md">
                        Discount: {product.discount}
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Sales History':
        return (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="max-w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Sales History
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.history.length > 0 ? (
                    product.history.map((sale) => (
                      <tr
                        key={sale.id}
                        className="border-b border-[#eee] dark:border-strokedark"
                      >
                        <td className="py-1.5 px-4">
                          <p className="text-black dark:text-white text-md">
                            Seller: {sale.seller}
                          </p>
                          <p className="text-black dark:text-white text-md">
                            Quantity: {sale.quantity}
                          </p>
                          <p className="text-black dark:text-white text-md">
                            Date: {new Date(sale.date).toLocaleDateString()}
                          </p>
                          <p className="text-black dark:text-white text-md">
                            Type: {sale.type}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white text-md">
                          No sales history available.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Product Settings':
        return <div>Product settings content here</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mx-auto dark:text-white">
        <Breadcrumb pageName={`Product: ${product.itemName}`} />
        <div className="flex items-center justify-between w-full py-2 sm:py-4">
          <p
            onClick={() => {
              navigate(-1);
            }}
            className="text-md my-4 font-bold dark:text-secondary cursor-pointer"
          >
            <KeyboardBackspaceIcon fontSize="medium" className="text-primary" />{' '}
            Back
          </p>

          <div className="flex items-center gap-x-2">
            <LocationOnIcon fontSize="small" className="text-secondary" />
            <p className="text-sm font-bold dark:text-stroke tracking-wide">
              {product.itemModel}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          {/* Left Navigation */}
          <div className="flex flex-col w-1/4 bg-gray-200 dark:bg-meta-4 p-4 rounded-sm shadow-default">
            <button
              onClick={() => setActiveSection('Product Details')}
              className={`py-2 px-4 text-left font-bold ${
                activeSection === 'Product Details'
                  ? 'text-primary'
                  : 'text-black dark:text-white'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveSection('Sales History')}
              className={`py-2 px-4 text-left font-bold ${
                activeSection === 'Sales History'
                  ? 'text-primary'
                  : 'text-black dark:text-white'
              }`}
            >
              Sales History
            </button>
            <button
              onClick={() => setActiveSection('Product Settings')}
              className={`py-2 px-4 text-left font-bold ${
                activeSection === 'Product Settings'
                  ? 'text-primary'
                  : 'text-black dark:text-white'
              }`}
            >
              Product Settings
            </button>
          </div>

          {/* Main Content */}
          <div className="w-3/4">{renderContent()}</div>
        </div>
      </div>
    </>
  );
};

export default ProductView;
