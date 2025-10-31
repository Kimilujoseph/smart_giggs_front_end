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
  filters?: { [key: string]: any };
}

export const getSalesReport = async (params: SalesReportParams) => {
  const { reportType, id, filters, ...queryParams } = params;
  let url = `${import.meta.env.VITE_SERVER_HEAD}/api/sales/report`;

  if (reportType && reportType !== 'all' && id) {
    url += `/${reportType}/${id}`;
  }

  const response = await axios.get(url, {
    params: { ...queryParams, ...filters },
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
