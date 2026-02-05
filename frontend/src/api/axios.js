import axios from "axios"
import { getAuth } from "firebase/auth"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 15000,
})

api.interceptors.request.use(async (config) => {
    const auth = getAuth()
    const user = auth.currentUser

    if (user) {
        try {
            const token = await user.getIdToken()
            config.headers.Authorization = `Bearer ${token}`
        } catch (error) {
        }
    }
    return config
}, (error) => {
    return Promise.reject(error)
})

api.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(error)
)

export default api