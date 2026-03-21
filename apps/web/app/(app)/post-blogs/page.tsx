"use client"

import { useState } from "react"
import HomeNavbar from "@/components/home/HomeNavbar"
import ShowPosts from "@/components/ShowPosts"
import BlogEditorOverlay from "@/components/BlogEditorOverlay"
import { Pencil } from "lucide-react"
import { motion } from "framer-motion"

export default function PostBlogs() {
    const [refreshPosts, setRefreshPosts] = useState(0)
    const [isEditorOpen, setIsEditorOpen] = useState(false)

    const handleBlogCreated = () => {
        setRefreshPosts((prev) => prev + 1)
    }

    return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />

            <main className="app-main-shell">
                <div className="paper-main" style={{ maxWidth: '768px', margin: '0 auto', padding: '32px 28px' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                        <div className="text-left">
                            <p className="text-lg text-muted-foreground inter-tight">
                                <span className="relative inline-block marker-wrap">
                                    <motion.span
                                        className="absolute rounded-sm marker-swipe"
                                        initial={{ scaleX: 0, originX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    />
                                    <span className="relative font-medium text-neutral-800 marker-text">Manage</span>
                                </span>
                                {" "}your drafts and published stories
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditorOpen(true)}
                            className="flex items-center justify-center gap-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
                            style={{ backgroundColor: "#3d3d3d", color: "#ffffff", padding: "8px 20px" }}
                        >
                            <Pencil className="w-4 h-4" />
                            New Post
                        </button>
                    </div>

                    <ShowPosts key={refreshPosts} />
                </div>
            </main>

            <BlogEditorOverlay
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onBlogCreated={handleBlogCreated}
            />
        </div>
    )
}
