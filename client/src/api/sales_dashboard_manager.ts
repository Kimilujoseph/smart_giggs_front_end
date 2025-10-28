import axios from 'axios';
import { API_URL } from '../constants';

export interface SalesReportParams {
  period?: 'day' | 'week' | 'month' | 'year';
  date?: string;
  startDate?: string; // YYYY-MM-DD
  financer?: string;
  shop?: string;
  category?: string;
  paymentStatus?: 'paid' | 'pending';
  returnStatus?: 'returned' | 'partially returned';
  productName?: string;
  sellerName?: string;
  shopName?: string;
  imeiOrBatch?: string;
  page?: number;
  limit?: number;
}

export const getSalesReport = async (params: SalesReportParams) => {
  const response = await axios.get(`${API_URL}/sales/report`, {
    params,
    withCredentials: true,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });
  console.log('salesdata received @@@@@', response);
  if (response.status !== 200) {
    throw new Error('Failed to fetch sales report');
  }
  return response.data;
};

export const getSalesReportByFinancer = async (
  financerId: string,
  params: SalesReportParams,
) => {
  const response = await axios.get(
    `${API_URL}/sales/report/financer/${financerId}`,
    {
      params,
      withCredentials: true,
    },
  );
  if (response.status !== 200) {
    throw new Error('Failed to fetch sales report by financer');
  }
  return response.data;
};

export const payCommission = async (commissionData: any) => {
  const response = await axios.post(`${API_URL}/commissions/pay`, commissionData, {
    withCredentials: true,
  });
  if (response.status !== 201) {
    throw new Error('Failed to pay commission');
  }
  return response.data;
};
