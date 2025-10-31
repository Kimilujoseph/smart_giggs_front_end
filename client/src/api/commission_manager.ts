import axios from "axios";

export const getCommissions = async (params: string, page: number, limit: number) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/commissions/?${params}&page=${page}&limit=${limit}`, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data.data, code: 1, error: false };
        }
    } catch (error) {
        return { data: null, code: 3, error: true };
    }
};

export const voidCommission = async (commissionId: number) => {
    try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/commissions/pay/${commissionId}/void`, {}, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data, code: 1, error: false };
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return { data: error.response.data, code: 3, error: true };
        }
        return { data: null, code: 3, error: true };
    }
};
