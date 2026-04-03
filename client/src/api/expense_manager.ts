import axios from 'axios';
import { Expense, ExpenseListResponse, ExpenseCreateResponse } from '../types/expense';

const API_BASE = `${import.meta.env.VITE_SERVER_HEAD}/api/expenses`;

export const getExpenses = async (params: {
  page?: number;
  limit?: number;
  shopId?: number;
  period?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
}) => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.shopId) queryParams.append('shopId', params.shopId.toString());
  if (params.period) queryParams.append('period', params.period);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.status) queryParams.append('status', params.status);
  if (params.category) queryParams.append('category', params.category);

  const response = await axios.get<ExpenseListResponse>(
    `${API_BASE}?${queryParams.toString()}`,
    { withCredentials: true }
  );
  return response;
};

export const getExpenseById = async (id: number) => {
  const response = await axios.get(
    `${API_BASE}/${id}`,
    { withCredentials: true }
  );
  return response;
};

export const createExpense = async (data: {
  shopId: number;
  amount: number;
  category: string;
  subcategory?: string;
  description: string;
  paymentMethod: string;
  vendorName?: string;
  vendorContact?: string;
}) => {
  const response = await axios.post<ExpenseCreateResponse>(
    `${API_BASE}/create`,
    data,
    { withCredentials: true }
  );
  return response;
};

export const updateExpense = async (id: number, data: any) => {
  const response = await axios.put(
    `${API_BASE}/${id}`,
    data,
    { withCredentials: true }
  );
  return response;
};

export const approveExpense = async (id: number) => {
  const response = await axios.post(
    `${API_BASE}/${id}/approve`,
    {},
    { withCredentials: true }
  );
  return response;
};

export const rejectExpense = async (id: number, reason: string) => {
  const response = await axios.post(
    `${API_BASE}/${id}/reject`,
    { reason: reason },
    { withCredentials: true }
  );
  return response;
};

export const getExpenseAnalytics = async (groupBy: string, shopId?: number) => {
  const params = new URLSearchParams();
  params.append('groupBy', groupBy);
  if (shopId) params.append('shopId', shopId.toString());

  const response = await axios.get(
    `${API_BASE}/analytics?${params.toString()}`,
    { withCredentials: true }
  );
  return response;
};

export const getBudgetUtilization = async (period?: string) => {
  const params = new URLSearchParams();
  if (period) params.append('period', period);

  const response = await axios.get(
    `${API_BASE}/budget-utilization?${params.toString()}`,
    { withCredentials: true }
  );
  return response;
};
