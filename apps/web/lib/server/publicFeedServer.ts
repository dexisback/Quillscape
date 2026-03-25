import "server-only"

import {
    type PublicFeedPayload,
} from "@/lib/publicFeed"
import { readPublicFeedReplica } from "@/lib/server/publicFeedReplica"

export function getApiBaseUrl(): string | null {
    const raw = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL
    if (!raw) return null
    return raw.replace(/\/+$/, "")
}

export async function loadPublicFeedPayload(): Promise<PublicFeedPayload> {
    const payload = await readPublicFeedReplica()
    if (!payload) {
        throw new Error("Public feed replica is empty; seed it via /api/internal/public-feed/seed")
    }
    return payload
}
