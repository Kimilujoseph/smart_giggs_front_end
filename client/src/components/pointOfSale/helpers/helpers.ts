
import { Sale } from './types/types';

const API_URL = 'http://localhost:3000/api';

export const fetchProducts = async (shopName: string) => {
    const response = await fetch(`${API_URL}/products/shop/${shopName}`);
    if (!response.ok) {
        throw new Error('Failed to fetch products');
    }
    return response.json();
};

export const fetchFinancers = async () => {
    const response = await fetch(`${API_URL}/financer/all`);
    if (!response.ok) {
        throw new Error('Failed to fetch financers');
    }
    return response.json();
};

export const createSale = async (sale: Sale) => {
    const response = await fetch(`${API_URL}/sales/items/sale`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(sale),
    });
    if (!response.ok) {
        throw new Error('Failed to create sale');
    }
    return response.json();
};
