import axios from "axios";

export const getSalaries = async (page: number, limit: number) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/salaries/?page=${page}&limit=${limit}`, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data.data, code: 1, error: false };
        }
    } catch (error) {
        return { data: null, code: 3, error: true };
    }
};

export const paySalary = async (salaryData: { employeeId: number; amount: number; paymentDate: string; payPeriodMonth: number; payPeriodYear: number; }) => {
    try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/salaries/pay`, salaryData, { withCredentials: true });
        if (res && res.status === 201) {
            return { data: res.data, code: 1, error: false };
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return { data: error.response.data, code: 3, error: true };
        }
        return { data: null, code: 3, error: true };
    }
};

export const voidSalary = async (salaryId: number) => {
    try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/salaries/pay/${salaryId}/void`, {}, { withCredentials: true });
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
