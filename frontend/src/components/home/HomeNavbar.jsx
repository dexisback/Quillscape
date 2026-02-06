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

        // Responsive base widths
        const isMobile = window.innerWidth < 640
        const isTablet = window.innerWidth >= 640 && window.innerWidth < 768
        const baseWidth = isMobile ? 96 : isTablet ? 90 : 70
        const shrinkAmount = isMobile ? 0 : 15

        // Interpolate values based on scroll progress
        const padding = 24 - (scrollProgress * 8)
        const width = baseWidth - (scrollProgress * shrinkAmount)

        gsap.to(navContainerRef.current, {
            paddingLeft: `${padding}px`,
            paddingRight: `${padding}px`,
            width: `${width}%`,
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

        // Animate icon - full spin that ends at starting position
        if (themeSwitchRef.current) {
            gsap.fromTo(themeSwitchRef.current,
                { rotation: 0 },
                { rotation: 360, duration: 0.6, ease: "power2.inOut" }
            )
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
            className="fixed top-0 left-0 right-0 z-50 py-3 md:py-4 px-2 md:px-4"
        >
            <div
                ref={navContainerRef}
                className="glass-nav rounded-full px-4 md:px-8 py-2.5 md:py-3 flex items-center justify-between mx-auto transition-all duration-300 ease-out relative"
                style={{ width: '70%' }}
            >
                {/* Logo Only - SVG */}
                <Link to="/home" className="flex items-center z-10">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#d4a574' }}>
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6">
                            <defs>
                                <mask id="home-cut">
                                    <rect width="100" height="100" fill="white" />
                                    <circle cx="52" cy="35" r="18" fill="black" />
                                    <circle cx="65" cy="65" r="10" fill="black" />
                                </mask>
                            </defs>
                            <circle cx="50" cy="50" r="40" fill="#262626" mask="url(#home-cut)" />
                        </svg>
                    </div>
                </Link>

                {/* Navigation Links - Absolutely centered */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4 md:gap-6 transition-all duration-300 ease-out"
                >
                    <Link
                        to="/home"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/home') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Home"
                    >
                        <Home className="w-4 h-4" />
                        <span className="hidden md:inline">{!isCompact && 'Home'}</span>
                    </Link>
                    <Link
                        to="/post-blogs"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/post-blogs') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Post"
                    >
                        <FileText className="w-4 h-4" />
                        <span className="hidden md:inline">{!isCompact && 'Post'}</span>
                    </Link>
                    <Link
                        to="/user-settings"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/user-settings') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Settings"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden md:inline">{!isCompact && 'Settings'}</span>
                    </Link>
                    <Link
                        to="/user-profile"
                        className={`flex items-center gap-1.5 font-medium text-sm transition-colors ${isActive('/user-profile') ? 'text-accent' : 'text-foreground hover:text-accent'
                            }`}
                        title="Profile"
                    >
                        <User className="w-4 h-4" />
                        <span className="hidden md:inline">{!isCompact && 'Profile'}</span>
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-3">
                    {!isCompact && (
                        <button
                            onClick={handleSignOut}
                            className="hidden sm:block px-4 md:px-5 py-1.5 md:py-2 rounded-full font-medium text-xs md:text-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                            style={{ backgroundColor: '#3d3d3d', color: '#ffffff' }}
                        >
                            Sign Out
                        </button>
                    )}

                    <button
                        ref={themeSwitchRef}
                        onClick={toggleTheme}
                        disabled={isAnimating}
                        className="p-1.5 md:p-2 rounded-lg hover:bg-muted transition-all duration-300 disabled:opacity-50"
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun className="w-4 h-4 md:w-5 md:h-5 text-accent" /> : <Moon className="w-4 h-4 md:w-5 md:h-5 text-primary" />}
                    </button>
                </div>
            </div>
        </nav>
    )
}
