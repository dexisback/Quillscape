"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api/axios"
import HomeNavbar from "@/components/home/HomeNavbar"
import BlogCard from "@/components/home/BlogCard"
import FloatingActionButton from "@/components/home/FloatingActionButton"
import BlogEditorOverlay from "@/components/BlogEditorOverlay"
import { motion } from "framer-motion"

type Blog = {
    _id: string
    title: string
    body: string
    author_name?: string
    author_email?: string
    status?: string
    publishedAt?: string
    createdAt: string
}

export default function Home() {
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [endOfPosts, setEndOfPosts] = useState(false)
    const [viewingBlog, setViewingBlog] = useState<any>(null)

    const fetchPublicBlogs = async (opts?: { showLoading?: boolean }) => {
        const showSpinner = opts?.showLoading !== false
        if (showSpinner) setLoading(true)
        try {
            const response = await api.get("/blogs/public", {
                params: { _t: Date.now() },
            })
            setBlogs(Array.isArray(response.data) ? response.data : [])
        } catch {
        } finally {
            if (showSpinner) setLoading(false)
        }
    }

    useEffect(() => {
        fetchPublicBlogs({ showLoading: true })
    }, [])

    /** Refetch after publish without flashing the full-page loader */
    const handleBlogCreated = () => fetchPublicBlogs({ showLoading: false })

    const calculateReadTime = (body: string) => {
        const wordCount = body.trim().split(/\s+/).length
        return Math.ceil(wordCount / 200)
    }

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date()
        const posted = new Date(timestamp)
        const diffMs = now.getTime() - posted.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMs / 3600000)
        const diffDays = Math.floor(diffMs / 86400000)

        if (diffMins < 1) return "just now"
        if (diffMins < 60) return `${diffMins} min ago`
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
        return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    }

    return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />

            <main className="app-main-shell">
                <div className="paper-main" style={{ maxWidth: '768px', margin: '0 auto', padding: '32px 28px' }}>
                    <div className="text-left" style={{ marginBottom: '32px' }}>
                        <p className="text-lg text-muted-foreground inter-tight">
                            <span className="relative inline-block marker-wrap">
                                <motion.span
                                    className="absolute rounded-sm marker-swipe"
                                    initial={{ scaleX: 0, originX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <span className="relative font-medium text-neutral-800 marker-text">Discover stories</span>
                            </span>
                            {" "}from writers across{" "}
                            <span className="font-semibold text-primary">Quillscape</span>
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center text-muted-foreground" style={{ padding: '40px 0' }}>
                            <div className="inline-block w-8 h-8 rounded-full animate-spin mb-4" style={{ border: '2px solid var(--color-primary)', borderTopColor: 'transparent' }}></div>
                            <p>Loading posts...</p>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center" style={{ padding: '64px 0' }}>
                            <p className="text-muted-foreground text-lg">No posts yet. Be the first to write!</p>
                            <button
                                onClick={() => setIsEditorOpen(true)}
                                className="rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                                style={{ backgroundColor: "#3d3d3d", color: "#ffffff", padding: "12px 24px", marginTop: '16px' }}
                            >
                                Create Your First Post
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog._id}
                                    blog={blog}
                                    onOpenBlog={(b) => setViewingBlog(b)}
                                    calculateReadTime={calculateReadTime}
                                    formatTimeAgo={formatTimeAgo}
                                />
                            ))}
                        </div>
                    )}

                    {viewingBlog && (
                        <BlogEditorOverlay
                            isOpen={true}
                            onClose={() => setViewingBlog(null)}
                            readOnly={true}
                            initialTitle={viewingBlog.title}
                            initialBody={viewingBlog.body}
                        />
                    )}

                    {blogs.length > 0 && (
                        <div className="text-center" style={{ marginTop: '48px' }}>
                            {!endOfPosts ? (
                                <button
                                    onClick={() => setEndOfPosts(true)}
                                    className="rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                                    style={{ backgroundColor: "#3d3d3d", color: "#ffffff", padding: "12px 24px" }}
                                >
                                    Load More Stories
                                </button>
                            ) : (
                                <p className="text-xs text-red-500">
                                    That&apos;s it for now — start writing to publish notes on the fyp page
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <FloatingActionButton onClick={() => setIsEditorOpen(true)} />

            <BlogEditorOverlay
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onBlogCreated={handleBlogCreated}
            />
        </div>
    )
}
