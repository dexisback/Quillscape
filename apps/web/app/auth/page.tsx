"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    type User,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { syncUserWithMongoDB } from "@/lib/api/user"
import { useAuth } from "@/context/AuthContext"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import gsap from "gsap"

const reviews = [
    { text: "Finally, a writing app that just gets out of the way. Pure focus.", author: "— A friend" },
    { text: "The aesthetic is unmatched. Makes me want to write more.", author: "— Beta tester" },
    { text: "Anonymous drafts? Game changer for journaling.", author: "— Early user" },
]

type AuthReview = (typeof reviews)[number]

/** Large vertical review cards (original /auth layout — not the hero StickyNotes). */
function AuthReviewCard({ review, index }: { review: AuthReview; index: number }) {
    const colors = ["#fef3c7", "#fef08a", "#fde047"]

    return (
        <motion.div
            className="auth-review-card w-full cursor-default rounded-2xl"
            style={{ backgroundColor: colors[index % 3], boxShadow: "0 6px 16px rgba(0,0,0,0.07)" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * index, ease: "easeOut" }}
            whileHover={{ y: -4, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
        >
            <p className="mb-1.5 text-sm font-medium italic leading-snug text-neutral-800 md:leading-normal dark:text-neutral-900">
                &ldquo;{review.text}&rdquo;
            </p>
            <p className="text-xs text-neutral-600 md:text-sm dark:text-neutral-700">{review.author}</p>
        </motion.div>
    )
}

function firebaseAuthCode(err: unknown): string {
    if (typeof err === "object" && err !== null && "code" in err) {
        const c = (err as { code?: unknown }).code
        return typeof c === "string" ? c : ""
    }
    return ""
}

async function persistSessionCookie(user: User) {
    const token = await user.getIdToken()
    await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
    })
}

export default function Auth() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [isSigningUp, setIsSigningUp] = useState(false)
    const formRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (user && !authLoading) router.replace("/home")
    }, [user, authLoading, router])

    useEffect(() => {
        if (formRef.current) {
            gsap.fromTo(
                formRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            )
        }
    }, [])

    const handleLogin = async () => {
        if (!email || !password) { setError("Please enter both email and password"); return }
        if (!auth) return
        setIsAuthenticating(true)
        setError("")
        try {
            const result = await signInWithEmailAndPassword(auth, email, password)
            await persistSessionCookie(result.user)
            syncUserWithMongoDB({ firebaseUid: result.user.uid, email: result.user.email }).catch(() => { })
            router.replace("/home")
        } catch (err: unknown) {
            setIsAuthenticating(false)
            const code = firebaseAuthCode(err)
            const errorMessages: Record<string, string> = {
                "auth/invalid-credential": "Invalid email or password.",
                "auth/wrong-password": "Invalid email or password.",
                "auth/user-not-found": "No account found. Create one below.",
                "auth/too-many-requests": "Too many attempts. Try again later.",
            }
            setError(errorMessages[code] || "Login failed. Please try again.")
        }
    }

    const handleSignUp = async () => {
        if (!email || !password) { setError("Please enter both email and password"); return }
        if (password.length < 6) { setError("Password must be at least 6 characters"); return }
        if (!auth) return
        setIsSigningUp(true)
        setError("")
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password)
            await persistSessionCookie(res.user)
            syncUserWithMongoDB({ firebaseUid: res.user.uid, email: res.user.email }).catch(() => { })
            router.replace("/home")
        } catch (err: unknown) {
            setIsSigningUp(false)
            const code = firebaseAuthCode(err)
            const errorMessages: Record<string, string> = {
                "auth/email-already-in-use": "Email already registered. Try logging in.",
                "auth/weak-password": "Password too weak.",
                "auth/invalid-email": "Invalid email address.",
            }
            setError(errorMessages[code] || "Signup failed. Please try again.")
        }
    }

    const handleGoogleAuth = async () => {
        if (!auth) return
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            await persistSessionCookie(result.user)
            syncUserWithMongoDB({ firebaseUid: result.user.uid, email: result.user.email }).catch(() => { })
            router.push("/home")
        } catch {
            setError("Google sign in failed. Try again.")
        }
    }

    if (authLoading || isAuthenticating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-16-fixed">
                    <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">
                        {isAuthenticating ? "Signing in..." : "Loading..."}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background auth-page-shell">
            <Link
                href="/"
                className="fixed flex items-center rounded-full font-medium transition-all hover:shadow-md text-foreground auth-back-btn"
                style={{ backgroundColor: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.08)' }}
            >
                <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
                Back
            </Link>

            <div className="w-full grid grid-cols-1 md:grid-cols-2 items-center auth-grid">
                <div ref={formRef} className="w-full max-w-sm mx-auto md:mx-0 auth-form-wrap">
                    <div
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center overflow-hidden"
                        style={{ backgroundColor: "#d4a574", marginBottom: "40px" }}
                    >
                        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 md:w-9 md:h-9">
                            <defs>
                                <mask id="auth-cut">
                                    <rect width="100" height="100" fill="white" />
                                    <circle cx="52" cy="35" r="18" fill="black" />
                                    <circle cx="65" cy="65" r="10" fill="black" />
                                </mask>
                            </defs>
                            <circle cx="50" cy="50" r="40" fill="#262626" mask="url(#auth-cut)" />
                        </svg>
                    </div>

                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground inter-tight" style={{ marginBottom: '8px' }}>
                        Welcome back
                    </h1>
                    <p className="text-muted-foreground text-sm" style={{ marginBottom: '40px' }}>Sign in to continue writing</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-full text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-all"
                            style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.12)', padding: '12px 20px' }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-full text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none transition-all"
                            style={{ backgroundColor: '#fff', border: '1px solid rgba(0,0,0,0.12)', padding: '12px 20px' }}
                        />
                    </div>

                    {error && <p className="text-xs text-red-600 mb-4">{error}</p>}

                    <button
                        onClick={handleLogin}
                        disabled={isAuthenticating}
                        className="w-full rounded-full font-medium text-sm transition-all hover:shadow-lg hover:scale-[1.01] disabled:opacity-50"
                        style={{ backgroundColor: "#3d3d3d", color: "#ffffff", paddingTop: '14px', paddingBottom: '14px' }}
                    >
                        {isAuthenticating ? "Signing in..." : "Login"}
                    </button>

                    <div className="flex items-center justify-center text-sm text-muted-foreground gap-3" style={{ marginTop: '24px' }}>
                        <span>New?</span>
                        <button
                            onClick={handleSignUp}
                            disabled={isSigningUp}
                            className="font-medium text-foreground hover:underline underline-offset-2"
                        >
                            {isSigningUp ? "Creating..." : "Create account"}
                        </button>
                        <span className="text-border">|</span>
                        <button
                            onClick={handleGoogleAuth}
                            className="flex items-center gap-1.5 font-medium text-foreground hover:underline underline-offset-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </button>
                    </div>
                </div>

                <div className="auth-reviews-column hidden md:flex w-full max-w-lg shrink-0 flex-col justify-center gap-3 md:max-w-xl md:gap-3.5 md:pl-4 lg:max-w-2xl lg:gap-4 lg:pl-6 md:max-h-[min(100dvh-7rem,44rem)] md:overflow-y-auto md:overscroll-contain [scrollbar-width:thin]">
                    {reviews.map((review, index) => (
                        <AuthReviewCard key={index} review={review} index={index} />
                    ))}
                </div>
            </div>
        </div>
    )
}
