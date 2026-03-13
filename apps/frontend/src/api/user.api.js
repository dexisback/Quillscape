import api from "./axios";

export const syncUserWithMongoDB = (userData)=>{
    //userdata contains firebaseuid, and email
    return api.post("/blogs/users/sync", userData)
}


export const getUserProfile = () =>{
    return api.get("/blogs/users/profile");
    
}


export const updateUserProfile = (userData) => {
    return api.put("/blogs/users/update", userData);
}

 
