"use client"

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

export default function BlogCard({ blog, calculateReadTime, formatTimeAgo, onOpenBlog }: Props) {
    const cleanBody = stripMarkdownImages(blog.body || "")
    const readTime = calculateReadTime ? calculateReadTime(blog.body || "") : 1
    const timeAgo = formatTimeAgo ? formatTimeAgo(blog.createdAt || "") : blog.publishedAt || "Recently"
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
            <div className="flex items-center gap-2.5" style={{ marginBottom: "12px" }}>
                <img src={avatarUrl} alt={authorName} className="w-7 h-7 rounded-full" style={{ backgroundColor: "var(--color-muted)" }} />
                <span className="text-sm font-medium text-foreground">{authorName}</span>
            </div>

            <h3 className="text-xl font-bold text-foreground text-left" style={{ marginBottom: "10px" }}>{blog.title}</h3>

            <p
                className="text-muted-foreground text-sm leading-relaxed text-left"
                style={{ marginBottom: "14px" }}
            >
                {excerpt}
            </p>

            <div
                className="flex items-center justify-between text-xs text-muted-foreground"
                style={{ paddingTop: "12px", borderTop: "1px solid rgba(139,90,43,0.14)" }}
            >
                <span className="rounded px-2.5 py-1 font-medium" style={{ backgroundColor: "var(--color-muted)" }}>{readTime} min read</span>
                <span className="rounded px-2.5 py-1 font-medium" style={{ backgroundColor: "var(--color-muted)" }}>{timeAgo}</span>
            </div>
        </div>
    )
}
