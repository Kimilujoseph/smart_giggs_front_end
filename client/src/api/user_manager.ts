import axios from "axios"

export const getAllUsers = async (signal: AbortSignal) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/user/all`, { withCredentials: true, signal })
        if (res && res.status === 200) {
            return { data: res.data.data, code: 1, error: false }
        }

    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
            return { data: [], code: 2, error: true, cancelled: true };
        }
        return { data: [], code: 3, error: true }
    }
}


export const getUserProfile = async ({ email }: { email: string }) => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/user/profile/${email}`, { withCredentials: true })
        if (res && res.status === 200) {
            
            return { data: res.data, code: 1, error: false }
        }

    } catch (error) {
        if (axios.isCancel(error)) {
            console.log('Request canceled', error.message);
            return { data: [], code: 2, error: true, cancelled: true };
        }
        return { data: [], code: 3, error: true }
    }
}
