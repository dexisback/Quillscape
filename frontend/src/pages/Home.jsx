import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import HomeNavbar from '../components/home/HomeNavbar'
import BlogCard from '../components/home/BlogCard'
import FloatingActionButton from '../components/home/FloatingActionButton'
import BlogEditorOverlay from '../components/BlogEditorOverlay'

export default function Home() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const fetchPublicBlogs = async () => {
    try {
      const response = await api.get('/blogs/public')
      setBlogs(response.data)
    } catch (err) {
      console.error("Failed to fetch public blogs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicBlogs()
  }, [])

  const handleBlogCreated = (newBlog) => {
    fetchPublicBlogs()
  }

  const calculateReadTime = (body) => {
    const wordsPerMinute = 200
    const wordCount = body.trim().split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return readTime
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const posted = new Date(timestamp)
    const diffMs = now - posted
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-12 text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Home</h1>
            <p className="text-lg text-muted-foreground">Discover stories from writers across Quillscape</p>
          </div>

          {/* Blog Feed */}
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p>Loading posts...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-muted-foreground text-lg">No posts yet. Be the first to write!</p>
              <button
                onClick={() => setIsEditorOpen(true)}
                className="mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Create Your First Post
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {blogs.map(blog => (
                <BlogCard
                  key={blog._id}
                  blog={blog}
                  calculateReadTime={calculateReadTime}
                  formatTimeAgo={formatTimeAgo}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {blogs.length > 0 && (
            <div className="mt-12 text-center">
              <button className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:shadow-lg transition-all duration-300 hover:scale-105">
                Load More Stories
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={() => setIsEditorOpen(true)} />

      {/* Blog Editor Overlay */}
      <BlogEditorOverlay
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onBlogCreated={handleBlogCreated}
      />
    </div>
  )
}
