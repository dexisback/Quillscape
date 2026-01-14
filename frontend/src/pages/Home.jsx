import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function Home (){
  const  { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicBlogs = async () => {
      try {
        const response = await api.get('/blogs/public');
        setBlogs(response.data);
      } catch (err) {
        console.error("Failed to fetch public blogs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPublicBlogs();
  }, []);

  const calculateReadTime = (body) => {
    const wordsPerMinute = 200;
    const wordCount = body.trim().split(/\s+/).length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return readTime;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const posted = new Date(timestamp);
    const diffMs = now - posted;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto p-5">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Home</h1>
          <p className="text-gray-500 text-base">Discover stories from writers across Quillscape</p>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading posts...</div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No posts yet. Be the first to write!</div>
        ) : (
          <div className="flex flex-col gap-5">
            {blogs.map(blog => (
              <div 
                key={blog._id} 
                className="bg-white border border-gray-300 rounded-lg p-5 cursor-pointer hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {blog.title}
                </h2>
                
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  {blog.body.length > 200 ? `${blog.body.substring(0, 200)}...` : blog.body}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="font-medium">
                    {blog.author_email || 'Anonymous'}
                  </span>
                  <span>•</span>
                  <span>{formatTimeAgo(blog.createdAt)}</span>
                  <span>•</span>
                  <span>{calculateReadTime(blog.body)} min read</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
