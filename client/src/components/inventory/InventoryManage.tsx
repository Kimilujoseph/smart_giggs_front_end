import Breadcrumb from '../Breadcrumbs/Breadcrumb';
import { useState } from 'react';
import AddProductForm from './AddProductForm';
import ProductsTable from './Products';

const InventoryManager = () => {
  const [toggleAddProduct, setToggleAddProduct] = useState<boolean>(false);

  const [productType, setProductType] = useState<string>('');

  const fetchProducts = () => {};

  return (
    <>
      <Breadcrumb pageName="Inventory Manage" />

      {toggleAddProduct && (
        <AddProductForm
          setToggleAddProduct={setToggleAddProduct}
          productType={productType}
        />
      )}

      {/* user table */}
      {!toggleAddProduct && <ProductsTable getFreshUserData={fetchProducts} />}
    </>
  );
};

export default InventoryManager;
