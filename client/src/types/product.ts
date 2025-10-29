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
  id: number;
  itemName: string;
  itemModel: string;
  minPrice: number;
  maxPrice: number;
  brand: string;
  category: string;
  availableStock: number;
  status: 'DELETED' | 'AVAILABLE' | 'SUSPENDED' | 'MODIFIED';
  isMobile?: boolean;
  itemType?: string;
  Items?: any[];
};
