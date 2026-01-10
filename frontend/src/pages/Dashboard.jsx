import React from 'react'
import axios from "axios";
import { getAuth } from 'firebase/auth';
import { useState, useEffect } from 'react'
import api from '../api/axios';
import ShowPosts from '../components/ShowPosts';


export default function Dashboard(){
  const [title, setTitle]=useState("")
  const [body, setBody]=useState("")
  return(
      
    <>
    this is the dashboard
    <br></br>
    <input type="text" placeholder='blog title' onChange={e=>{setTitle(e.target.value)}} value={title} ></input>
    <input type="text" placeholder='blog body' onChange={e=>{setBody(e.target.value)}} value={body}></input>
    <button onClick={
      async()=>{
        
      const auth=getAuth();
      const user=auth.currentUser; //defining user
      const token= await user.getIdToken();
        //on clicking this button, post request will be called
        const response= axios.post("http://localhost:3000/blogs/post", {
          title: title,
          body: body,
        },
      {headers: {Authorization: `Bearer ${token}`}}
    );
    console.log("blog posted succesfully");
    //clear the vars:
    setTitle("");
    setBody("");
      }
    }>Create Post</button>
    <br></br>
    {<ShowPosts></ShowPosts>}
    </>
  )
}
