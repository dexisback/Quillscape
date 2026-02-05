import { useState, useEffect, useRef } from 'react'
import { deleteBlog, getMyBlogs, updateBlog } from '../api/blogs.api'
import { useAuth } from '../context/AuthContext'
import BlogEditorOverlay from './BlogEditorOverlay'
import gsap from 'gsap'

export default function ShowPosts() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [editingBlog, setEditingBlog] = useState(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  useEffect(() => {
    if (user) {
      const fetchBlogs = async () => {
        try {
          const response = await getMyBlogs()
          const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          setBlogs(sorted)
        } catch (err) {
          console.error("fetch failed:", err)
        }
      }
      fetchBlogs()
    }
  }, [user])


  const handleDelete = async (blog_id) => {
    if (!blog_id) return
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      await deleteBlog(blog_id)
      setBlogs(blogs.filter(blog => blog._id !== blog_id))
    } catch (error) {
      console.error("delete failed", error)
    }
  }

  const startEditing = (blog) => {
    setEditingBlog(blog)
    setIsEditorOpen(true)
  }

  const handleBlogUpdated = (updatedData) => {
    setBlogs(blogs.map(blog =>
      blog._id === updatedData._id ? { ...blog, ...updatedData } : blog
    ))
  }

  const handlePublish = async (blog_id) => {
    try {
      await updateBlog(blog_id, { status: 'published' })
      setBlogs(blogs.map(blog =>
        blog._id === blog_id ? { ...blog, status: 'published', publishedAt: new Date() } : blog
      ))
    } catch (err) {
      console.error("publish failed", err)
    }
  }

  const handleUnpublish = async (blog_id) => {
    try {
      await updateBlog(blog_id, { status: 'draft' })
      setBlogs(blogs.map(blog =>
        blog._id === blog_id ? { ...blog, status: 'draft', publishedAt: null } : blog
      ))
    } catch (err) {
      console.error("unpublish failed", err)
    }
  }

  function PostCard({ blog }) {
    const isPublished = blog.status === 'published'

    return (
      <div
        className="bg-card border border-border rounded-xl p-3 hover:shadow-lg transition-all duration-300 hover:border-accent/30 text-left relative"
      >
        {/* Status Indicator - Top Right */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${isPublished
              ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]'
              : 'bg-red-400 shadow-[0_0_8px_2px_rgba(248,113,113,0.5)]'
              }`}
          />
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            {isPublished ? 'Live' : 'Draft'}
          </span>
        </div>

        <div className="flex flex-col gap-3">
          {/* Title */}
          <h3 className="text-base font-semibold text-foreground pr-20">{blog.title}</h3>

          {/* Content */}
          <p className="text-muted-foreground text-sm leading-relaxed">
            {blog.body.length > 150 ? `${blog.body.substring(0, 150)}...` : blog.body}
          </p>


          {/* Footer: Date + Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-muted-foreground">
              {isPublished && blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              }
            </span>

            <div className="flex items-center gap-1">
              {/* Publish/Unpublish */}
              <button
                onClick={() => isPublished ? handleUnpublish(blog._id) : handlePublish(blog._id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-200"
                title={isPublished ? 'Unpublish' : 'Publish'}
              >
                {isPublished ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>

              {/* Edit */}
              <button
                onClick={() => startEditing(blog)}
                className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted/50 transition-all duration-200"
                title="Edit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(blog._id)}
                className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                title="Delete"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {blogs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📝</span>
            </div>
            <p className="text-muted-foreground text-lg">No posts yet. Create your first post!</p>
          </div>
        ) : (
          blogs.map(blog => (
            <PostCard key={blog._id} blog={blog} />
          ))
        )}
      </div>

      {/* Edit Modal Overlay - Same as create but in edit mode */}
      <BlogEditorOverlay
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setEditingBlog(null)
        }}
        editMode={true}
        blogId={editingBlog?._id}
        initialTitle={editingBlog?.title || ''}
        initialBody={editingBlog?.body || ''}
        onBlogUpdated={handleBlogUpdated}
      />
    </>
  )
}