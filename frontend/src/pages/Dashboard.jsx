import React from 'react'
import axios from "axios";
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react'
import api from '../api/axios';
import ShowPosts from '../components/ShowPosts';
import { createBlog } from '../api/blogs.api';
import { useAuth } from '../context/AuthContext';
import Settings from '../components/Settings';
import { settings } from 'firebase/analytics';
import UserProfile from '../components/UserProfile';
export default function Dashboard(){
  const { user, logout }= useAuth();
  const [title, setTitle]=useState("")
  const [body, setBody]=useState("")
  return(
      
    <>
    this is the dashboard
    <br></br>
    <input type="text" placeholder='blog title' onChange={e=>{setTitle(e.target.value)}} value={title} ></input>
    <input type="text" placeholder='blog body' onChange={e=>{setBody(e.target.value)}} value={body}></input>
    <button onClick={logout}>Signout</button>
    <button onClick={
      async()=>{
        
        //improve validation 
    const data= {title: title, body: body}
    const response = await createBlog(data);
    console.log("title and body filled")
      if (!data){
      return alert("fill the title and the body")
    }
    console.log("blog posted succesfully");
    window.location.reload();
    setTitle("");
    setBody("");
      }
    }>Create Post</button>
    <br></br>
    {<ShowPosts></ShowPosts>}
        <br></br>
    <br></br>
    {<Settings></Settings>}
    <br></br>
    <br></br>
    {<UserProfile></UserProfile>}
    </>
  )
}





//handles (create) logic