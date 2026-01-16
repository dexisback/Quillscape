import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import StickyNotes from "./StickyNotes"
import gsap from "gsap"

export default function HeroSection() {
    const navigate = useNavigate()
    const headlineRef = useRef(null)

    useEffect(() => {
        if (headlineRef.current) {
            gsap.fromTo(headlineRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" })
        }
    }, [])

    const handleSignInWithQuillscape = () => {
        navigate("/auth")
    }

    const handleSignInWithGoogle = () => {
        // Placeholder - will be implemented later
        console.log("Google sign-in not yet implemented")
    }

    return (
        <section className="min-h-screen flex flex-col justify-center items-center pt-32 pb-16 px-6">
            {/* Headline */}
            <div ref={headlineRef} className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">Capture Your Ideas</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Write your thoughts, organize your inspiration, and share your stories with{" "}
                    <span className="font-semibold text-primary">Quillscape</span>
                </p>
            </div>

            {/* Main Grid */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                {/* Left Grid - Sticky Notes */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="h-96"
                >
                    <StickyNotes />
                </motion.div>

                {/* Right Grid - CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="flex flex-col gap-6"
                >
                    <div className="space-y-3">
                        <p className="text-sm uppercase tracking-widest text-muted-foreground font-medium">Your Journey</p>
                        <h2 className="text-3xl font-bold text-foreground">Get Started</h2>
                    </div>

                    {/* Button 1 - Sign In with Quillscape */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignInWithQuillscape}
                        className="w-full py-4 px-6 bg-primary text-primary-foreground rounded-full font-semibold text-lg transition-all duration-300 hover:shadow-lg"
                    >
                        Sign In with Quillscape
                    </motion.button>

                    {/* Divider */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-sm text-muted-foreground">or</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Button 2 - Sign In with Google */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSignInWithGoogle}
                        className="w-full py-4 px-6 bg-secondary text-secondary-foreground rounded-full font-semibold text-lg border-2 border-foreground/10 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Sign In with Google
                    </motion.button>
                </motion.div>
            </div>
        </section>
    )
}
