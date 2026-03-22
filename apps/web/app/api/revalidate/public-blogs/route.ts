import { revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { PUBLIC_BLOGS_TAG } from "@/lib/publicFeed"

function getRequestSecret(req: NextRequest): string {
    const secretFromHeader = req.headers.get("x-revalidate-secret")
    if (secretFromHeader) return secretFromHeader

    const authHeader = req.headers.get("authorization")
    if (!authHeader) return ""

    const [scheme, token] = authHeader.split(" ")
    if (scheme?.toLowerCase() !== "bearer" || !token) return ""
    return token
}

export async function POST(req: NextRequest) {
    const expectedSecret = process.env.REVALIDATE_SECRET
    if (!expectedSecret) {
        return NextResponse.json({ message: "REVALIDATE_SECRET is not configured" }, { status: 500 })
    }

    const secret = getRequestSecret(req)
    if (secret !== expectedSecret) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    revalidateTag(PUBLIC_BLOGS_TAG, "max")
    return NextResponse.json(
        {
            revalidated: true,
            tag: PUBLIC_BLOGS_TAG,
            revalidatedAt: new Date().toISOString(),
        },
        { status: 200 },
    )
}
