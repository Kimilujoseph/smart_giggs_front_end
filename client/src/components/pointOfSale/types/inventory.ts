export interface Product {
  quantity?: number;
  status: string;
  productStatus: string;
  transferId: number;
  createdAt: Date;
  updatedAt: Date;
  stock: {
    id: number;
    stockStatus: 'distributed' | 'available' | 'sold';
    discount: number;
    IMEI?: string;
    productcost: number;
    batchNumber?: string;
  };
  categoryId: {
    id: number;
    itemName: string;
    itemModel: string;
    brand: string;
    minPrice: number;
    maxPrice: number;
    itemType: 'mobiles' | 'accessories';
  };
}


export interface NewAccessory extends Product {}

export interface NewPhoneItem extends Product {}

export interface Inventory {
  newAccessoryItems: NewAccessory[];
  newPhoneItems: NewPhoneItem[];
  stockItems: Product[];
  phoneItems: Product[];
}
