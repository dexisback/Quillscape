//customised version of axios, handles the repetitive plumbing of Authorization header baar baar addkrna
//it knows you are talking to localhost:3000/blogs. so you just have to type /me , or /post 

//interceptor: every time you send a request , it intercepts the request before it is sent to the web, and usme firebase token add krdeti hai ye file

import axios from "axios";
import { getAuth } from "firebase/auth";
const api = axios.create({baseURL: "http://localhost:3000/blogs"})

//making the interceptor:
api.interceptors.request.use(async (config) =>{
const auth=getAuth();

            const user=auth.currentUser;
    if(user){
            
    const token=await user.getIdToken();
    //attaching token to the header of the request
    config.headers.Authorization= `Bearer ${token}`;
    }
    return config; 
})


export default api