import axios from 'axios';

const API_URL = `${import.meta.env.VITE_SERVER_HEAD}/api/category`;

export const getCategories = async () => {
  try {
    const response = await axios.get(`${API_URL}/all`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (categoryData: any) => {
  try {
    const response = await axios.post(`${API_URL}/create-category`, categoryData, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const updateCategory = async (categoryId: number, categoryData: any) => {
  try {
    const response = await axios.put(`${API_URL}/update/${categoryId}`, categoryData, {
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (categoryId: number) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${categoryId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
