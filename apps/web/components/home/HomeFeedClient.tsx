"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import HomeNavbar from "@/components/home/HomeNavbar"
import BlogCard from "@/components/home/BlogCard"
import FloatingActionButton from "@/components/home/FloatingActionButton"
import BlogEditorOverlay from "@/components/BlogEditorOverlay"
import { motion } from "framer-motion"
import {
    formatTimeAgo,
    getReadTimeMinutes,
    isHardReloadNavigation,
    parsePublicFeedPayload,
    readPublicFeedSnapshot,
    writePublicFeedSnapshot,
    type PublicBlog,
    type PublicFeedPayload,
} from "@/lib/publicFeed"

type Props = {
    initialFeed: PublicFeedPayload | null
}

export default function HomeFeedClient({ initialFeed }: Props) {
    const persistedSnapshot = useMemo(() => readPublicFeedSnapshot(), [])
    const bootstrapPayload = persistedSnapshot ?? initialFeed

    const [blogs, setBlogs] = useState<PublicBlog[]>(bootstrapPayload?.blogs ?? [])
    const [snapshotHash, setSnapshotHash] = useState(bootstrapPayload?.hash ?? "")
    const [loading, setLoading] = useState(!bootstrapPayload)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [endOfPosts, setEndOfPosts] = useState(false)
    const [viewingBlog, setViewingBlog] = useState<{ title: string; body: string } | null>(null)

    useEffect(() => {
        if (!persistedSnapshot && initialFeed) {
            writePublicFeedSnapshot(initialFeed)
        }
    }, [initialFeed, persistedSnapshot])

    const fetchPublicBlogs = useCallback(async (opts?: { showLoading?: boolean }) => {
        const showSpinner = opts?.showLoading !== false
        if (showSpinner) setLoading(true)
        try {
            const response = await fetch("/api/public-blogs", { method: "GET" })
            if (!response.ok) throw new Error("Failed to fetch public blogs")

            const payload = parsePublicFeedPayload((await response.json()) as unknown)
            if (!payload) throw new Error("Invalid public feed payload")

            if (payload.hash !== snapshotHash) {
                setBlogs(payload.blogs)
                setSnapshotHash(payload.hash)
                writePublicFeedSnapshot(payload)
            }
        } catch {
        } finally {
            if (showSpinner) setLoading(false)
        }
    }, [snapshotHash])

    useEffect(() => {
        const shouldRefresh = isHardReloadNavigation() || (!persistedSnapshot && !initialFeed)
        if (!shouldRefresh) {
            setLoading(false)
            return
        }
        void fetchPublicBlogs({ showLoading: !bootstrapPayload })
    }, [bootstrapPayload, fetchPublicBlogs, initialFeed, persistedSnapshot])

    const handleBlogCreated = () => fetchPublicBlogs({ showLoading: false })

    const calculateReadTime = (body: string) => getReadTimeMinutes(body)

    return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />

            <main className="app-main-shell">
                <div className="paper-main" style={{ maxWidth: "768px", margin: "0 auto", padding: "32px 28px" }}>
                    <div className="text-left" style={{ marginBottom: "32px" }}>
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
                        <div className="text-center text-muted-foreground" style={{ padding: "40px 0" }}>
                            <div className="inline-block w-8 h-8 rounded-full animate-spin mb-4" style={{ border: "2px solid var(--color-primary)", borderTopColor: "transparent" }}></div>
                            <p>Loading posts...</p>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center" style={{ padding: "64px 0" }}>
                            <p className="text-muted-foreground text-lg">No posts yet. Be the first to write!</p>
                            <button
                                onClick={() => setIsEditorOpen(true)}
                                className="rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                                style={{ backgroundColor: "#3d3d3d", color: "#ffffff", padding: "12px 24px", marginTop: "16px" }}
                            >
                                Create Your First Post
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog._id}
                                    blog={blog}
                                    onOpenBlog={(b) => setViewingBlog({ title: b.title, body: b.body || "" })}
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
