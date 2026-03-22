"use client"

import { useEffect } from "react"
import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import Footer from "@/components/landing/Footer"
import { parsePublicFeedPayload, writePublicFeedSnapshot } from "@/lib/publicFeed"

export default function LandingPage() {
  useEffect(() => {
    // Non-blocking warm-up + snapshot seed via Next cached endpoint.
    void fetch("/api/public-blogs")
      .then(async (response) => {
        if (!response.ok) return
        const payload = parsePublicFeedPayload((await response.json()) as unknown)
        if (payload) writePublicFeedSnapshot(payload)
      })
      .catch(() => {})
  }, [])

  return (
    <main className="w-full min-h-screen">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  )
}
