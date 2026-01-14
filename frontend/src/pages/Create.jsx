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
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto p-5">
        <BlogWritingForm onBlogCreated={handleBlogCreated} />

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Posts</h2>
          <ShowPosts key={refreshPosts} />
        </div>
      </div>
    </div>
  )
}
