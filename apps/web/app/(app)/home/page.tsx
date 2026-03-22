import HomeFeedClient from "@/components/home/HomeFeedClient"
import { type PublicFeedPayload } from "@/lib/publicFeed"
import { loadPublicFeedPayload } from "@/lib/server/publicFeedServer"

export default async function HomePage() {
    let initialFeed: PublicFeedPayload | null = null
    try {
        initialFeed = await loadPublicFeedPayload()
    } catch {}

    return <HomeFeedClient initialFeed={initialFeed} />
}
