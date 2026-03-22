export type PublicBlog = {
    _id: string
    title: string
    body: string
    author_name?: string
    author_email?: string
    status?: string
    publishedAt?: string
    createdAt: string
    updatedAt?: string
}

export type PublicFeedPayload = {
    blogs: PublicBlog[]
    hash: string
    cachedAt: string
}

export const PUBLIC_BLOGS_TAG = "public-blogs"
export const PUBLIC_BLOGS_REVALIDATE_SECONDS = 60 * 60 * 24
export const PUBLIC_FEED_SNAPSHOT_KEY = "public_feed_v1"

function stableBlogSnapshot(blogs: PublicBlog[]): string {
    return JSON.stringify(
        blogs.map((blog) => ({
            _id: blog._id,
            title: blog.title,
            body: blog.body,
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt ?? "",
            publishedAt: blog.publishedAt ?? "",
            author_name: blog.author_name ?? "",
            author_email: blog.author_email ?? "",
            status: blog.status ?? "",
        })),
    )
}

function fnv1a(input: string): string {
    let hash = 2166136261
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i)
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24)
    }
    return (hash >>> 0).toString(16).padStart(8, "0")
}

export function computePublicFeedHash(blogs: PublicBlog[]): string {
    return fnv1a(stableBlogSnapshot(blogs))
}

export function createPublicFeedPayload(blogs: PublicBlog[]): PublicFeedPayload {
    return {
        blogs,
        hash: computePublicFeedHash(blogs),
        cachedAt: new Date().toISOString(),
    }
}

export function parsePublicFeedPayload(value: unknown): PublicFeedPayload | null {
    if (!value || typeof value !== "object") return null

    const payload = value as Record<string, unknown>
    if (!Array.isArray(payload.blogs)) return null
    if (typeof payload.hash !== "string") return null
    if (typeof payload.cachedAt !== "string") return null

    return {
        blogs: payload.blogs as PublicBlog[],
        hash: payload.hash,
        cachedAt: payload.cachedAt,
    }
}

export function readPublicFeedSnapshot(): PublicFeedPayload | null {
    if (typeof window === "undefined") return null

    try {
        const raw = window.localStorage.getItem(PUBLIC_FEED_SNAPSHOT_KEY)
        if (!raw) return null

        const parsed = parsePublicFeedPayload(JSON.parse(raw) as unknown)
        if (!parsed) {
            window.localStorage.removeItem(PUBLIC_FEED_SNAPSHOT_KEY)
            return null
        }
        return parsed
    } catch {
        return null
    }
}

export function writePublicFeedSnapshot(snapshot: PublicFeedPayload) {
    if (typeof window === "undefined") return
    try {
        window.localStorage.setItem(PUBLIC_FEED_SNAPSHOT_KEY, JSON.stringify(snapshot))
    } catch {}
}

export function isHardReloadNavigation(): boolean {
    if (typeof window === "undefined") return false

    const entry = window.performance.getEntriesByType("navigation")[0]
    if (entry) {
        const timing = entry as PerformanceNavigationTiming
        return timing.type === "reload"
    }

    const legacy = window.performance as Performance & { navigation?: { type?: number } }
    return legacy.navigation?.type === 1
}

export function stripMarkdownImages(text: string): string {
    if (!text) return ""
    let result = ""
    let i = 0
    while (i < text.length) {
        if (text[i] === "!" && text[i + 1] === "[") {
            let j = i + 2
            while (j < text.length && text[j] !== "]") j += 1
            if (text[j] === "]" && text[j + 1] === "(") {
                let depth = 1
                let k = j + 2
                while (k < text.length && depth > 0) {
                    if (text[k] === "(") depth += 1
                    else if (text[k] === ")") depth -= 1
                    k += 1
                }
                i = k
                continue
            }
        }
        if (text.substring(i, i + 11) === "data:image/") {
            while (i < text.length && text[i] !== " " && text[i] !== "\n" && text[i] !== ")") i += 1
            continue
        }
        result += text[i]
        i += 1
    }

    let cleaned = ""
    let lastWasSpace = false
    for (const c of result) {
        if (c === " " || c === "\n" || c === "\t") {
            if (!lastWasSpace) {
                cleaned += " "
                lastWasSpace = true
            }
        } else {
            cleaned += c
            lastWasSpace = false
        }
    }
    return cleaned.trim()
}

export function getReadTimeMinutes(body: string): number {
    const wordCount = body.trim().split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / 200))
}

export function formatTimeAgo(timestamp: string): string {
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
