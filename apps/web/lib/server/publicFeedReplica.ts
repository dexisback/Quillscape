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
        throw new Error("KV_REDIS_URL is not configured")
    }
    return redisUrl
}

async function getRedisClient(): Promise<ReturnType<typeof createClient>> {
    if (redisClient?.isOpen) return redisClient
    if (redisClientPromise) return redisClientPromise

    const client = createClient({ url: getRedisUrl() })
    client.on("error", (error) => {
        console.error("redis client error", error)
    })

    redisClientPromise = client.connect()
        .then(() => {
            redisClient = client
            return client
        })
        .catch((error) => {
            redisClientPromise = null
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
