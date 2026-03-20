import Navbar from "@/components/landing/Navbar"
import HeroSection from "@/components/landing/HeroSection"
import Footer from "@/components/landing/Footer"

export default async function LandingPage() {
  // Warm the Render backend to prevent cold-start delays
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/public`, {
      cache: "no-store",
    })
  } catch {
    // Non-critical — page still renders if backend is cold
  }

  return (
    <main className="w-full min-h-screen">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  )
}
