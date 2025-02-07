import { Key, ReactNode } from "react";

// export type Product = {
//   [x: string]: any;
//   id: Key | null | undefined;
//   itemName: ReactNode;
//   productcost?: ReactNode;
//   minprice: ReactNode;
//   maxprice: ReactNode;
//   category: string;
//   price?: number;
//   name: string;
//   brand: string;
//   model: string;
//   IMEI?: string;
//   imeiNumber?: string;
//   itemModel: string;
//   availableStock?: number;
//   commission: number;
//   discount: number;
//   productCost: number;
//   cost: number;
//   maxPrice: number;
//   warranty: boolean;
//   warrantyPeriod: string;
//   minPrice: number;
//   color?: string;
//   quantity?: number;
//   isMobile?: false
// };

export type Product = {
  id: string | null | undefined;
  itemName: string;
  itemModel: string;
  brand: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  itemType: string;
  Items: Array<any>;
  sales: Array<any>;
  createdAt: string;
  updatedAt: string;
  isMobile: boolean;
  availableStock: number;
};