import { ReactNode } from "react";



interface StockItem {
    quantity: number;
    stock: {
      [x: string]: ReactNode;
      brand: string;
      maxprice: string;
      minprice: string;
      id: string;
    };
    id: string;
    itemName: string;
  }
  
export interface Shop {
    [x: string]: any;
    name: string;
    address: string;
    sellers: Array<{ id: string; name: string; status: string; assignmentHistory: { fromDate: string; toDate: string; type: string }[] }>;
    stockItems: Array<{
        quantity: number;
        stock: {
            [x: string]: ReactNode;
            brand: string;
            maxprice: string;
            minprice: string;
            id: string;
        };
        id: string;
        id: string;
    }>;
    phoneItems: StockItem[];
    id: string;
}
