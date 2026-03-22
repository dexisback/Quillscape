type Props = {
    title: string
    excerpt: string
    authorName: string
    avatarUrl: string
    readTime: string
    timeAgo: string
}

export default function FeedCardContent({
    title,
    excerpt,
    authorName,
    avatarUrl,
    readTime,
    timeAgo,
}: Props) {
    return (
        <>
            <div className="flex items-center gap-2.5" style={{ marginBottom: "12px" }}>
                <img src={avatarUrl} alt={authorName} className="w-7 h-7 rounded-full" style={{ backgroundColor: "var(--color-muted)" }} />
                <span className="text-sm font-medium text-foreground">{authorName}</span>
            </div>

            <h3 className="text-xl font-bold text-foreground text-left" style={{ marginBottom: "10px" }}>{title}</h3>

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
                <span className="rounded px-2.5 py-1 font-medium" style={{ backgroundColor: "var(--color-muted)" }}>{readTime}</span>
                <span className="rounded px-2.5 py-1 font-medium" style={{ backgroundColor: "var(--color-muted)" }}>{timeAgo}</span>
            </div>
        </>
    )
}
