import React from 'react'
import { useState } from 'react'
import ShowPosts from '../components/ShowPosts';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BlogWritingForm from './BlogWritingForm';


export default function Create(){
  const { user } = useAuth();
  const [refreshPosts, setRefreshPosts] = useState(0);

  const handleBlogCreated = (newBlog) => {
    setRefreshPosts(prev => prev + 1);
  };

  return(
    <div style={{minHeight: '100vh', backgroundColor: 'white'}}>
      <Navbar />

      <div style={{maxWidth: '1200px', margin: '0 auto', padding: '20px'}}>
        <CreateBlog onBlogCreated={handleBlogCreated} />

        <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px'}}>
          <h2 style={{fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px'}}>Your Posts</h2>
          <ShowPosts key={refreshPosts} />
        </div>
      </div>
    </div>
  )
}
