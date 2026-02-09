function stripMarkdownImages(text) {
    if (!text) return ''
    let result = ''
    let i = 0
    while (i < text.length) {
        if (text[i] === '!' && text[i + 1] === '[') {
            let j = i + 2
            while (j < text.length && text[j] !== ']') j++
            if (text[j] === ']' && text[j + 1] === '(') {
                let depth = 1
                let k = j + 2
                while (k < text.length && depth > 0) {
                    if (text[k] === '(') depth++
                    else if (text[k] === ')') depth--
                    k++
                }
                i = k
                continue
            }
        }
        if (text.substring(i, i + 5) === 'data:' && text.substring(i, i + 11) === 'data:image/') {
            while (i < text.length && text[i] !== ' ' && text[i] !== '\n' && text[i] !== ')') i++
            continue
        }
        result += text[i]
        i++
    }
    let cleaned = ''
    let lastWasSpace = false
    for (let c of result) {
        if (c === ' ' || c === '\n' || c === '\t') {
            if (!lastWasSpace) { cleaned += ' '; lastWasSpace = true }
        } else {
            cleaned += c
            lastWasSpace = false
        }
    }
    return cleaned.trim()
}


export default function BlogCard({ blog, calculateReadTime, formatTimeAgo, onOpenBlog }) {
    const cleanBody = stripMarkdownImages(blog.body || '')
    const readTime = calculateReadTime ? calculateReadTime(blog.body) : 1
    const timeAgo = formatTimeAgo ? formatTimeAgo(blog.createdAt) : blog.publishedAt || "Recently"
    const excerpt = cleanBody
        ? (cleanBody.length > 150 ? `${cleanBody.substring(0, 150)}...` : cleanBody)
        : blog.excerpt || ""

    const authorEmail = blog.author_email || blog.author || "Anonymous"
    const authorName = blog.author_name || authorEmail.split('@')[0]
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorEmail)}`

    return (

        <div
            onClick={() => { onOpenBlog(blog) }}
            className="bg-card border border-border rounded-xl p-3 hover:shadow-[0_4px_20px_rgba(180,150,90,0.15)] dark:hover:shadow-[0_4px_24px_rgba(200,170,100,0.12)] transition-all duration-300 hover:border-accent/40 cursor-pointer text-left"
        >
            {/* Author at top - username not email */}
            <div className="flex items-center gap-2 mb-3">
                <img
                    src={avatarUrl}
                    alt={authorName}
                    className="w-6 h-6 rounded-full bg-muted"
                />
                <span className="text-sm font-medium text-foreground">{authorName}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-foreground mb-2 text-left">{blog.title}</h3>

            {/* Excerpt */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 bg-muted/30 rounded-lg p-3 text-left">
                {excerpt}
            </p>

            {/* Footer: mins read + published on */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="bg-muted/50 px-2 py-1 rounded">{readTime} min read</span>
                <span className="bg-muted/50 px-2 py-1 rounded">{timeAgo}</span>
            </div>
        </div>
    )
}
