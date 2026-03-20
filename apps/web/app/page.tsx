"use client"

import { useEffect } from "react"
import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import Footer from "@/components/landing/Footer"

export default function LandingPage() {
  useEffect(() => {
    // Non-blocking warm-up call so first paint is never delayed.
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/public`).catch(() => {})
  }, [])

  return (
    <main className="w-full min-h-screen">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  )
}
