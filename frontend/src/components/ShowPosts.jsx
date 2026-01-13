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




  return (
   <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
     {blogs.length === 0 ? (
       <p style={{color: '#666', textAlign: 'center', padding: '30px 0'}}>No blogs yet. Create your first post!</p>
     ) : (
       blogs.map(blog => (
         <div key={blog._id} style={{backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '15px'}}>
           {editingId === blog._id ? (
             // Edit mode
             <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
               <input
                 type="text"
                 value={editForm.title}
                 onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                 style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', boxSizing: 'border-box'}}
                 placeholder="Blog title"
               />
               <textarea
                 value={editForm.body}
                 onChange={(e) => setEditForm({...editForm, body: e.target.value})}
                 style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', minHeight: '100px', boxSizing: 'border-box', resize: 'vertical'}}
                 placeholder="Blog content"
               />
               <div style={{display: 'flex', gap: '8px'}}>
                 <button
                   onClick={() => handleUpdate(blog._id)}
                   style={{padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                 >
                   Save
                 </button>
                 <button
                   onClick={cancelEditing}
                   style={{padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
                 >
                   Cancel
                 </button>
               </div>
             </div>
           ) : (
             // View mode
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
               <div style={{flex: '1'}}>
                 <h3 style={{fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '8px', margin: '0 0 8px'}}>{blog.title}</h3>
                 <p style={{color: '#555', marginBottom: '8px', margin: '0 0 8px'}}>{blog.body}</p>
                 <p style={{color: '#999', fontSize: '14px', margin: '0'}}>
                   {new Date(blog.createdAt).toLocaleDateString()}
                 </p>
               </div>
               <div style={{display: 'flex', gap: '8px', marginLeft: '15px'}}>
                 <button
                   onClick={() => startEditing(blog)}
                   style={{padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer'}}
                 >
                   Edit
                 </button>
                 <button
                   onClick={() => handleDelete(blog._id)}
                   style={{padding: '6px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', cursor: 'pointer'}}
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