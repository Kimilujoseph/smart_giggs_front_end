
export interface Product {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imei?: string;
    itemType: 'accessories' | 'mobiles';
    categoryId: string;
    productId: string;
    itemId: string;
}

export interface Financer {
    id: string;
    name: string;
}

export interface CartItem extends Product {
    soldPrice: number;
    soldUnits: number;
    financeAmount: number;
    financeStatus: 'paid' | 'pending';
    financerId?: string;
}

export interface CustomerDetails {
    name: string;
    email: string;
    phonenumber: string;
}

export interface Sale {
    customerdetails: CustomerDetails;
    shopName: string;
    bulksales: {
        CategoryId: string;
        itemType: 'accessories' | 'mobiles';
        items: {
            productId: string;
            soldprice: number;
            soldUnits: number;
            itemId: string;
            financeAmount: string;
            financeStatus: 'paid' | 'pending';
            financeId: number;
        }[];
        paymentmethod: string;
        transactionId: string;
    }[];
}

export interface SaleResponse {
    id: number;
    productID: number;
    shopID: number;
    sellerId: number;
    soldPrice: string;
    status: string;
    profit: number;
    createdAt: string;
    commisssionStatus: string | null;
    quantity: number;
    commission: number;
    categoryId: number;
    financeStatus: string;
    financeAmount: number;
    customerId: number;
    financerId: number;
    paymentId: number;
    commissionPaid: number;
    sellerName: string;
    customerName: string;
    customerphoneNumber: string;
    shopName: string;
    batchIMEI: string;
    productName: string;
    productModel: string;
    brand: string;
}
