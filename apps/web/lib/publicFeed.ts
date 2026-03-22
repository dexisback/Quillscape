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
