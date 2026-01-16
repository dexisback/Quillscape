import { useState } from 'react'
import ShowPosts from '../components/ShowPosts'
import { useAuth } from '../context/AuthContext'
import HomeNavbar from '../components/home/HomeNavbar'
import BlogEditorOverlay from '../components/BlogEditorOverlay'
import { Pencil } from 'lucide-react'

export default function Post() {
  const { user } = useAuth()
  const [refreshPosts, setRefreshPosts] = useState(0)
  const [isEditorOpen, setIsEditorOpen] = useState(false)

  const handleBlogCreated = (newBlog) => {
    setRefreshPosts(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Your Posts</h1>
              <p className="text-lg text-muted-foreground">Manage your drafts and published stories</p>
            </div>
            <button
              onClick={() => setIsEditorOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-accent text-accent-foreground rounded-full font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <Pencil className="w-5 h-5" />
              Post Your Thoughts
            </button>
          </div>

          {/* Posts List */}
          <ShowPosts key={refreshPosts} />
        </div>
      </main>

      {/* Blog Editor Overlay */}
      <BlogEditorOverlay
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onBlogCreated={handleBlogCreated}
      />
    </div>
  )
}
