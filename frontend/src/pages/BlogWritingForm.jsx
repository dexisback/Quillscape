import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { createBlog } from '../api/blogs.api';




function BlogWritingForm({ onBlogCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validation BEFORE creating data and calling API
    if (!title.trim() || !body.trim()) {
      return alert("Please fill both title and body before submitting.");
    }
    
    if (!user) {
      return alert("You must be logged in to create a post.");
    }

    setLoading(true);
    try {
      const data = { title: title.trim(), body: body.trim() };
      const response = await createBlog(data);
      
      // Clear form on success
      setTitle("");
      setBody("");
      
      // Notify parent component (Dashboard) that a blog was created
      // This allows updating the blog list without page reload
      if (onBlogCreated && response.data) {
        onBlogCreated(response.data);
      }
      
      console.log("Blog posted successfully");
    } catch (err) {
      console.error("Failed to create blog:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Create New Post</h2>
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Blog title" 
          onChange={(e) => setTitle(e.target.value)} 
          value={title}
          disabled={loading}
          className={`w-full p-3 border border-gray-200 rounded-md mb-4 box-border ${loading ? 'bg-gray-100' : 'bg-white'}`}
        />
        <textarea 
          placeholder="Write your blog content here..." 
          onChange={(e) => setBody(e.target.value)} 
          value={body}
          disabled={loading}
          className={`w-full p-3 border border-gray-200 rounded-md text-base min-h-[120px] box-border resize-y ${loading ? 'bg-gray-100' : 'bg-white'}`}
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={loading}
        className={`${loading ? 'px-4 py-2 bg-gray-500 cursor-not-allowed' : 'px-4 py-2 bg-blue-600 hover:bg-blue-700'} text-white rounded-md font-semibold`}
      >
        {loading ? 'Creating...' : 'Create Post'}
      </button>
    </div>
  );
}

export default BlogWritingForm;