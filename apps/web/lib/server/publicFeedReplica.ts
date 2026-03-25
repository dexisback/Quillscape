import "server-only"
import { createClient } from "redis"

import {
    PUBLIC_FEED_KV_KEY,
    parsePublicFeedPayload,
    type PublicFeedPayload,
} from "@/lib/publicFeed"

let redisClient: ReturnType<typeof createClient> | null = null
let redisClientPromise: Promise<ReturnType<typeof createClient>> | null = null

function getRedisUrl(): string {
    const redisUrl = process.env.KV_REDIS_URL
    if (!redisUrl) {
        const msg = "KV_REDIS_URL is not configured. Vercel Redis must be connected to this project."
        console.error(`[publicFeedReplica] ${msg}`)
        throw new Error(msg)
    }
    return redisUrl
}

async function getRedisClient(): Promise<ReturnType<typeof createClient>> {
    if (redisClient?.isOpen) return redisClient
    if (redisClientPromise) return redisClientPromise

    const client = createClient({ url: getRedisUrl() })
    client.on("error", (error) => {
        console.error("[publicFeedReplica] redis client error", error)
    })

    redisClientPromise = client.connect()
        .then(() => {
            redisClient = client
            console.log("[publicFeedReplica] redis client connected")
            return client
        })
        .catch((error) => {
            redisClientPromise = null
            console.error("[publicFeedReplica] failed to connect redis client", error)
            throw error
        })

    return redisClientPromise
}

export async function readPublicFeedReplica(): Promise<PublicFeedPayload | null> {
    const client = await getRedisClient()
    const raw = await client.get(PUBLIC_FEED_KV_KEY)
    if (!raw) return null

    let parsed: unknown
    try {
        parsed = JSON.parse(raw) as unknown
    } catch {
        throw new Error("Invalid JSON stored in public feed replica")
    }

    const payload = parsePublicFeedPayload(parsed)
    if (!payload) {
        throw new Error("Invalid public feed payload stored in replica")
    }
    return payload
}

export async function writePublicFeedReplica(payload: PublicFeedPayload): Promise<void> {
    const client = await getRedisClient()
    await client.set(PUBLIC_FEED_KV_KEY, JSON.stringify(payload))
}
