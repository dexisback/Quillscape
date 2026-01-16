
//interceptor and handles reptitive token attachment
import axios from "axios";
import { getAuth } from "firebase/auth";
const api = axios.create({baseURL: import.meta.env.VITE_API_BASE_URL})



//making the interceptor:
api.interceptors.request.use(async (config) =>{
const auth=getAuth();

            const user=auth.currentUser;
    if(user){
            
    const token=await user.getIdToken();
    //here
    config.headers.Authorization= `Bearer ${token}`;
    }
    return config; 
})


export default api