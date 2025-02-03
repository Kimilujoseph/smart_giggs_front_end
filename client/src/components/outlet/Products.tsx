import React, { useEffect, useState } from 'react';
import { Product } from '../../types/product';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface ProductTableProps {
  // getFreshUserData: () => void;
}
const ProductsTable: React.FC<ProductTableProps> = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [product, setProduct] = useState<Product>({});
  const navigate = useNavigate();


  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/mobile`,
          {
            withCredentials: true,
          },
        );
        const res1 = await axios.get(
          `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/accessory`,
          {
            withCredentials: true,
          },
        );
        let products: any[] | ((prevState: Product[]) => Product[]) = [];

        if (res.data) {
          res.data.data.map((i: any) => products.push(i));
        }
        if (res1.data) {
          res1.data.item.map((i: any) => products.push(i));
        }
        setInventory(products);
      } catch (error) {
        console.error('Error fetching inventory data:', error);
      }
    })();
  }, []);

  useEffect(() => {
    console.log(product);
  }, [product]);
  return (
    <>
      <div className="rounded-sm border border-stroke bg-white  shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Item Name
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  IMEI
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Quantity
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Cost
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Min Price
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Max Price
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((product) => (
                <tr
                  key={product._id}
                  className="border-b border-[#eee] dark:border-strokedark"
                >
                  <td className="py-1.5 px-4 pl-9">
                    <h5 className="font-medium text-black dark:text-white text-md">
                      {product.itemName}
                    </h5>
                  </td>
                  <td className="py-1.5 px-4">
                    <p className="text-black dark:text-white text-md">
                      {product.IMEI}
                    </p>
                  </td>
                  <td className="py-1.5 px-4">
                    <p className="text-black dark:text-white text-md">
                      {product.availableStock}
                    </p>
                  </td>
                  <td className="py-1.5 px-4">
                    <p className="text-black dark:text-white text-md">
                      {product.productcost}
                    </p>
                  </td>
                  <td className="py-1.5 px-4">
                    <p className="text-black dark:text-white text-md">
                      {product.minprice}
                    </p>
                  </td>
                  <td className="py-1.5 px-4">
                    <p className="text-black dark:text-white text-md">
                      {product.maxprice}
                    </p>
                  </td>
                  <td className="py-1.5 px-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setProduct(product);
                        localStorage.setItem(
                          'product',
                          JSON.stringify(product),
                        );
                        navigate(`/inventory/${product._id}`);
                      }}
                      className="flex justify-center font-medium text-gray p-2"
                    >
                      <svg
                        className="fill-primary dark:fill-white"
                        width="18"
                        height="16"
                        viewBox="0 0 22 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11 15.1156C4.19376 15.1156 0.825012 8.61876 0.687512 8.34376C0.584387 8.13751 0.584387 7.86251 0.687512 7.65626C0.825012 7.38126 4.19376 0.918762 11 0.918762C17.8063 0.918762 21.175 7.38126 21.3125 7.65626C21.4156 7.86251 21.4156 8.13751 21.3125 8.34376C21.175 8.61876 17.8063 15.1156 11 15.1156ZM2.26876 8.00001C3.02501 9.27189 5.98126 13.5688 11 13.5688C16.0188 13.5688 18.975 9.27189 19.7313 8.00001C18.975 6.72814 16.0188 2.43126 11 2.43126C5.98126 2.43126 3.02501 6.72814 2.26876 8.00001Z"
                          fill=""
                        />
                        <path
                          d="M11 10.9219C9.38438 10.9219 8.07812 9.61562 8.07812 8C8.07812 6.38438 9.38438 5.07812 11 5.07812C12.6156 5.07812 13.9219 6.38438 13.9219 8C13.9219 9.61562 12.6156 10.9219 11 10.9219ZM11 6.625C10.2437 6.625 9.625 7.24375 9.625 8C9.625 8.75625 10.2437 9.375 11 9.375C11.7563 9.375 12.375 8.75625 12.375 8C12.375 7.24375 11.7563 6.625 11 6.625Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ProductsTable;
