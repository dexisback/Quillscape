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
    <div style={{backgroundColor: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px', padding: '25px', marginBottom: '30px'}}>
      <h2 style={{fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '20px'}}>Create New Post</h2>
      <div style={{marginBottom: '15px'}}>
        <input 
          type="text" 
          placeholder="Blog title" 
          onChange={(e) => setTitle(e.target.value)} 
          value={title}
          disabled={loading}
          style={{
            width: '100%', 
            padding: '12px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            fontSize: '16px', 
            marginBottom: '15px', 
            boxSizing: 'border-box',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
        <textarea 
          placeholder="Write your blog content here..." 
          onChange={(e) => setBody(e.target.value)} 
          value={body}
          disabled={loading}
          style={{
            width: '100%', 
            padding: '12px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            fontSize: '16px', 
            minHeight: '120px', 
            boxSizing: 'border-box', 
            resize: 'vertical',
            backgroundColor: loading ? '#f5f5f5' : 'white'
          }}
        />
      </div>
      <button 
        onClick={handleSubmit}
        disabled={loading}
        style={{
          padding: '12px 24px', 
          backgroundColor: loading ? '#6c757d' : '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: loading ? 'not-allowed' : 'pointer', 
          fontSize: '16px', 
          fontWeight: '600'
        }}
      >
        {loading ? 'Creating...' : 'Create Post'}
      </button>
    </div>
  );
}

export default BlogWritingForm;