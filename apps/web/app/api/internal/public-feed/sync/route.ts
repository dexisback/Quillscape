import { NextRequest, NextResponse } from "next/server"
import { createPublicFeedPayload, type PublicBlog } from "@/lib/publicFeed"
import { writePublicFeedReplica } from "@/lib/server/publicFeedReplica"

type SyncRequestBody = {
    reason?: string
    blogs?: unknown
}

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

    try {
        const body = (await req.json()) as SyncRequestBody
        if (!Array.isArray(body.blogs)) {
            return NextResponse.json({ message: "Invalid request body: blogs must be an array" }, { status: 400 })
        }

        const payload = createPublicFeedPayload(body.blogs as PublicBlog[])
        
        // Non-blocking: log sync errors but don't fail the endpoint
        writePublicFeedReplica(payload).catch((error) => {
            console.error("[sync-endpoint] failed to write replica", {
                reason: body.reason,
                error: error instanceof Error ? error.message : String(error),
            })
        })

        return NextResponse.json(
            {
                ok: true,
                reason: typeof body.reason === "string" ? body.reason : "unknown",
                hash: payload.hash,
                cachedAt: payload.cachedAt,
                count: payload.blogs.length,
            },
            { status: 200 },
        )
    } catch (error) {
        console.error("[sync-endpoint] request processing error", error)
        return NextResponse.json({ message: "Failed to sync public feed replica" }, { status: 500 })
    }
}
