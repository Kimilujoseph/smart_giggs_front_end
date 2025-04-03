export type Product = {
  productId?: number;
  id: number;
  name: string;
  model: string;
  brand: string;
  quantity: number;
  priceRange: {
    min: number;
    max: number;
  };
  currentPrice: number;
  discount: number;
  IMEI?: string;
  batchNumber?: string;
  cost: number;
  status: string;
  type: string;
  transferId: number;
};
