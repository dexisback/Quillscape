import api from "./axios"

export const syncUserWithMongoDB = (userData: object) => api.post("/blogs/users/sync", userData)
export const getUserProfile = () => api.get("/blogs/users/profile")
export const updateUserProfile = (userData: object) => api.put("/blogs/users/update", userData)
