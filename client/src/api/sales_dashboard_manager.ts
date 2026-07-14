import axios from 'axios';

export interface SalesReportParams {
  page?: number;
  limit?: number;
  period?: 'day' | 'week' | 'month' | 'year';
  date?: string;
  startDate?: string;
  endDate?: string;
  reportType?: 'all' | 'user' | 'financer' | 'category' | 'shop';
  id?: string;
  userId?: string | number;
  shopId?: string | number;
  categoryId?: string | number;
  financerId?: string | number;
  model?: 'mobiles' | 'accessories';
  filters?: { [key: string]: any };
}

export const getSalesReport = async (params: SalesReportParams) => {
  const { reportType, id, filters, ...queryParams } = params;
  const url = `${import.meta.env.VITE_SERVER_HEAD}/api/sales/report`;

  const query: any = { ...queryParams, ...filters };
  if (reportType && reportType !== 'all' && id) {
    if (reportType === 'user') query.userId = id;
    else if (reportType === 'shop') query.shopId = id;
    else if (reportType === 'category') query.categoryId = id;
    else if (reportType === 'financer') query.financerId = id;
  }

  const response = await axios.get(url, {
    params: query,
    withCredentials: true,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch sales report');
  }
  return response.data;
};

export const getSalesSummary = async (params: SalesReportParams) => {
  const { reportType, id, filters, ...queryParams } = params;
  const url = `${import.meta.env.VITE_SERVER_HEAD}/api/sales/report/summary`;

  const query: any = { ...queryParams, ...filters };
  if (reportType && reportType !== 'all' && id) {
    if (reportType === 'user') query.userId = id;
    else if (reportType === 'shop') query.shopId = id;
    else if (reportType === 'category') query.categoryId = id;
    else if (reportType === 'financer') query.financerId = id;
  }

  // Summary endpoint doesn't need pagination parameters
  delete query.page;
  delete query.limit;

  const response = await axios.get(url, {
    params: query,
    withCredentials: true,
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });

  if (response.status !== 200) {
    throw new Error('Failed to fetch sales summary');
  }
  return response.data;
};

export const getSalesReportByFinancer = async (
  financerId: string,
  params: SalesReportParams,
) => {
  const response = await axios.get(
    `${import.meta.env.VITE_SERVER_HEAD}/api/sales/report/financer/${financerId}`,
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
  const response = await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/commissions/pay`, commissionData, {
    withCredentials: true,
  });
  if (response.status !== 201) {
    throw new Error('Failed to pay commission');
  }
  return response.data;
};
