import { ConsolidatedData } from "../types/ConsolidatedData";

// Helper function to transform the original data to our consolidated structure
export function transformDataForPOS(originalData: any): ConsolidatedData {
	const shop = originalData.shop.filteredShop;
  
	return {
	  shopInfo: {
		id: shop._id,
		name: shop.name,
		address: shop.address,
		seller:
		  shop.sellers.length > 0
			? {
				name: shop.sellers[0].name,
				phone: shop.sellers[0].phone,
				status: shop.sellers[0].status,
			  }
			: null,
	  },
	  products: {
		mobiles: shop.phoneItems.map((item: any) => ({
		  productId: item.categoryId.id,
		  id: item.stock.id,
		  name: item.categoryId.itemName,
		  model: item.categoryId.itemModel,
		  brand: item.categoryId.brand,
		  quantity: item.quantity,
		  priceRange: {
			min: item.categoryId.minPrice,
			max: item.categoryId.maxPrice,
		  },
		  currentPrice: Number(item.stock.productcost),
		  discount: Number(item.stock.discount) || 0,
		  IMEI: item.stock.IMEI,
		  cost: Number(item.stock.productcost),
		  status: item.stock.stockStatus,
		  type: item.categoryId.itemType,
		  transferId: item.transferId,
		})),
		accessories: shop.stockItems.map((item: any) => ({
		  productId: item.categoryId.id,
		  id: item.stock.id,
		  name: item.categoryId.itemName,
		  model: item.categoryId.itemModel,
		  brand: item.categoryId.brand,
		  quantity: item.quantity,
		  priceRange: {
			min: item.categoryId.minPrice,
			max: item.categoryId.maxPrice,
		  },
		  currentPrice: item.stock.productCost,
		  discount: item.stock.discount || 0,
		  batchNumber: item.stock.batchNumber,
		  cost: item.stock.productCost,
		  status: item.stock.stockStatus,
		  type: item.categoryId.itemType,
		  transferId: item.transferId,
		})),
	  },
	  lowStockItems: shop.lowStockItems.map((item: any) => ({
		id: item.stock.id,
		name: item.categoryId.itemName,
		model: item.categoryId.itemModel,
		brand: item.categoryId.brand,
		quantity: item.quantity,
		priceRange: {
		  min: item.categoryId.minPrice,
		  max: item.categoryId.maxPrice,
		},
		currentPrice: item.stock.productcost,
		discount: item.stock.discount || 0,
		batchNumber: item.stock.batchNumber,
		cost: item.stock.productcost,
		status: item.stock.stockStatus,
		type: item.categoryId.itemType,
		transferId: item.transferId,
	  })),
	};
  }
  