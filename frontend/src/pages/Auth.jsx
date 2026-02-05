import { useNavigate, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "../firebase"
import { syncUserWithMongoDB } from "../api/user.api"
import { useAuth } from "../context/AuthContext"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import gsap from "gsap"

//NOTE: placeholder/dummy reviews for now
const reviews = [
  {
    text: "Finally, a writing app that just gets out of the way. Pure focus.",
    author: "— A friend"
  },
  {
    text: "The aesthetic is unmatched. Makes me want to write more.",
    author: "— Beta tester"
  },
  {
    text: "Anonymous drafts? Game changer for journaling.",
    author: "— Early user"
  }
]

function ReviewCard({ review, index }) {
  const colors = ["#fef3c7", "#fef08a", "#fde047"]

  return (
    <motion.div
      className="p-6 rounded-2xl cursor-default"
      style={{
        backgroundColor: colors[index % 3],
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
      }}
      whileHover={{ y: -8, boxShadow: "0 16px 32px rgba(0,0,0,0.12)" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <p className="text-neutral-700 text-sm leading-relaxed mb-3 italic">"{review.text}"</p>
      <p className="text-neutral-500 text-xs">{review.author}</p>
    </motion.div>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const formRef = useRef(null)

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/home", { replace: true })
    }
  }, [user, authLoading, navigate])

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
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setIsAuthenticating(true)
    setError("")

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      syncUserWithMongoDB({
        firebaseUid: result.user.uid,
        email: result.user.email
      }).catch(err => console.error("MongoDB sync error:", err))
    } catch (error) {
      setIsAuthenticating(false)
      const errorMessages = {
        'auth/invalid-credential': "Invalid email or password.",
        'auth/wrong-password': "Invalid email or password.",
        'auth/user-not-found': "No account found. Create one below.",
        'auth/too-many-requests': "Too many attempts. Try again later."
      }
      setError(errorMessages[error.code] || "Login failed. Please try again.")
    }
  }

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsSigningUp(true)
    setError("")

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)
      syncUserWithMongoDB({
        firebaseUid: res.user.uid,
        email: res.user.email
      }).catch(err => console.error("MongoDB sync error:", err))
    } catch (error) {
      setIsSigningUp(false)
      const errorMessages = {
        'auth/email-already-in-use': "Email already registered. Try logging in.",
        'auth/weak-password': "Password too weak.",
        'auth/invalid-email': "Invalid email address."
      }
      setError(errorMessages[error.code] || "Signup failed. Please try again.")
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      syncUserWithMongoDB({
        firebaseUid: result.user.uid,
        email: result.user.email
      }).catch(err => console.error("MongoDB sync error:", err))
      navigate("/home")
    } catch (err) {
      setError("Google sign in failed. Try again.")
    }
  }

  if (authLoading || isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            {isAuthenticating ? 'Signing in...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 md:p-16 bg-background">
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all hover:shadow-md bg-white/70 backdrop-blur-md border border-border/50 text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Main Container */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        {/* Left: Auth Form */}
        <div ref={formRef} className="w-full max-w-sm mx-auto md:mx-0">
          {/* Logo */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-10 overflow-hidden" style={{ backgroundColor: '#d4a574' }}>
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
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

          {/* Heading */}
          <h1 className="text-3xl font-semibold text-foreground mb-2" style={{ letterSpacing: '-0.02em' }}>
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm mb-10">
            Sign in to continue writing
          </p>

          {/* Inputs */}
          <div className="space-y-4 mb-6">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-5 py-3 rounded-full text-sm bg-white border border-border/60 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-5 py-3 rounded-full text-sm bg-white border border-border/60 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-xs text-red-600 mb-4">{error}</p>
          )}

          {/* Login Button */}
          <button
            onClick={handleLogin}
            disabled={isAuthenticating}
            className="w-full py-3.5 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:scale-[1.01] disabled:opacity-50"
            style={{ backgroundColor: '#3d3d3d', color: '#ffffff' }}
          >
            {isAuthenticating ? 'Signing in...' : 'Login'}
          </button>

          {/* Create Account + Google */}
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>New?</span>
            <button
              onClick={handleSignUp}
              disabled={isSigningUp}
              className="font-medium text-foreground hover:underline underline-offset-2"
            >
              {isSigningUp ? 'Creating...' : 'Create account'}
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

        {/* Right: Review Cards */}
        <div className="hidden md:flex flex-col gap-5">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}
