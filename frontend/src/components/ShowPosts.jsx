import React from 'react'
import axios from "axios";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react'
import api from '../api/axios';
import { deleteBlog, getMyBlogs, updateBlog } from '../api/blogs.api';





export default function ShowPosts() {
 
 //getting my blogs 
const [blogs, setBlogs]=useState([]);
  useEffect(() => {
    const auth = getAuth();
    
    // This listener waits for Firebase to "wake up"
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
              
                const response = await getMyBlogs();
                setBlogs(response.data);
            } catch (err) {
                console.error("Fetch failed", err);
            }
        }
    });

    return () => unsubscribe(); // Cleanup the listener
}, []);



//dlt blogs
const handleDelete=async (  )=>{
   const blog_id=prompt("enter blog id to be dlted");
   if(!blog_id){
    return
   }
   try {
    
    await deleteBlog(blog_id);
        alert("blog deleted");
    setBlogs(blogs.filter(blog => blog._id !== blog_id));
        console.log(response.data, "delete request processed");

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

