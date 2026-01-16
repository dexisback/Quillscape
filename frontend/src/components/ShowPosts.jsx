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
          setBlogs(response.data)
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

  // Blog Card Component with GSAP animation
  function PostCard({ blog }) {
    const cardRef = useRef(null)

    useEffect(() => {
      if (!cardRef.current) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 20 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            )
            observer.unobserve(entry.target)
          }
        },
        { threshold: 0.1 }
      )

      observer.observe(cardRef.current)
      return () => observer.disconnect()
    }, [])

    return (
      <div
        ref={cardRef}
        className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:border-accent/30 opacity-0 text-left"
      >
        <div className="flex flex-col gap-4">
          {/* Header: Title + Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-foreground">{blog.title}</h3>
              <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${blog.status === 'published'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-accent/20 text-accent'
                }`}>
                {blog.status === 'published' ? 'Published' : 'Draft'}
              </span>
            </div>
          </div>

          {/* Content */}
          <p className="text-muted-foreground text-sm leading-relaxed bg-muted/30 rounded-lg p-3">
            {blog.body.length > 200 ? `${blog.body.substring(0, 200)}...` : blog.body}
          </p>

          {/* Footer: Date + Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
              {blog.status === 'published' && blog.publishedAt
                ? `Published ${new Date(blog.publishedAt).toLocaleDateString()}`
                : `Created ${new Date(blog.createdAt).toLocaleDateString()}`
              }
            </span>

            <div className="flex gap-2">
              {blog.status === 'draft' ? (
                <button
                  onClick={() => handlePublish(blog._id)}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  Publish
                </button>
              ) : (
                <button
                  onClick={() => handleUnpublish(blog._id)}
                  className="px-3 py-1.5 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  Unpublish
                </button>
              )}
              <button
                onClick={() => startEditing(blog)}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(blog._id)}
                className="px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted/80 transition-all duration-300"
              >
                Delete
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