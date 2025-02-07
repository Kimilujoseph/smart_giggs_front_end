import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import axios from 'axios';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { getUsers } from '../api/user_manager';
import AddShoppingCartOutlinedIcon from '@mui/icons-material/AddShoppingCartOutlined';
import Modal from '../components/outlets/Modal';
import { Shop } from '../types/shop';
import Loader from '../common/Loader';

interface Notification {
  type: string;
  message: string;
}
const OutletView2: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [activeSection, setActiveSection] = useState<string>('Sales');
  const [assignToShop, setAssignToShop] = useState<boolean>(false);
  const [sellerName, setSellerName] = useState<string>('');
  const [dates, setDates] = useState({
    fromDate: '',
    toDate: '',
  });

  const [users, setUsers] = useState<{ name: string }[]>([]);
  const [showNewStock, setShowNewStock] = useState<boolean>(false);
  const [newStockTally, setNewStockTally] = useState<number>(0);

  const [notification, setNotification] = useState<Notification>({
    type: '',
    message: '',
  });
  const [outletFormData, setOutletFormData] = useState({
    name: '',
    address: '',
    id: '',
  });
  const sections = [
    { name: 'Sales', key: 'Sales' },

    { name: 'Phones', key: 'Phones' },
    { name: 'Accessories', key: 'Accessories' },
    // { name: 'Stock', key: 'Stock' },
    { name: 'Outlet Sellers', key: 'Sellers' },
    { name: 'Outlet Settings', key: 'Outlet Settings' },
  ];
  const handleDateChange = (e: any) => {
    const { name, value } = e.target;
    setDates((prevDates) => ({
      ...prevDates,
      [name]: value,
    }));
  };

  const fetchUsers = async () => {
    try {
      const user_res = await getUsers();
      if (user_res?.data) {
        setUsers(user_res?.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    console.log(shop);
  }, [shop]);
  const fetchShop = async () => {
    try {
      if (!name) {
        alert("Name not defined");
      }
      const response = await axios.get(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/${name}`,
        {
          withCredentials: true,
        },
      );

      if (response.data) {
        let outlet = { ...response.data.shop };

        setShop(response.data.shop);

        const { newPhoneItem, newAccessory } = response.data.shop;

        const phoneItems = Array.isArray(newPhoneItem) ? newPhoneItem : [];
        const accessoryItems = Array.isArray(newAccessory) ? newAccessory : [];

        // Count the items with status "pending"
        const pendingPhoneItemsCount = phoneItems.filter(
          (item) => item.status === 'pending',
        ).length;
        const pendingAccessoryItemsCount = accessoryItems.filter(
          (item) => item.status === 'pending',
        ).length;

        // Update the state with the total count of pending items
        setNewStockTally(pendingPhoneItemsCount + pendingAccessoryItemsCount);

        setOutletFormData({
          name: outlet.name,
          address: outlet.address,
          id: outlet.id,
        });
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setNotification({
        type: '',
        message: '',
      });
    }, 2000);
  }, [notification]);
  useEffect(() => {
    fetchShop();
  }, [name]);

  const handleSubmit2 = async ({ shop }) => {
    console.log('Assigning:', sellerName, dates);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/assignment/add`,
        {
          name: sellerName,
          fromDate: dates.fromDate,
          toDate: dates.toDate,
          shopname: shop.shopName,
        },
        {
          withCredentials: true,
        },
      );
      if (res && res.data && res.data.error === false) {
        alert(`Action completed`);
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit3 = async ({ shop, seller }: any) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/assignment/remove`,
        {
          name: seller.name,
          shopname: shop.shopName,
        },
        {
          withCredentials: true,
        },
      );
      if (res && res.data && res.data.error === false) {
        setNotification({
          type: 'success',
          message: res.data.message,
        });
        alert(`Action completed`);
      }
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };
  const handleInputChange2 = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSellerName(event.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOutletFormData({ ...outletFormData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_SERVER_HEAD}/api/shop/update/${
          outletFormData.id
        }`,
        outletFormData,
        { withCredentials: true },
      );

      if (response.status === 200) {
        alert('Shop updated successfully!');
        let outletUpdated = { ...response.data.shop };
        setOutletFormData({
          name: outletUpdated.name,
          address: outletUpdated.address,
          id: outletUpdated.id,
        });
      } else {
        alert(`Error: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating shop:', error);
      alert('Internal Server Error');
    }
  };

  if (!shop) {
    return <Loader />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'Sales':
        return (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="max-w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Sales Data
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-1.5 px-4">
                      <p className="text-black dark:text-white text-md">
                        Data goes here
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Accessories':
        return (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="max-w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      sNo
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Name
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Model
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Quantity
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Min/Max Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shop.stockItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#eee] dark:border-strokedark"
                    >
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {index + 1}
                        </p>
                      </td>

                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.stock.itemName}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.stock.itemModel}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.quantity}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          <span className="text-danger">
                            {item.stock.minprice}
                          </span>{' '}
                          -{' '}
                          <span className="text-primary">
                            {item.stock.maxprice}
                          </span>
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Phones':
        return (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="max-w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      sNo
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Name
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Model
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Quantity
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Min/Max Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shop.phoneItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#eee] dark:border-strokedark"
                    >
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {index + 1}
                        </p>
                      </td>

                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.stock.itemName}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.stock.itemModel}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.quantity}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          <span className="text-danger">
                            {item.stock.minprice}
                          </span>{' '}
                          -{' '}
                          <span className="text-primary">
                            {item.stock.maxprice}
                          </span>
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Stock':
        return (
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="max-w-full">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      sNo
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Name
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Model
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Quantity
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Min/Max Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {shop.phoneItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#eee] dark:border-strokedark"
                    >
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {index + 1}
                        </p>
                      </td>

                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.stock.itemName}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.stock.itemModel}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          {item.quantity}
                        </p>
                      </td>
                      <td className="py-1.5 px-4">
                        <p className="text-black dark:text-white font-medium tracking-wide text-sm">
                          <span className="text-danger">
                            {item.stock.minprice}
                          </span>{' '}
                          -{' '}
                          <span className="text-primary">
                            {item.stock.maxprice}
                          </span>
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Sellers':
        return (
          <div className="">
            <div className="flex items-center py-2">
              {!assignToShop ? (
                <Link
                  to="#"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-primary py-2 px-10 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10 mb-4"
                  onClick={() => {
                    fetchUsers();
                    setAssignToShop(true);
                  }}
                >
                  <span>{/* SVG icon */}</span>
                  Assign Seller to Shop
                </Link>
              ) : (
                <div className="grid grid-cols-4 gap-x-4 ">
                  <div className="">
                    <p className="font-bold text-md text-secondary mb-4">
                      Assign Seller to Shop
                    </p>
                  </div>
                  <div className="col-span-4 gap-2 grid items-end sm:grid-cols-3">
                    <div className="col-span-1">
                      <label htmlFor="sellerName">Select seller</label>
                      <select
                        id="sellerName"
                        name="sellerName"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        value={sellerName}
                        onChange={handleInputChange2}
                      >
                        <option value="">Select a user</option>
                        {users &&
                          users.map((user, index) => (
                            <option value={user.name} key={index}>
                              {user.name}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <label className=" block text-black dark:text-white">
                        From
                      </label>
                      <input
                        type="date"
                        name="fromDate"
                        placeholder=""
                        value={dates.fromDate}
                        onChange={handleDateChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1.5 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className=" block text-black dark:text-white">
                        To
                      </label>
                      <input
                        type="date"
                        name="toDate"
                        placeholder=""
                        value={dates.toDate}
                        onChange={handleDateChange}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1.5 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="col-span-4 gap-x-2 mt-10 flex items-center justify-end">
                    <p
                      className="inline-flex items-center justify-center gap-2.5 rounded-full border border-danger py-2 px-10 text-center font-medium text-danger hover:bg-opacity-90 lg:px-8 xl:px-10"
                      onClick={() => setAssignToShop(false)}
                    >
                      Cancel
                    </p>
                    <button
                      className="inline-flex items-center justify-center gap-2.5 rounded-full border border-secondary py-2 px-10 text-center font-medium text-secondary hover:bg-opacity-90 lg:px-8 xl:px-10"
                      onClick={() => {
                        handleSubmit2({ shop });
                        setAssignToShop(false);
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div
              className={`${
                assignToShop && 'hidden'
              } rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark`}
            >
              <div className="max-w-full">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="py-4 px-4 font-medium text-black dark:text-white">
                        Seller ID
                      </th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">
                        Seller Name
                      </th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shop.sellers.map((seller, index) => (
                      <tr
                        key={seller.id}
                        className="border-b border-[#eee] dark:border-strokedark"
                      >
                        <td className="py-1.5 px-4">
                          <p className="text-black dark:text-white text-md">
                            {index + 1}
                          </p>
                        </td>
                        <td className="py-1.5 px-4">
                          <p className="text-black dark:text-white text-md">
                            {seller.name}
                          </p>
                        </td>

                        <td className="py-1.5 px-4">
                          <p className="">
                            <Link
                              to="#"
                              className="inline-flex items-center justify-center gap-2.5 rounded-full border border-danger py-1 px-5 text-center font-medium text-danger hover:bg-opacity-90"
                              onClick={() => {
                                handleSubmit3({ shop, seller });
                              }}
                            >
                              Unassign
                            </Link>
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'Outlet Settings':
        return (
          <div className="">
            <form onSubmit={handleSubmit} className="flex justify-start">
              <div className="px-6.5 py-2 grid sm:grid-cols-2 gap-x-4 items-end">
                <div className="max-sm:col-span-2 col-span-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Shop Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter shop name"
                    value={outletFormData.name}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1.5 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="max-sm:col-span-2 col-span-1">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Shop Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter shop address"
                    value={outletFormData.address}
                    onChange={handleInputChange}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-1.5 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div className="col-span-2 flex items-end pt-6 justify-end gap-1 ">
                  <button
                    type="submit"
                    className="flex justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="mx-auto dark:text-white relative">
        {notification.message != '' && (
          <div className="flex items-center p-2">
            <p>cancel</p>
            <p>Continue</p>
          </div>
        )}

        <Breadcrumb pageName={`Outlet: ${shop.shopName}`} />

        {/* MODAL HERE */}

        {showNewStock && (
          <div>
          <Modal
            message=""
            shopData={shop}
            onClose={() => {
              setShowNewStock(false);
            }}
            refreshShopData={() => {
              fetchShop();
            }}
          />
          </div>
        )}

        {/* MODAL END */}
        <div className="flex items-center justify-between w-full py-2 sm:py-4">
          <p
            onClick={() => {
              navigate(-1);
            }}
            className="text-md my-4 font-bold dark:text-primary cursor-pointer"
          >
            <KeyboardBackspaceIcon fontSize="medium" className="text-primary" />{' '}
            Back
          </p>

          <div className="flex items-center">
            <div
              className="flex items-center gap-x-1 cursor-pointer"
              onClick={() => {
                setShowNewStock(true);
              }}
            >
              <AddShoppingCartOutlinedIcon
                fontSize="medium"
                className="text-primary animate-bounce"
              />
              <div className="flex flex-col">
                <p className=" font-bold  tracking-wide">
                  <span className="text-md dark:text-gray">
                    {newStockTally}
                  </span>
                </p>
                <p className="text-sm font-bold dark:text-warning tracking-wide">
                  incoming stock
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-12 items-start gap-4">
          {/* Left Navigation */}
          <div className="sm:col-span-3 flex flex-col bg-gray-200 dark:bg-meta-4 p-4 rounded-sm shadow-default">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`py-2 px-4 text-left font-bold ${
                  activeSection === section.key
                    ? 'text-primary'
                    : 'text-black dark:text-white'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="sm:col-span-9">{renderContent()}</div>
        </div>
      </div>
    </>
  );
};

export default OutletView2;
