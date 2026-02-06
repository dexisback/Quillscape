import { useState } from 'react'
import ShowPosts from '../components/ShowPosts'
import { useAuth } from '../context/AuthContext'
import HomeNavbar from '../components/home/HomeNavbar'
import BlogEditorOverlay from '../components/BlogEditorOverlay'
import { Pencil } from 'lucide-react'
import { motion } from 'framer-motion'

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

            <main className="pt-20 md:pt-24 pb-8 md:pb-12 px-4 md:px-6 paper-main">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between mb-8 md:mb-10">
                        <div className="text-left">
                            <p className="text-lg text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                                <span className="relative inline-block" style={{ isolation: 'isolate' }}>
                                    <motion.span
                                        className="absolute rounded-sm"
                                        style={{
                                            backgroundColor: '#fde047',
                                            zIndex: 0,
                                            transform: 'skewY(-2deg) rotate(-0.5deg)',
                                            top: '2px',
                                            bottom: '2px',
                                            left: '-3px',
                                            right: '-3px',
                                            borderRadius: '2px 8px 4px 6px'
                                        }}
                                        initial={{ scaleX: 0, originX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                    <span className="relative font-medium text-neutral-800" style={{ zIndex: 1 }}>Manage</span>
                                </span>
                                {" "}your drafts and published stories
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditorOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                            style={{ backgroundColor: '#3d3d3d', color: '#ffffff' }}
                        >
                            <Pencil className="w-4 h-4" />
                            New Post
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
