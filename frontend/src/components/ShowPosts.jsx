import React from 'react'
import axios from "axios";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react'
import api from '../api/axios';
export default function ShowPosts() {
  
const [blogs, setBlogs]=useState("");
  useEffect(() => {
    const auth = getAuth();
    
    // This listener waits for Firebase to "wake up"
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const token = await user.getIdToken();
                const response = await axios.get("http://localhost:3000/blogs/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBlogs(response.data);
            } catch (err) {
                console.error("Fetch failed", err);
            }
        }
    });

    return () => unsubscribe(); // Cleanup the listener
}, []);

const handleDelete=async (  )=>{
    const auth=getAuth();
    const user=auth.currentUser;
    const token=await user.getIdToken();
    const blog_id=prompt("enter blog id to be deleted");
    const response = await axios.delete(`http://localhost:3000/blogs/delete/${blog_id}`, {headers: {Authorization: `Bearer ${token}`}});
    console.log(response.data, "delete request processed");
    alert("blog deleted");
    setBlogs(blogs.filter(blog => blog._id !== blog_id));
}



const handleUpdate = async(  )=>{
    const auth=getAuth();
    const user=auth.currentUser;
    const token=await user.getIdToken();
    const blog_id= prompt("Enter the blog id to be edited");
    //i will enter the prompt as an object in itself
    const updatedDataString=prompt("Enter in this format : { title, body }")   
    const updatedDataJSON= JSON.parse(updatedDataString)

    const response=await axios.put(`http://localhost:3000/blogs/${blog_id}`, updatedDataJSON , {headers: {Authorization: `Bearer ${token}`}});
    console.log(response.data, "put request processed");
    setBlogs(blogs.map(blog => 
            blog._id === blog_id ? { ...blog, ...updatedDataJSON } : blog
        ))
  }

  //blogs is an array with objects inside of it [{},{},{},{},{},...]

  return (
   <>
   {JSON.stringify(blogs)}
   <button onClick={handleDelete}>Delete</button>
   <button onClick={handleUpdate}>Edit any blog</button>
   </>
  )


}

