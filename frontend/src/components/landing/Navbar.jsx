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

        // Interpolate values based on scroll progress (50% to 40%)
        const maxWidth = 50 - (scrollProgress * 10)

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
            className="fixed top-0 left-0 right-0 z-50 py-4 px-8 transition-all duration-500 ease-in-out"
        >
            <div
                ref={navContainerRef}
                className="glass-nav rounded-full px-6 py-3 flex items-center justify-between mx-auto transition-all duration-500 ease-in-out"
                style={{ maxWidth: '50%' }}
            >
                {/* Logo - SVG Only */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 overflow-hidden" style={{ backgroundColor: '#d4a574' }}>
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                        <defs>
                            <mask id="cut">
                                <rect width="100" height="100" fill="white" />
                                <circle cx="52" cy="35" r="18" fill="black" />
                                <circle cx="65" cy="65" r="10" fill="black" />
                            </mask>
                        </defs>
                        <circle cx="50" cy="50" r="40" fill="#262626" mask="url(#cut)" />
                    </svg>
                </div>

                {/* Actions - Always visible */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleGetStarted}
                        className="px-5 py-2 rounded-full font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                        style={{ backgroundColor: '#3d3d3d', color: '#ffffff' }}
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
