 import axios from "axios";
 import { getAuth } from "firebase/auth";

 const api = axios.create({
    baseURL: "http://localhost:3000/blogs"
 })


 api.interceptors.request.use(async(config)=>{
    const auth= getAuth();
    const user= auth.currentUser;
    
 if(user){
    const token= await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
 }
 
return config;
 }, (error)=>{
    return Promise.reject(error);
    console.log(error);
 })


 export default api;
 



 