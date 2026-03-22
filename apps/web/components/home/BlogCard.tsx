"use client"
import FeedCardContent from "@/components/home/FeedCardContent"
import { formatTimeAgo, getReadTimeMinutes, stripMarkdownImages } from "@/lib/publicFeed"

type Blog = {
    _id?: string
    title: string
    body?: string
    excerpt?: string
    author_email?: string
    author?: string
    author_name?: string
    createdAt?: string
    publishedAt?: string
}

type Props = {
    blog: Blog
    calculateReadTime?: (body: string) => number
    formatTimeAgo?: (date: string) => string
    onOpenBlog: (blog: Blog) => void
}

export default function BlogCard({ blog, calculateReadTime, formatTimeAgo, onOpenBlog }: Props) {
    const cleanBody = stripMarkdownImages(blog.body || "")
    const readTime = calculateReadTime ? calculateReadTime(blog.body || "") : getReadTimeMinutes(blog.body || "")
    const timeAgo = formatTimeAgo ? formatTimeAgo(blog.createdAt || "") : formatTimeAgoDefault(blog.createdAt || "") 
    const excerpt = cleanBody ? (cleanBody.length > 150 ? `${cleanBody.substring(0, 150)}...` : cleanBody) : blog.excerpt || ""

    const authorEmail = blog.author_email || blog.author || "Anonymous"
    const authorName = blog.author_name || authorEmail.split("@")[0]
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorEmail)}`

    return (
        <div
            onClick={() => onOpenBlog(blog)}
            className="rounded-xl cursor-pointer text-left transition-all duration-300"
            style={{
                backgroundColor: "var(--color-card)",
                border: "1px solid var(--color-border)",
                padding: "18px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 12px rgba(139,90,43,0.06)"
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)"
                e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.45), 0 10px 24px rgba(139,90,43,0.14)"
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)"
                e.currentTarget.style.boxShadow = "inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 12px rgba(139,90,43,0.06)"
            }}
        >
            <FeedCardContent
                title={blog.title}
                excerpt={excerpt}
                authorName={authorName}
                avatarUrl={avatarUrl}
                readTime={`${readTime} min read`}
                timeAgo={timeAgo}
            />
        </div>
    )
}

function formatTimeAgoDefault(date: string): string {
    if (!date) return "Recently"
    return formatTimeAgo(date)
}
