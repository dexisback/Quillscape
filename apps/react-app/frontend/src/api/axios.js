import axios from "axios"
import { getAuth } from "firebase/auth"

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 60000,
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
    async (error) => {
        const config = error.config
        if (error.code === 'ECONNABORTED' && !config._retry) {
            config._retry = true
            config.timeout = 90000
            return api(config)
        }
        return Promise.reject(error)
    }
)

export default api