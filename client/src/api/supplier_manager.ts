import axios from "axios";

export const createSupplier = async (supplierData: { name: string; contactName: string; email: string; address: string; }) => {
    try {
        const res = await axios.post(`${import.meta.env.VITE_SERVER_HEAD}/api/supplier/create`, supplierData, { withCredentials: true });
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

export const getAllSuppliers = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/supplier/all`, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data, code: 1, error: false };
        }
    } catch (error) {
        return { data: [], code: 3, error: true };
    }
};

export const getSupplier = async (supplierId: number) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/supplier/get/${supplierId}`, { withCredentials: true });
        if (res && res.status === 200) {
            return { data: res.data.data, code: 1, error: false };
        }
    } catch (error) {
        return { data: null, code: 3, error: true };
    }
};

export const updateSupplier = async (supplierId: number, supplierData: { name: string; contactName: string; email: string; address: string; }) => {
    try {
        const res = await axios.put(`${import.meta.env.VITE_SERVER_HEAD}/api/supplier/update-profile/${supplierId}`, supplierData, { withCredentials: true });
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
