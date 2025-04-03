import { Product } from "./Product";

export type ConsolidatedData = {
	shopInfo: {
	  id: string;
	  name: string;
	  address: string;
	  seller: {
		name: string;
		phone: string;
		status: string;
	  } | null;
	};
	products: {
	  mobiles: Product[];
	  accessories: Product[];
	};
	lowStockItems: Product[];
  };