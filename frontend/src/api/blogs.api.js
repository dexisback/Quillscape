import api from "./axios";
//nothing just this file does prettifying code:


export const getMyBlogs = () => api.get("/blogs/me");
export const createBlog = (data) => api.post("/blogs/post", data);  // data can include { title, body, status: 'draft' | 'published' }
export const deleteBlog = (id) => api.delete(`/blogs/delete/${id}`);
export const updateBlog = (id, data) => api.put(`/blogs/${id}`, data);  // data can include { title, body, status }