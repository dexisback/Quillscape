"use client"

import { useEffect } from "react"
import {
    parsePublicFeedPayload,
    readPublicFeedSnapshot,
    writePublicFeedSnapshot,
} from "@/lib/publicFeed"

let didWarmPublicFeed = false

export default function PublicFeedWarmup() {
    useEffect(() => {
        if (didWarmPublicFeed) return
        didWarmPublicFeed = true

        if (readPublicFeedSnapshot()) return

        void fetch("/api/public-blogs", { method: "GET" })
            .then(async (response) => {
                if (!response.ok) return
                const payload = parsePublicFeedPayload((await response.json()) as unknown)
                if (!payload) return
                writePublicFeedSnapshot(payload)
            })
            .catch(() => {})
    }, [])

    return null
}
