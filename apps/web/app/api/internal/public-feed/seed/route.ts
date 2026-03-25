import { NextRequest, NextResponse } from "next/server"
import { createPublicFeedPayload, type PublicBlog } from "@/lib/publicFeed"
import { getApiBaseUrl } from "@/lib/server/publicFeedServer"
import { writePublicFeedReplica } from "@/lib/server/publicFeedReplica"

function isAuthorized(req: NextRequest): boolean {
    const expectedSecret = process.env.PUBLIC_FEED_SYNC_SECRET
    if (!expectedSecret) return false
    const providedSecret = req.headers.get("x-feed-sync-secret")
    return providedSecret === expectedSecret
}

export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const apiBaseUrl = getApiBaseUrl()
    if (!apiBaseUrl) {
        return NextResponse.json({ message: "API base URL is not configured" }, { status: 500 })
    }

    try {
        const response = await fetch(`${apiBaseUrl}/blogs/public`, {
            method: "GET",
            headers: { Accept: "application/json" },
            cache: "no-store",
        })
        if (!response.ok) {
            return NextResponse.json(
                { message: `Failed to fetch public blogs from source: ${response.status}` },
                { status: 502 },
            )
        }

        const data: unknown = await response.json()
        const blogs = Array.isArray(data) ? (data as PublicBlog[]) : []
        const payload = createPublicFeedPayload(blogs)
        await writePublicFeedReplica(payload)

        return NextResponse.json(
            {
                ok: true,
                seeded: true,
                hash: payload.hash,
                cachedAt: payload.cachedAt,
                count: payload.blogs.length,
            },
            { status: 200 },
        )
    } catch {
        return NextResponse.json({ message: "Failed to seed public feed replica" }, { status: 500 })
    }
}
