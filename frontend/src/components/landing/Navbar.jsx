import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import gsap from "gsap"

export default function Navbar() {
    const navigate = useNavigate()
    const navRef = useRef(null)
    const navContainerRef = useRef(null)
    const themeSwitchRef = useRef(null)
    const overlayRef = useRef(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isDark, setIsDark] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll progress from 0 to 1 over 150px of scrolling
            const progress = Math.min(window.scrollY / 150, 1)
            setScrollProgress(progress)
        }

        const handleThemeChange = () => {
            setIsDark(document.documentElement.classList.contains("dark"))
        }

        window.addEventListener("scroll", handleScroll)
        handleThemeChange()

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Use GSAP for smooth navbar animation based on scroll progress
    useEffect(() => {
        if (!navContainerRef.current) return

        // Interpolate values based on scroll progress
        const maxWidth = 100 - (scrollProgress * 20) // 100% to 80%

        gsap.to(navContainerRef.current, {
            maxWidth: `${maxWidth}%`,
            duration: 0.1,
            ease: "none"
        })
    }, [scrollProgress])

    const toggleTheme = () => {
        if (isAnimating) return

        const isDarkNow = document.documentElement.classList.contains("dark")
        const newIsDark = !isDarkNow

        setIsAnimating(true)

        // Create and append overlay element for the animated transition
        const overlay = document.createElement("div")
        overlay.className = "theme-transition-overlay"
        overlay.style.background = newIsDark
            ? "oklch(0.16 0.01 40)" // Dark mode color
            : "oklch(0.96 0.025 75)" // Light mode color
        overlay.style.clipPath = "circle(0% at 100% 0%)"
        document.body.appendChild(overlay)
        overlayRef.current = overlay

        // Animate the icon
        if (themeSwitchRef.current) {
            gsap.to(themeSwitchRef.current, {
                rotation: newIsDark ? 180 : -180,
                duration: 0.6,
                ease: "power2.inOut",
            })
        }

        // Animate the overlay from top-right to fill the screen
        gsap.to(overlay, {
            clipPath: "circle(150% at 100% 0%)",
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                // Apply theme change at the end of animation
                if (newIsDark) {
                    document.documentElement.classList.add("dark")
                } else {
                    document.documentElement.classList.remove("dark")
                }
                setIsDark(newIsDark)

                // Remove overlay after theme is applied
                setTimeout(() => {
                    if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay)
                    }
                    setIsAnimating(false)
                }, 50)
            }
        })
    }

    const handleGetStarted = () => {
        navigate("/auth")
    }

    return (
        <nav
            ref={navRef}
            className="fixed top-0 left-0 right-0 z-50 py-6 px-8 transition-all duration-500 ease-in-out"
        >
            <div
                ref={navContainerRef}
                className="glass-nav rounded-3xl px-6 py-4 flex items-center justify-between mx-auto transition-all duration-500 ease-in-out"
                style={{ maxWidth: '100%' }}
            >
                {/* Logo and Name - Always visible */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-all duration-500">
                        <span className="text-primary-foreground font-bold text-lg">Q</span>
                    </div>
                    <span className="font-semibold text-foreground text-lg transition-all duration-500">Quillscape</span>
                </div>

                <div className="flex-1" />

                {/* Actions - Always visible */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleGetStarted}
                        className="px-5 py-2 rounded-full bg-accent text-accent-foreground font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                        Get Started
                    </button>

                    <button
                        ref={themeSwitchRef}
                        onClick={toggleTheme}
                        disabled={isAnimating}
                        className="p-2 rounded-lg hover:bg-muted transition-all duration-300 disabled:opacity-50"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-primary" />}
                    </button>
                </div>
            </div>
        </nav>
    )
}
