import "server-only"

import {
    PUBLIC_BLOGS_REVALIDATE_SECONDS,
    PUBLIC_BLOGS_TAG,
    createPublicFeedPayload,
    type PublicBlog,
    type PublicFeedPayload,
} from "@/lib/publicFeed"

function getApiBaseUrl(): string | null {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL
    if (!raw) return null
    return raw.replace(/\/+$/, "")
}

export async function loadPublicFeedPayload(): Promise<PublicFeedPayload> {
    const apiBaseUrl = getApiBaseUrl()
    if (!apiBaseUrl) {
        throw new Error("API base URL is not configured")
    }

    const response = await fetch(`${apiBaseUrl}/blogs/public`, {
        method: "GET",
        headers: { Accept: "application/json" },
        next: {
            tags: [PUBLIC_BLOGS_TAG],
            revalidate: PUBLIC_BLOGS_REVALIDATE_SECONDS,
        },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch public blogs: ${response.status}`)
    }

    const data: unknown = await response.json()
    const blogs = Array.isArray(data) ? (data as PublicBlog[]) : []
    return createPublicFeedPayload(blogs)
}
