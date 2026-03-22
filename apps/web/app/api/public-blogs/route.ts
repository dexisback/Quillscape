import { NextResponse } from "next/server"
import { loadPublicFeedPayload } from "@/lib/server/publicFeedServer"

export async function GET() {
    try {
        const payload = await loadPublicFeedPayload()
        return NextResponse.json(payload, { status: 200 })
    } catch {
        return NextResponse.json({ message: "Failed to fetch public blogs" }, { status: 502 })
    }
}
