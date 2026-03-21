"use client"

import { useState, useEffect } from "react"
import { deleteBlog, getMyBlogs, updateBlog } from "@/lib/api/blogs"
import { useAuth } from "@/context/AuthContext"
import BlogEditorOverlay from "./BlogEditorOverlay"

function stripMarkdownImages(text: string): string {
    if (!text) return ""
    let result = ""
    let i = 0
    while (i < text.length) {
        if (text[i] === "!" && text[i + 1] === "[") {
            let j = i + 2
            while (j < text.length && text[j] !== "]") j++
            if (text[j] === "]" && text[j + 1] === "(") {
                let depth = 1; let k = j + 2
                while (k < text.length && depth > 0) {
                    if (text[k] === "(") depth++
                    else if (text[k] === ")") depth--
                    k++
                }
                i = k; continue
            }
        }
        if (text.substring(i, i + 11) === "data:image/") {
            while (i < text.length && text[i] !== " " && text[i] !== "\n" && text[i] !== ")") i++
            continue
        }
        result += text[i]; i++
    }
    let cleaned = ""; let lastWasSpace = false
    for (const c of result) {
        if (c === " " || c === "\n" || c === "\t") { if (!lastWasSpace) { cleaned += " "; lastWasSpace = true } }
        else { cleaned += c; lastWasSpace = false }
    }
    return cleaned.trim()
}

type Blog = { _id: string; title: string; body: string; status: string; publishedAt?: string; createdAt: string }

export default function ShowPosts() {
    const { user } = useAuth()
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null)
    const [isEditorOpen, setIsEditorOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) { setLoading(false); return }
        const fetchBlogs = async () => {
            setLoading(true)
            try {
                const response = await getMyBlogs()
                const sorted = response.data.sort((a: Blog, b: Blog) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                setBlogs(sorted)
            } catch { } finally { setLoading(false) }
        }
        fetchBlogs()
    }, [user])

    const handleDelete = async (blog_id: string) => {
        if (!blog_id) return
        if (!confirm("Are you sure you want to delete this post?")) return
        try { await deleteBlog(blog_id); setBlogs(blogs.filter(b => b._id !== blog_id)) } catch { }
    }

    const startEditing = (blog: Blog) => { setEditingBlog(blog); setIsEditorOpen(true) }

    const handleBlogUpdated = (updatedData: any) => {
        setBlogs(blogs.map(b => b._id === updatedData._id ? { ...b, ...updatedData } : b))
    }

    const handlePublish = async (blog_id: string) => {
        try {
            await updateBlog(blog_id, { status: "published" })
            setBlogs(blogs.map(b => b._id === blog_id ? { ...b, status: "published", publishedAt: new Date().toISOString() } : b))
        } catch { }
    }

    const handleUnpublish = async (blog_id: string) => {
        try {
            await updateBlog(blog_id, { status: "draft" })
            setBlogs(blogs.map(b => b._id === blog_id ? { ...b, status: "draft", publishedAt: undefined } : b))
        } catch { }
    }

    function PostCard({ blog }: { blog: Blog }) {
        const isPublished = blog.status === "published"
        return (
            <div
                className="rounded-xl text-left relative transition-all duration-300"
                style={{ backgroundColor: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.08)', padding: '16px' }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(180,150,90,0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
            >
                <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? "bg-emerald-400" : "bg-red-400"}`}
                        style={{ boxShadow: isPublished ? '0 0 8px 2px rgba(52,211,153,0.6)' : '0 0 8px 2px rgba(248,113,113,0.5)' }}
                    />
                    <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{isPublished ? "Live" : "Draft"}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <h3 className="text-base font-semibold text-foreground" style={{ paddingRight: '80px' }}>{blog.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {(() => { const c = stripMarkdownImages(blog.body); return c.length > 150 ? `${c.substring(0, 150)}...` : c })()}
                    </p>

                    <div className="flex items-center justify-between" style={{ paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                        <span className="text-xs text-muted-foreground">
                            {new Date(isPublished && blog.publishedAt ? blog.publishedAt : blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => isPublished ? handleUnpublish(blog._id) : handlePublish(blog._id)}
                                className="text-muted-foreground transition-all duration-200"
                                style={{ padding: '8px', borderRadius: '8px' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139,90,43,0.08)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                title={isPublished ? "Unpublish" : "Publish"}
                            >
                                {isPublished ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                                )}
                            </button>
                            <button
                                onClick={() => startEditing(blog)}
                                className="text-muted-foreground transition-all duration-200"
                                style={{ padding: '8px', borderRadius: '8px' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139,90,43,0.08)' }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                            </button>
                            <button
                                onClick={() => handleDelete(blog._id)}
                                className="text-muted-foreground transition-all duration-200"
                                style={{ padding: '8px', borderRadius: '8px' }}
                                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.08)'; e.currentTarget.style.color = '#dc2626' }}
                                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '' }}
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {loading ? (
                    <div className="text-center text-muted-foreground" style={{ padding: '40px 0' }}>
                        <div className="inline-block w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid var(--color-primary)', borderTopColor: 'transparent', marginBottom: '16px' }}></div>
                        <p>Loading posts...</p>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center" style={{ padding: '64px 0' }}>
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--color-muted)', marginBottom: '16px' }}><span className="text-2xl">📝</span></div>
                        <p className="text-muted-foreground text-lg">No posts yet. Create your first post!</p>
                    </div>
                ) : (
                    blogs.map(blog => <PostCard key={blog._id} blog={blog} />)
                )}
            </div>

            <BlogEditorOverlay
                isOpen={isEditorOpen}
                onClose={() => { setIsEditorOpen(false); setEditingBlog(null) }}
                editMode={true}
                blogId={editingBlog?._id}
                initialTitle={editingBlog?.title || ""}
                initialBody={editingBlog?.body || ""}
                onBlogUpdated={handleBlogUpdated}
            />
        </>
    )
}
