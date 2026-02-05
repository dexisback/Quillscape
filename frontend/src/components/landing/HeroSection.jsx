import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import StickyNotes from "./StickyNotes"
import gsap from "gsap"
import { auth } from "../../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

export default function HeroSection() {
    const navigate = useNavigate()
    const headlineRef = useRef(null)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        if (headlineRef.current) {
            gsap.fromTo(headlineRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 1, ease: "power2.out" })
        }
    }, [])

    const handleSignInWithQuillscape = () => {
        navigate("/auth")
    }

    const handleSignInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            navigate("/home")
            return result.user
        } catch (err) {
        }
    }

    return (
        <section className="min-h-screen flex flex-col justify-center items-center pt-28 pb-12 px-6">
            {/* Headline */}
            <div ref={headlineRef} className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Write. Publish. Share.</h1>
                <p className="text-base text-muted-foreground max-w-xl mx-auto">
                    Or{" "}
                    <span className="relative inline-block">
                        <span
                            className="absolute inset-0 -skew-y-1 rounded-sm"
                            style={{ backgroundColor: '#fde047', zIndex: -1, transform: 'skewY(-1deg) scaleX(1.05)', top: '2px', bottom: '2px' }}
                        />
                        <span className="relative font-medium text-neutral-800" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}>stay anon</span>
                    </span>
                    {" "}— save as drafts{" "}
                    <span className="font-semibold text-primary">@Quillscape</span>
                </p>
            </div>

            {/* Main Grid */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Grid - Sticky Notes */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="h-72 mt-8"
                >
                    <StickyNotes />
                </motion.div>

                {/* Right Grid - CTA Card */}
                <motion.div
                    initial={{ opacity: 0, x: 50, rotate: -1.5 }}
                    whileInView={{ opacity: 1, x: 0, rotate: -1.5 }}
                    whileHover={{ scale: 1.02, rotate: 0 }}
                    transition={{ duration: 0.4 }}
                    viewport={{ once: true }}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    className="relative flex flex-col items-center justify-center gap-8 px-8 py-20 mt-4 cursor-pointer"
                    style={{
                        backgroundColor: '#fef08a',
                        boxShadow: '0 10px 24px rgba(0,0,0,0.12), 3px 6px 12px rgba(0,0,0,0.1)',
                        borderRadius: '0.75rem',
                        backgroundImage: `
                            repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 8px,
                                rgba(0,0,0,0.02) 8px,
                                rgba(0,0,0,0.02) 9px
                            ),
                            repeating-linear-gradient(
                                -45deg,
                                transparent,
                                transparent 8px,
                                rgba(0,0,0,0.015) 8px,
                                rgba(0,0,0,0.015) 9px
                            )
                        `,
                    }}
                >
                    {/* Pin - Inside the card */}
                    <div
                        className="absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-black/20 rounded-full" />
                    </div>

                    {/* Text with styled "today" */}
                    <div className="relative">
                        <p className="text-neutral-800 font-medium text-lg">
                            <span style={{ letterSpacing: '-0.03em' }}>Start writing</span>{" "}
                            <span className="relative italic">
                                today
                                <motion.svg
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={isHovered ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                                    transition={{ duration: 0.4, ease: "easeOut" }}
                                    className="absolute -bottom-2 left-0 w-full h-3"
                                    viewBox="0 0 60 10"
                                    fill="none"
                                    stroke="#1a1a1a"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                >
                                    <motion.path
                                        d="M2 7 Q30 2, 58 7"
                                        initial={{ pathLength: 0 }}
                                        animate={isHovered ? { pathLength: 1 } : { pathLength: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                    />
                                </motion.svg>
                            </span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSignInWithQuillscape}
                            className="py-3 px-8 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg"
                            style={{ backgroundColor: '#3d3d3d', color: '#ffffff' }}
                        >
                            Quillscape
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleSignInWithGoogle}
                            className="py-3 px-8 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg flex items-center gap-2"
                            style={{ backgroundColor: '#fffdf7', color: '#3d3d3d', border: '1px solid rgba(0,0,0,0.1)' }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
