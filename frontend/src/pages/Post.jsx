import React from 'react'
import { useState } from 'react'
import ShowPosts from '../components/ShowPosts';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BlogEditorOverlay from '../components/BlogEditorOverlay';


export default function Post(){
  const { user } = useAuth();
  const [refreshPosts, setRefreshPosts] = useState(0);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleBlogCreated = (newBlog) => {
    setRefreshPosts(prev => prev + 1);
  };

  return(
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto p-5">
        {/* Header with Post Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Your Posts</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your drafts and published stories</p>
          </div>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Post Your Thoughts
          </button>
        </div>

        {/* Posts List */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <ShowPosts key={refreshPosts} />
        </div>
      </div>

      {/* Blog Editor Overlay */}
      <BlogEditorOverlay 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        onBlogCreated={handleBlogCreated}
      />
    </div>
  )
}
