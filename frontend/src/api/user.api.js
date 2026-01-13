import api from "./axios";

export const syncUserWithMongoDB = (userData)=>{
    //userdata contains firebaseuid, and email
    return api.post("/users/sync", userData)
}


export const getUserProfile = () =>{
    return api.get("/users/profile");

}


export const updateUserProfile = (userData) => {
    return api.put("/users/update", userData);
}


