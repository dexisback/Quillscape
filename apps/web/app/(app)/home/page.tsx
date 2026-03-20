"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
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
    const { user } = useAuth()
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [endOfPosts, setEndOfPosts] = useState(false)
    const [viewingBlog, setViewingBlog] = useState<any>(null)

    const fetchPublicBlogs = async () => {
        try {
            const response = await api.get("/blogs/public")
            setBlogs(response.data)
        } catch {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPublicBlogs()
    }, [])

    const handleBlogCreated = () => {
        fetchPublicBlogs()
    }

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

            <main
                className="paper-main"
                style={{ paddingTop: "96px", paddingRight: "24px", paddingBottom: "48px", paddingLeft: "24px" }}
            >
                <div className="max-w-3xl mx-auto" style={{ maxWidth: "768px", marginLeft: "auto", marginRight: "auto" }}>
                    <div className="text-left" style={{ marginBottom: "48px" }}>
                        <p className="text-lg text-muted-foreground" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
                            <span className="relative inline-block" style={{ isolation: "isolate" }}>
                                <motion.span
                                    className="absolute rounded-sm"
                                    style={{
                                        backgroundColor: "#fde047",
                                        zIndex: 0,
                                        transform: "skewY(-2deg) rotate(-0.5deg)",
                                        top: "2px", bottom: "2px", left: "-3px", right: "-3px",
                                        borderRadius: "2px 8px 4px 6px",
                                    }}
                                    initial={{ scaleX: 0, originX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <span className="relative font-medium text-neutral-800" style={{ zIndex: 1 }}>Discover stories</span>
                            </span>
                            {" "}from writers across{" "}
                            <span className="font-semibold text-primary">Quillscape</span>
                        </p>
                    </div>

                    {loading ? (
                        <div className="text-center text-muted-foreground" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
                            <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p>Loading posts...</p>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center" style={{ paddingTop: "64px", paddingBottom: "64px" }}>
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-2xl">📝</span>
                            </div>
                            <p className="text-muted-foreground text-lg">No posts yet. Be the first to write!</p>
                            <button
                                onClick={() => setIsEditorOpen(true)}
                                className="mt-4 px-6 py-3 rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                                style={{ backgroundColor: "#3d3d3d", color: "#ffffff" }}
                            >
                                Create Your First Post
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
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
                        <div className="text-center" style={{ marginTop: "48px" }}>
                            {!endOfPosts ? (
                                <button
                                    onClick={() => setEndOfPosts(true)}
                                    className="px-6 py-3 rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                                    style={{ backgroundColor: "#3d3d3d", color: "#ffffff" }}
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
