import axios from "axios";

export const createFinancer = async (financerData: { name: string; contactName: string; phone: string; email: string; address: string; }) => {
    try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/financer/create`, financerData, { withCredentials: true });
        if (res && res.status === 201) {
            return { data: res.data, code: 1, error: false };
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return { data: error.response.data, code: 3, error: true };
        }
        return { data: [], code: 3, error: true };
    }
};

export const getAllFinancers = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/financer/all`, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data.data, code: 1, error: false };
        }
    } catch (error) {
        return { data: [], code: 3, error: true };
    }
};

export const getFinancer = async (financerId: number) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/financer/get/${financerId}`, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data.data, code: 1, error: false };
        }
    } catch (error) {
        return { data: null, code: 3, error: true };
    }
};

export const updateFinancer = async (financerId: number, financerData: { name: string; contactName: string; phone: string; email: string; address: string; }) => {
    try {
        const res = await axios.put(`${import.meta.env.VITE_SERVER_HEAD}/api/financer/financer/${financerId}`, financerData, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data, code: 1, error: false };
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return { data: error.response.data, code: 3, error: true };
        }
        return { data: [], code: 3, error: true };
    }
};

export const getFinancerSalesReport = async (financerId: number) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/sales/report/financer/${financerId}`, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data.data, code: 1, error: false };
        }
    } catch (error) {
        return { data: null, code: 3, error: true };
    }
};
