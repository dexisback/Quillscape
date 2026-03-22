import FeedCardContent from "@/components/home/FeedCardContent"
import {
    formatTimeAgo,
    getReadTimeMinutes,
    stripMarkdownImages,
} from "@/lib/publicFeed"
import { loadPublicFeedPayload } from "@/lib/server/publicFeedServer"

export const revalidate = 86400

export default async function FeedPage() {
    let blogs: Awaited<ReturnType<typeof loadPublicFeedPayload>>["blogs"] = []
    try {
        const payload = await loadPublicFeedPayload()
        blogs = payload.blogs
    } catch {}

    return (
        <main className="app-main-shell min-h-screen bg-background">
            <div className="paper-main" style={{ maxWidth: "768px", margin: "0 auto", padding: "32px 28px" }}>
                <div className="text-left" style={{ marginBottom: "32px" }}>
                    <p className="text-lg text-muted-foreground inter-tight">
                        <span className="relative inline-block marker-wrap">
                            <span className="relative font-medium text-neutral-800 marker-text">Discover stories</span>
                        </span>
                        {" "}from writers across{" "}
                        <span className="font-semibold text-primary">Quillscape</span>
                    </p>
                </div>

                {blogs.length === 0 ? (
                    <div className="text-center" style={{ padding: "64px 0" }}>
                        <p className="text-muted-foreground text-lg">No posts yet.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {blogs.map((blog) => {
                            const cleanBody = stripMarkdownImages(blog.body || "")
                            const excerpt = cleanBody ? (cleanBody.length > 150 ? `${cleanBody.substring(0, 150)}...` : cleanBody) : ""
                            const authorEmail = blog.author_email || "Anonymous"
                            const authorName = blog.author_name || authorEmail.split("@")[0]
                            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorEmail)}`
                            const readTime = `${getReadTimeMinutes(blog.body || "")} min read`
                            const timeAgo = formatTimeAgo(blog.createdAt || blog.publishedAt || new Date().toISOString())

                            return (
                                <article
                                    key={blog._id}
                                    className="rounded-xl text-left transition-all duration-300"
                                    style={{
                                        backgroundColor: "var(--color-card)",
                                        border: "1px solid var(--color-border)",
                                        padding: "18px",
                                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 12px rgba(139,90,43,0.06)",
                                    }}
                                >
                                    <FeedCardContent
                                        title={blog.title}
                                        excerpt={excerpt}
                                        authorName={authorName}
                                        avatarUrl={avatarUrl}
                                        readTime={readTime}
                                        timeAgo={timeAgo}
                                    />
                                </article>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    )
}
