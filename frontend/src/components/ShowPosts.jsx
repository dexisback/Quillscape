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

const handleDelete=async (  )=>{
   const blog_id=prompt("enter blog id to be dlted");
   if(!blog_id){
    return
   }
   try {
    
    await deleteBlog(blog_id);
        alert("blog deleted");
    setBlogs(blogs.filter(blog => blog._id !== blog_id));
        console.log("delete request processed");

   } catch (error) {
    console.error("delete failed", err)    
   }
}



const handleUpdate = async(  )=>{
    const blog_id=prompt("Enter the blog id to be edited: ");
        const updatedDataString=prompt("Enter in this format : { title, body }")   

    if(!blog_id || !updatedDataString){return};
  try {
        const updatedDataJSON= JSON.parse(updatedDataString)
    await updateBlog(blog_id, updatedDataJSON);
    setBlogs(blogs.map(blog => 
        blog._id === blog_id ? { ...blog, ...updatedDataJSON } : blog
      ));
      alert("Updated!");
  } catch (err) {
    console.error("update failed", err);
  }

  }




  return (
   <>
   {JSON.stringify(blogs)}
   <button onClick={handleDelete}>Delete</button>
   <button onClick={handleUpdate}>Edit any blog</button>
   </>
  )


}





//handles (get, delete, update) logics ( for now )