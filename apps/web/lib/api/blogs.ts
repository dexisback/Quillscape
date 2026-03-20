import api from "./axios"

export const getMyBlogs = () => api.get("/blogs/me")
export const createBlog = (data: object) => api.post("/blogs/post", data)
export const deleteBlog = (id: string) => api.delete(`/blogs/delete/${id}`)
export const updateBlog = (id: string, data: object) => api.put(`/blogs/${id}`, data)
export const getBlogById = (id: string) => api.get(`/blogs/${id}`)
