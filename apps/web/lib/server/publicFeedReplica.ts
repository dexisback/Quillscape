import "server-only"

import {
    PUBLIC_FEED_KV_KEY,
    parsePublicFeedPayload,
    type PublicFeedPayload,
} from "@/lib/publicFeed"

type KvCommandResponse<T> = {
    result?: T
    error?: string
}

function getKvConfig() {
    const baseUrl = process.env.KV_REST_API_URL
    const token = process.env.KV_REST_API_TOKEN
    if (!baseUrl || !token) {
        throw new Error("KV_REST_API_URL or KV_REST_API_TOKEN is not configured")
    }
    return { baseUrl: baseUrl.replace(/\/+$/, ""), token }
}

async function executeKvCommand<T>(command: Array<string | number>): Promise<T | null> {
    const { baseUrl, token } = getKvConfig()
    const response = await fetch(baseUrl, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify(command),
    })

    if (!response.ok) {
        throw new Error(`KV command failed with status ${response.status}`)
    }

    const data = (await response.json()) as KvCommandResponse<T>
    if (data.error) {
        throw new Error(`KV command error: ${data.error}`)
    }
    return data.result ?? null
}

export async function readPublicFeedReplica(): Promise<PublicFeedPayload | null> {
    const raw = await executeKvCommand<string>(["GET", PUBLIC_FEED_KV_KEY])
    if (!raw || typeof raw !== "string") return null

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
    await executeKvCommand<string>(["SET", PUBLIC_FEED_KV_KEY, JSON.stringify(payload)])
}
