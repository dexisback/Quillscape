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
            style={{ backgroundColor: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.08)', padding: '16px' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(180,150,90,0.15)' }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none' }}
        >
            <div className="flex items-center gap-2" style={{ marginBottom: '10px' }}>
                <img src={avatarUrl} alt={authorName} className="w-6 h-6 rounded-full" style={{ backgroundColor: 'var(--color-muted)' }} />
                <span className="text-sm font-medium text-foreground">{authorName}</span>
            </div>

            <h3 className="text-xl font-bold text-foreground text-left" style={{ marginBottom: '8px' }}>{blog.title}</h3>

            <p className="text-muted-foreground text-sm leading-relaxed text-left" style={{ marginBottom: '16px', backgroundColor: 'rgba(139,90,43,0.06)', borderRadius: '8px', padding: '10px 12px' }}>{excerpt}</p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span style={{ backgroundColor: 'rgba(139,90,43,0.08)', padding: '3px 8px', borderRadius: '4px' }}>{readTime} min read</span>
                <span style={{ backgroundColor: 'rgba(139,90,43,0.08)', padding: '3px 8px', borderRadius: '4px' }}>{timeAgo}</span>
            </div>
        </div>
    )
}
