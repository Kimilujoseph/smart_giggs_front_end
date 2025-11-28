import axios from 'axios';

interface KpiParams {
  sellerId: string;
  filters: Record<string, string>;
}

export const getSellerKpis = async ({ sellerId, filters }: KpiParams) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const url = `${
      import.meta.env.VITE_SERVER_HEAD
    }/api/kpi/seller-performance?sellerId=${sellerId}&${queryParams}`;

    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch seller KPIs');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching seller KPIs:', error);
    throw error;
  }
};

interface AchievementKpiParams {
  sellerId: string;
  period: string;
}

export const getSellerAchievement = async ({
  sellerId,
  period,
}: AchievementKpiParams) => {
  try {
    const url = `${
      import.meta.env.VITE_SERVER_HEAD
    }/api/kpi/achievement?sellerId=${sellerId}&period=${period}`;

    const response = await axios.get(url, {
      withCredentials: true,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });

    if (response.status !== 200) {
      throw new Error('Failed to fetch seller KPI achievement');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching seller KPI achievement:', error);
    throw error;
  }
};
