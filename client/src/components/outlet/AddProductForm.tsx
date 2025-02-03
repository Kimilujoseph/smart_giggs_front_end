import axios from 'axios';
import React, { useState } from 'react';
import { Product } from '../../types/product';

// Define your product type interfaces
const MobilePhoneForm = ({ product, handleChange }) => (
  <>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Name
      </label>
      <input
        type="text"
        name="name"
        value={product.name}
        onChange={handleChange}
        placeholder="Enter product name"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Model
      </label>
      <input
        type="text"
        name="model"
        value={product.model}
        onChange={handleChange}
        placeholder="Enter model"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Brand
      </label>
      <input
        type="text"
        name="brand"
        value={product.brand}
        onChange={handleChange}
        placeholder="Enter brand"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        IMEI Number
      </label>
      <input
        type="text"
        name="imeiNumber"
        value={product.imeiNumber}
        onChange={handleChange}
        placeholder="Enter IMEI number"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Cost
      </label>
      <input
        type="number"
        name="cost"
        value={product.cost}
        onChange={handleChange}
        placeholder="Enter cost"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Min Price
      </label>
      <input
        type="number"
        name="minPrice"
        value={product.minPrice}
        onChange={handleChange}
        placeholder="Enter minimum price"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="my-2.5 block text-black dark:text-white">
        Max Price
      </label>
      <input
        type="number"
        name="maxPrice"
        value={product.maxPrice}
        onChange={handleChange}
        placeholder="Enter maximum price"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="my-2.5 block text-black dark:text-white">
        Discount
      </label>
      <input
        type="number"
        name="discount"
        value={product.discount}
        onChange={handleChange}
        placeholder="Enter discount"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="my-2.5 block text-black dark:text-white">
        Commission (%)
      </label>
      <input
        type="number"
        name="commission"
        value={product.commission}
        onChange={handleChange}
        placeholder="Enter commission"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>

    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Color
      </label>
      <input
        type="text"
        name="color"
        value={product.color}
        onChange={handleChange}
        placeholder="Enter color"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    {product.warranty && (
      <div>
        <label className="mb-2.5 block text-black dark:text-white text-sm">
          Warranty Period (months)
        </label>
        <input
          type="number"
          name="warrantyPeriod"
          value={product.warrantyPeriod || ''}
          onChange={handleChange}
          placeholder="Enter warranty period"
          className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          required
        />
      </div>
    )}
    <div className="my-2.5 block text-black cursor-pointer dark:text-white">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          name="warranty"
          checked={product.warranty}
          onChange={handleChange}
          className="w-6 h-6 appearance-none  border border-gray-400 checked:bg-primary focus:outline-none checked:border-transparent"
        />
        <span>Warranty</span>
      </label>
    </div>
  </>
);

interface AccessoriesFormProps {
  product: Product;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AccessoriesForm: React.FC<AccessoriesFormProps> = ({
  product,
  handleChange,
}) => (
  <>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Name
      </label>
      <input
        type="text"
        name="name"
        value={product.name}
        onChange={handleChange}
        placeholder="Enter product name"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Model
      </label>
      <input
        type="text"
        name="model"
        value={product.model}
        onChange={handleChange}
        placeholder="Enter model"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Brand
      </label>
      <input
        type="text"
        name="brand"
        value={product.brand}
        onChange={handleChange}
        placeholder="Enter brand"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Cost
      </label>
      <input
        type="number"
        name="cost"
        value={product.cost}
        onChange={handleChange}
        placeholder="Enter cost"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Min Price
      </label>
      <input
        type="number"
        name="minPrice"
        value={product.minPrice}
        onChange={handleChange}
        placeholder="Enter minimum price"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Max Price
      </label>
      <input
        type="number"
        name="maxPrice"
        value={product.maxPrice}
        onChange={handleChange}
        placeholder="Enter maximum price"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Color
      </label>
      <input
        type="text"
        name="color"
        value={product.color}
        onChange={handleChange}
        placeholder="Enter color"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
    <div>
      <label className="mb-2.5 block text-black dark:text-white text-sm">
        Quantity
      </label>
      <input
        type="text"
        name="quantity"
        value={product.quantity}
        onChange={handleChange}
        placeholder="Enter quantity"
        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        required
      />
    </div>
  </>
);

const AddProductForm: React.FC<AddProductFormProps> = ({
  setToggleAddUser,
  productType,
}) => {
  const [product, setProduct] = useState<Product>({
    name: '',
    model: '',
    brand: '',
    imeiNumber: '',
    cost: 0,
    discount: 0,
    availableStock: 0,
    commission: 0,
    minPrice: 0,
    maxPrice: 0,
    warranty: false,
    warrantyPeriod: undefined,
    color: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setProduct((prevProduct: any) => ({
      ...prevProduct,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Product data:', product);
    try {
      const res = await axios.post(
        `${
          productType === 'phone'
            ? `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/create-phone-stock`
            : `${import.meta.env.VITE_SERVER_HEAD}/api/inventory/create-stock`
        }`,
        {
          category: product.category,
          itemName: product.name,
          brand: product.brand,
          IMEI: product.imeiNumber,
          itemModel: product.model,
          availableStock: product.availableStock,
          commission: product.commission,
          discount: product.discount,
          productcost: product.cost,
          maxprice: product.maxPrice,
          minprice: product.minPrice,
          quantity: 10,
          
        },
        { withCredentials: true },
      );
      if (res && res.data && res.data.message === 'product added') {
        console.log(res);
        alert(res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    }
  };

  return (
    <div className="rounded mb-10 border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <form onSubmit={handleSubmit}>
        <div className="px-6.5 py-4 grid sm:grid-cols-4 gap-x-4 items-end">
          {productType === 'phone' ? (
            <MobilePhoneForm product={product} handleChange={handleChange} />
          ) : productType === 'accessories' ? (
            <AccessoriesForm product={product} handleChange={handleChange} />
          ) : (
            <p>Invalid product type</p>
          )}
        </div>
        <div className="px-6.5 py-4 grid sm:grid-cols-4 gap-x-4 items-end">
          <div className="mb-2.5 col-span-3"></div>
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => setToggleAddUser(false)}
              className="mb-2.5 flex w-full justify-center rounded bg-warning p-2 font-medium text-white hover:bg-opacity-90 dark:bg-opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="mb-2.5 flex w-full justify-center rounded bg-primary p-2 font-medium text-white hover:bg-opacity-90 dark:bg-opacity-40"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
