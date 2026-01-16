import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Moon, Sun } from "lucide-react"
import gsap from "gsap"

export default function Navbar() {
    const navigate = useNavigate()
    const navRef = useRef(null)
    const themeSwitchRef = useRef(null)
    const overlayRef = useRef(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [isDark, setIsDark] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            const scrolled = window.scrollY > 50
            if (scrolled !== isScrolled) {
                setIsScrolled(scrolled)
            }
        }

        const handleThemeChange = () => {
            setIsDark(document.documentElement.classList.contains("dark"))
        }

        window.addEventListener("scroll", handleScroll)
        handleThemeChange()

        return () => window.removeEventListener("scroll", handleScroll)
    }, [isScrolled])

    const toggleTheme = () => {
        if (isAnimating) return // Prevent multiple clicks during animation

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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled ? "py-3 px-6" : "py-6 px-8"
                }`}
        >
            <div
                className={`glass-nav rounded-3xl px-6 py-4 flex items-center justify-between transition-all duration-500 ease-in-out ${isScrolled ? "max-w-fit" : "max-w-full"
                    } ${isScrolled ? "mx-auto" : ""}`}
            >
                {/* Logo and Name */}
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transition-all duration-500">
                        <span className="text-primary-foreground font-bold text-lg">Q</span>
                    </div>
                    {!isScrolled && (
                        <span className="font-semibold text-foreground text-lg transition-all duration-500">Quillscape</span>
                    )}
                </div>

                {!isScrolled && <div className="flex-1" />}

                <div className="flex items-center gap-4">
                    {!isScrolled && (
                        <button
                            onClick={handleGetStarted}
                            className="px-5 py-2 rounded-full bg-accent text-accent-foreground font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            Get Started
                        </button>
                    )}

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
