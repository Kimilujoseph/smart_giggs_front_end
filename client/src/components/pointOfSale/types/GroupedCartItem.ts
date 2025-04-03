import { CartItem } from "./Cart";

export type GroupedCartItem = {
  categoryId: {
	id: string | number;
	itemName: string;
	itemType: string;
	brand: string;
	itemModel: string;
	minPrice: number;
	maxPrice: number;
  };
  items: CartItem[];
  quantity: number;
};