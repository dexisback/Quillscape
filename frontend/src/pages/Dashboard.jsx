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
import Navbar from '../components/Navbar';

export default function Dashboard(){
  const { user, logout }= useAuth();
  const [title, setTitle]=useState("")
  const [body, setBody]=useState("")
  const [activeTab, setActiveTab] = useState('blogs');

  return(
    <div style={{minHeight: '100vh', backgroundColor: 'white'}}>
      {/* Navbar */}
      <Navbar setActiveTab={setActiveTab} activeTab={activeTab} />

      {/* Main content area */}
      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
        
        {activeTab === 'blogs' && (
          <>
            {/* Blog Writing Area */}
            <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px', marginBottom: '30px'}}>
              <h2 style={{fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px'}}>Create New Post</h2>
              <div style={{marginBottom: '15px'}}>
                <input 
                  type="text" 
                  placeholder='Blog title' 
                  onChange={e=>{setTitle(e.target.value)}} 
                  value={title}
                  style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', marginBottom: '15px', boxSizing: 'border-box'}}
                />
                <textarea 
                  placeholder='Write your blog content here...' 
                  onChange={e=>{setBody(e.target.value)}} 
                  value={body}
                  style={{width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', minHeight: '120px', boxSizing: 'border-box', resize: 'vertical'}}
                />
              </div>
              <button 
                onClick={async()=>{
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
                }}
                style={{padding: '12px 24px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '600'}}
              >
                Create Post
              </button>
            </div>

            {/* Blog Display Area */}
            <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px'}}>
              <h2 style={{fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px'}}>Your Posts</h2>
              <ShowPosts />
            </div>
          </>
        )}

        {activeTab === 'settings' && (
          <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px'}}>
            <h2 style={{fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px'}}>Settings</h2>
            <Settings />
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px'}}>
            <UserProfile />
          </div>
        )}

      </div>
    </div>
  )
}





//handles (create) logic