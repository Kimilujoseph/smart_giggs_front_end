import { Package } from '../../types/package';
import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useEffect, useState } from 'react';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import HeadphonesBatteryIcon from '@mui/icons-material/HeadphonesBattery';
import { getUsers } from '../../api/user_manager';
import AddProductForm from './AddProductForm';
import ProductsTable from './Products';
import { useAppContext } from '../../context/AppContext';

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
    } catch (error) {
      
    }
  };

  useEffect(() => {
    fetchUsers();
    
  }, []);

  useEffect(()=>{
    console.log(user)
  },[user])



  return (
    <>
      <Breadcrumb pageName="Inventory Manage" />
      <div className={`${user &&  user.role == "seller" ? "hidden":""} flex items-center justify-between`}>
        {!toggleAddProduct && (
          <div className="flex justify-between md:gap-6 items-center w-full md:w-auto">
            <div
              className="inline-flex items-center justify-center gap-2 cursor-pointer rounded-full border border-primary md:px-10 p-2 px-4 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10 mb-4"
              onClick={() => {
                setProductType('Mobiles');
                setToggleAddProduct((prev) => !prev);
              }}
            >
              <InstallMobileIcon className="text-primary" />
              <span className='text-xs'>Add Mobile Phone</span>
            </div>
            <div
              className="inline-flex items-center justify-center gap-2 cursor-pointer rounded-full border border-primary md:px-10 p-2 px-4 text-center font-medium text-primary hover:bg-opacity-90 lg:px-8 xl:px-10 mb-4"
              onClick={() => {
                setProductType('Accessories');
                setToggleAddProduct((prev) => !prev);
              }}
            >
              <HeadphonesBatteryIcon
                fontSize="medium"
                className="text-primary w-auto"
              />
              <span className='text-xs'>Add Accessories</span>
            </div>
          </div>
        )}
      </div>

      {toggleAddProduct && (
        <AddProductForm
          setToggleAddProduct={setToggleAddProduct}
          productType={productType}
        />
      )}

      {/* user table */}
      {!toggleAddProduct && <ProductsTable  getFreshUserData={fetchUsers} />}
    </>
  );
};

export default InventoryManager;
