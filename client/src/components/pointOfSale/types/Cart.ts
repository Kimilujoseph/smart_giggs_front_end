export interface CartItem {
  quantity: number;
  status: string;
  productStatus: string;
  transferId: number;
  createdAt: Date;
  updatedAt: Date;
  soldunits: number;
  stock: {
    id: number | number;
    stockStatus: 'distributed' | 'available' | 'sold';
    discount: number;
    IMEI: string;
    productcost: number;
  };
  category: {
    id: number | string;
    itemName: string;
    itemModel: string;
    brand: string;
    minPrice: number;
    maxPrice: number;
    itemType: 'mobiles' | 'accessories';
  };
}
