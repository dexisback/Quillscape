import { NextResponse } from "next/server"
import { loadPublicFeedPayload } from "@/lib/server/publicFeedServer"

export async function GET() {
    try {
        const payload = await loadPublicFeedPayload()
        return NextResponse.json(
            { warmed: true, hash: payload.hash, cachedAt: payload.cachedAt },
            { status: 200 },
        )
    } catch {
        return NextResponse.json({ warmed: false }, { status: 502 })
    }
}
