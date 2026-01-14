import React, { useState } from 'react';
import { createBlog } from '../api/blogs.api';
import { useAuth } from '../context/AuthContext';

export default function BlogEditorOverlay({ isOpen, onClose, onBlogCreated }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (status) => {
    if (!title.trim() || !body.trim()) {
      return alert('Please fill both title and body before submitting.');
    }

    if (!user) {
      return alert('You must be logged in to create a post.');
    }

    setLoading(true);
    try {
      const data = { title: title.trim(), body: body.trim(), status };
      const response = await createBlog(data);

      // Clear form and close
      setTitle('');
      setBody('');
      
      if (onBlogCreated && response.data) {
        onBlogCreated(response.data.blog);
      }

      const actionText = status === 'published' ? 'published' : 'saved as draft';
      alert(`Blog ${actionText} successfully!`);
      onClose();
    } catch (err) {
      console.error('Failed to create blog:', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (title.trim() || body.trim()) {
      if (!confirm('You have unsaved changes. Are you sure you want to close?')) {
        return;
      }
    }
    setTitle('');
    setBody('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Editor Modal */}
      <div className="relative w-full max-w-3xl h-[80vh] mx-4 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Write your story</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Editor Area - Notion-like */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title */}
          <input
            type="text"
            placeholder="Untitled"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
            className="w-full text-4xl font-bold text-gray-800 placeholder-gray-300 border-none outline-none mb-4 bg-transparent"
          />
          
          {/* Divider */}
          <div className="w-16 h-1 bg-gray-200 rounded mb-6" />
          
          {/* Body */}
          <textarea
            placeholder="Tell your story..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={loading}
            className="w-full h-full min-h-[300px] text-lg text-gray-700 placeholder-gray-400 border-none outline-none resize-none bg-transparent leading-relaxed"
          />
        </div>

        {/* Footer with actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {title.trim() || body.trim() ? 'Unsaved changes' : 'Start writing...'}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                loading 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {loading ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleSubmit('published')}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-colors ${
                loading 
                  ? 'bg-blue-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
