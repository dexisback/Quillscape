import { useEffect } from 'react'
import Navbar from '../components/landing/Navbar'
import HeroSection from '../components/landing/HeroSection'
import Footer from '../components/landing/Footer'

export default function Landing() {
  useEffect(() => {
    fetch(import.meta.env.VITE_API_BASE_URL + '/blogs/public').catch(() => { })
  }, [])

  return (
    <main className="w-full min-h-screen">
      <Navbar />
      <HeroSection />
      <Footer />
    </main>
  )
}