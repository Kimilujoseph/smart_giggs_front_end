import axios from 'axios';

const API_URL = `${import.meta.env.VITE_SERVER_HEAD}/api/sales`;

export const getCategorySalesReport = async (categoryId: string, page: number = 1, limit: number = 10) => {
  try {
    const response = await axios.get(`${API_URL}/report/category/${categoryId}?page=${page}&limit=${limit}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching category sales report:', error);
    throw error;
  }
};
