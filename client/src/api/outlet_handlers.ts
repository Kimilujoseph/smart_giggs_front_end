import axios from "axios"

export const getOutlets = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_HEAD}/api/shop/all`, { withCredentials: true })
        if (res && res.status === 200) {
            console.log(res.data)
            return { data: res.data.data, code: 1, error: false }
        }

    } catch (error) {
        console.error(error)
        return { data: [], code: 3, error: true }
    }
}
