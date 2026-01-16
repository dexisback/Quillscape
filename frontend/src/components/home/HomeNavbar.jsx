import { useEffect, useRef, useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { Moon, Sun, Home, FileText, Settings, User } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import gsap from "gsap"

export default function HomeNavbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const { logout } = useAuth()
    const navRef = useRef(null)
    const navContainerRef = useRef(null)
    const themeSwitchRef = useRef(null)
    const overlayRef = useRef(null)
    const [scrollProgress, setScrollProgress] = useState(0)
    const [isDark, setIsDark] = useState(false)
    const [isAnimating, setIsAnimating] = useState(false)

    const isActive = (path) => location.pathname === path

    useEffect(() => {
        const handleScroll = () => {
            // Calculate scroll progress from 0 to 1 over 150px of scrolling
            const progress = Math.min(window.scrollY / 150, 1)
            setScrollProgress(progress)
        }

        window.addEventListener("scroll", handleScroll)
        setIsDark(document.documentElement.classList.contains("dark"))

        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Use GSAP for smooth navbar animation based on scroll progress
    useEffect(() => {
        if (!navContainerRef.current) return

        // Interpolate values based on scroll progress
        const padding = 32 - (scrollProgress * 16) // 32px to 16px
        const maxWidth = 100 - (scrollProgress * 30) // 100% to 70%

        gsap.to(navContainerRef.current, {
            paddingLeft: `${padding}px`,
            paddingRight: `${padding}px`,
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

        // Create overlay for animated transition
        const overlay = document.createElement("div")
        overlay.className = "theme-transition-overlay"
        overlay.style.background = newIsDark
            ? "oklch(0.16 0.01 40)"
            : "oklch(0.96 0.025 75)"
        overlay.style.clipPath = "circle(0% at 100% 0%)"
        document.body.appendChild(overlay)
        overlayRef.current = overlay

        // Animate icon
        if (themeSwitchRef.current) {
            gsap.to(themeSwitchRef.current, {
                rotation: newIsDark ? 180 : -180,
                duration: 0.6,
                ease: "power2.inOut",
            })
        }

        // Animate overlay
        gsap.to(overlay, {
            clipPath: "circle(150% at 100% 0%)",
            duration: 0.6,
            ease: "power2.inOut",
            onComplete: () => {
                if (newIsDark) {
                    document.documentElement.classList.add("dark")
                } else {
                    document.documentElement.classList.remove("dark")
                }
                setIsDark(newIsDark)

                setTimeout(() => {
                    if (overlay && overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay)
                    }
                    setIsAnimating(false)
                }, 50)
            }
        })
    }

    const handleSignOut = async () => {
        await logout()
        navigate("/")
    }

    // Check if we should show compact mode (>50% scroll progress)
    const isCompact = scrollProgress > 0.5

    return (
        <nav
            ref={navRef}
            className="fixed top-0 left-0 right-0 z-50 py-4 px-4"
        >
            <div
                ref={navContainerRef}
                className="glass-nav rounded-3xl px-6 py-3 flex items-center justify-between mx-auto transition-all duration-300 ease-out"
                style={{ maxWidth: '100%' }}
            >
                {/* Logo Only - No text */}
                <Link to="/home" className="flex items-center">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">Q</span>
                    </div>
                </Link>

                {/* Navigation Links - Always visible, spacing adjusts with scroll */}
                <div
                    className="flex items-center transition-all duration-300 ease-out"
                    style={{ gap: `${28 - (scrollProgress * 12)}px` }} // gap from 28px to 16px
                >
                    <Link
                        to="/home"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/home') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Home"
                    >
                        <Home className="w-4 h-4" />
                        {!isCompact && <span>Home</span>}
                    </Link>
                    <Link
                        to="/post-blogs"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/post-blogs') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Post"
                    >
                        <FileText className="w-4 h-4" />
                        {!isCompact && <span>Post</span>}
                    </Link>
                    <Link
                        to="/user-settings"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/user-settings') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                        {!isCompact && <span>Settings</span>}
                    </Link>
                    <Link
                        to="/user-profile"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/user-profile') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Profile"
                    >
                        <User className="w-4 h-4" />
                        {!isCompact && <span>Profile</span>}
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    {!isCompact && (
                        <button
                            onClick={handleSignOut}
                            className="px-4 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                        >
                            Sign Out
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
