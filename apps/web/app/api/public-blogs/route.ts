import { NextResponse } from "next/server"
import {
    PUBLIC_BLOGS_REVALIDATE_SECONDS,
    PUBLIC_BLOGS_TAG,
    createPublicFeedPayload,
    type PublicBlog,
} from "@/lib/publicFeed"

function getApiBaseUrl(): string | null {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL
    if (!raw) return null
    return raw.replace(/\/+$/, "")
}

export async function GET() {
    const apiBaseUrl = getApiBaseUrl()
    if (!apiBaseUrl) {
        return NextResponse.json({ message: "API base URL is not configured" }, { status: 500 })
    }

    try {
        const response = await fetch(`${apiBaseUrl}/blogs/public`, {
            method: "GET",
            headers: { Accept: "application/json" },
            next: {
                tags: [PUBLIC_BLOGS_TAG],
                revalidate: PUBLIC_BLOGS_REVALIDATE_SECONDS,
            },
        })

        if (!response.ok) {
            return NextResponse.json(
                { message: "Failed to fetch public blogs" },
                { status: response.status },
            )
        }

        const data: unknown = await response.json()
        const blogs = Array.isArray(data) ? (data as PublicBlog[]) : []

        return NextResponse.json(createPublicFeedPayload(blogs), { status: 200 })
    } catch {
        return NextResponse.json({ message: "Failed to fetch public blogs" }, { status: 502 })
    }
}
