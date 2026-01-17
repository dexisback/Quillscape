
//interceptor and handles reptitive token attachment
import axios from "axios";
import { getAuth } from "firebase/auth";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 15000, // 15 second timeout
})

//making the interceptor:
api.interceptors.request.use(async (config) => {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (user) {
        try {
            const token = await user.getIdToken();
            config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
            console.error("Error getting auth token:", error);
        }
    }
    return config; 
}, (error) => {
    return Promise.reject(error);
})

// Response interceptor for better error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout');
        } else if (!error.response) {
            console.error('Network error - server may be down');
        }
        return Promise.reject(error);
    }
)

export default api