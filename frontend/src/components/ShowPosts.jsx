import React from 'react'
import axios from "axios";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react'
import api from '../api/axios';
import { deleteBlog, getMyBlogs, updateBlog } from '../api/blogs.api';
import { useAuth } from '../context/AuthContext';





export default function ShowPosts() {
    const { user, logout } = useAuth();
 
const [blogs, setBlogs]=useState([]);
const [editingId, setEditingId] = useState(null);
const [editForm, setEditForm] = useState({ title: '', body: '' });

useEffect(()=>{
    if(user){
        const fetchBlogs= async ()=>{
            try {
                const response=await getMyBlogs();
                console.log(response.data);
                setBlogs(response.data);

            } catch (err) {
                console.error("fetch failed and here is the error", err)
            }
        }
        fetchBlogs();
    }
}, [user])

const handleDelete=async ( blog_id )=>{
   if(!blog_id){
    return
   }
   try {
    
    await deleteBlog(blog_id);
    setBlogs(blogs.filter(blog => blog._id !== blog_id));
        console.log("delete request processed");

   } catch (error) {
    console.error("delete failed", error)    
   }
}

const startEditing = (blog) => {
  setEditingId(blog._id);
  setEditForm({ title: blog.title, body: blog.body });
};

const cancelEditing = () => {
  setEditingId(null);
  setEditForm({ title: '', body: '' });
};

const handleUpdate = async( blog_id )=>{
    if(!blog_id){return};
  try {
    const updatedDataJSON = { title: editForm.title, body: editForm.body };
    await updateBlog(blog_id, updatedDataJSON);
    setBlogs(blogs.map(blog => 
        blog._id === blog_id ? { ...blog, ...updatedDataJSON } : blog
      ));
    setEditingId(null);
    setEditForm({ title: '', body: '' });
  } catch (err) {
    console.error("update failed", err);
  }

  }

const handlePublish = async (blog_id) => {
  try {
    const response = await updateBlog(blog_id, { status: 'published' });
    setBlogs(blogs.map(blog => 
      blog._id === blog_id ? { ...blog, status: 'published', publishedAt: new Date() } : blog
    ));
    alert('Blog published successfully!');
  } catch (err) {
    console.error("publish failed", err);
    alert('Failed to publish blog.');
  }
};

const handleUnpublish = async (blog_id) => {
  try {
    await updateBlog(blog_id, { status: 'draft' });
    setBlogs(blogs.map(blog => 
      blog._id === blog_id ? { ...blog, status: 'draft', publishedAt: null } : blog
    ));
    alert('Blog reverted to draft.');
  } catch (err) {
    console.error("unpublish failed", err);
    alert('Failed to unpublish blog.');
  }
};




  return (
   <div className="flex flex-col gap-4">
     {blogs.length === 0 ? (
       <p className="text-gray-500 text-center py-8">No blogs yet. Create your first post!</p>
     ) : (
       blogs.map(blog => (
         <div key={blog._id} className="bg-white border border-gray-200 rounded-md p-4">
           {editingId === blog._id ? (
             // Edit mode
             <div className="flex flex-col gap-3">
               <input
                 type="text"
                 value={editForm.title}
                 onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                 className="w-full p-3 border border-gray-200 rounded-md text-base box-border"
                 placeholder="Blog title"
               />
               <textarea
                 value={editForm.body}
                 onChange={(e) => setEditForm({...editForm, body: e.target.value})}
                 className="w-full p-3 border border-gray-200 rounded-md text-base min-h-[100px] box-border resize-y"
                 placeholder="Blog content"
               />
               <div className="flex gap-2">
                 <button
                   onClick={() => handleUpdate(blog._id)}
                   className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                 >
                   Save
                 </button>
                 <button
                   onClick={cancelEditing}
                   className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                 >
                   Cancel
                 </button>
               </div>
             </div>
           ) : (
             // View mode
             <div className="flex justify-between items-start">
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-2">
                   <h3 className="text-lg font-semibold text-gray-800">{blog.title}</h3>
                   <span className={`px-2 py-0.5 text-xs rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                     {blog.status === 'published' ? 'Published' : 'Draft'}
                   </span>
                 </div>
                 <p className="text-gray-600 mb-2">{blog.body}</p>
                 <p className="text-sm text-gray-400">
                   {blog.status === 'published' && blog.publishedAt 
                     ? `Published ${new Date(blog.publishedAt).toLocaleDateString()}`
                     : `Created ${new Date(blog.createdAt).toLocaleDateString()}`
                   }
                 </p>
               </div>
               <div className="flex gap-2 ml-4">
                 {blog.status === 'draft' ? (
                   <button
                     onClick={() => handlePublish(blog._id)}
                     className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                   >
                     Publish
                   </button>
                 ) : (
                   <button
                     onClick={() => handleUnpublish(blog._id)}
                     className="px-3 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                   >
                     Unpublish
                   </button>
                 )}
                 <button
                   onClick={() => startEditing(blog)}
                   className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                 >
                   Edit
                 </button>
                 <button
                   onClick={() => handleDelete(blog._id)}
                   className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                 >
                   Delete
                 </button>
               </div>
             </div>
           )}
         </div>
       ))
     )}
   </div>
  )


}





//handles (get, delete, update) logics ( for now )