import { Package } from '../../types/package';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import { getUsers } from '../../api/user_manager';
import AddProductForm from './AddProductForm';
import ProductsTable from './Products';
import { useAppContext } from '../../context/AppContext';
import { Button } from '@mui/material';

const InventoryManager = () => {
  const [toggleAddProduct, setToggleAddProduct] = useState<boolean>(false);
  const { user } = useAppContext();

  const [packageData, setPackageData] = useState<Package[]>([]);

  const [productType, setProductType] = useState<string>('');

  const fetchUsers = async () => {
    try {
      const user_res = await getUsers();
      if (user_res?.data) {
        setPackageData(user_res?.data);
      }
    } catch (error) { }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => { }, [user]);

  return (
    <>
      <Breadcrumb pageName="Inventory Manage" />
      {/* <div
        className={`${
          user && user.role == 'seller' ? 'hidden' : ''
        } flex items-center justify-between`}
      >
        {!toggleAddProduct && (
          <div className="flex justify-between md:gap-6 items-center w-full md:w-auto">
            <Button variant="contained" onClick={() => setToggleAddProduct(true)} sx={{ mb: 2 }}>
              Add Product
            </Button>
          </div>
        )}
      </div> */}

      {toggleAddProduct && (
        <AddProductForm
          setToggleAddProduct={setToggleAddProduct}
          productType={productType}
        />
      )}

      {/* user table */}
      {!toggleAddProduct && <ProductsTable getFreshUserData={fetchUsers} />}
    </>
  );
};

export default InventoryManager;
