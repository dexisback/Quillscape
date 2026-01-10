import api from "./axios";
//nothing just this file does prettifying code:


export const getMyBlogs = () => api.get("/me");
export const createBlog = (data) => api.post("/post", data)
export const deleteBlog = (id) => api.delete(`/delete/${id}`)
export const updateBlog = (id, data) => api.put(`/${id}`, data);