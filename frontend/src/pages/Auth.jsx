import { useNavigate, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { syncUserWithMongoDB } from "../api/user.api"
import { useAuth } from "../context/AuthContext"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import gsap from "gsap"

function Signin({ email, password, setError, setAuthLoading }) {
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    setLoading(true)
    setAuthLoading(true)
    setError("")

    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      // Sync with MongoDB in background (don't await)
      syncUserWithMongoDB({
        firebaseUid: result.user.uid,
        email: result.user.email
      }).catch(err => console.error("MongoDB sync error:", err))

      // Navigation will happen automatically via useEffect in parent
    } catch (error) {
      console.error("Sign in error:", error)
      setAuthLoading(false)
      setLoading(false)

      const errorMessages = {
        'auth/invalid-credential': "Invalid email or password. Please try again.",
        'auth/wrong-password': "Invalid email or password. Please try again.",
        'auth/user-not-found': "No account found with this email. Please sign up first.",
        'auth/too-many-requests': "Too many failed attempts. Please try again later."
      }
      setError(errorMessages[error.code] || "Sign in failed. Please try again.")
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed bg-primary text-primary-foreground"
    >
      {loading ? 'Signing in...' : 'Sign In'}
    </button>
  )
}

function Signup({ email, password, setError, setAuthLoading }) {
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    setAuthLoading(true)
    setError("")

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)

      // Sync with MongoDB in background (don't await)
      syncUserWithMongoDB({
        firebaseUid: res.user.uid,
        email: res.user.email
      }).catch(err => console.error("MongoDB sync error:", err))

      // Navigation will happen automatically via useEffect in parent
    } catch (error) {
      console.error("Sign up error:", error)
      setAuthLoading(false)
      setLoading(false)

      const errorMessages = {
        'auth/email-already-in-use': "This email is already registered. Try signing in instead.",
        'auth/weak-password': "Password is too weak. Please use a stronger password.",
        'auth/invalid-email': "Invalid email address."
      }
      setError(errorMessages[error.code] || "Signup failed. Please try again.")
    }
  }

  return (
    <button
      onClick={handleSignUp}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed bg-secondary text-secondary-foreground"
    >
      {loading ? 'Creating account...' : 'Create Account'}
    </button>
  )
}

export default function Auth() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const cardRef = useRef(null)
  const logoRef = useRef(null)

  // Redirect to home if user is already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate("/home", { replace: true })
    }
  }, [user, authLoading, navigate])

  useEffect(() => {
    // Entrance animation
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out" }
      )
    }
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { opacity: 0, scale: 0.5, rotation: -10 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.6, delay: 0.3, ease: "back.out(1.7)" }
      )
    }
  }, [])

  // Show loading while checking auth state or authenticating
  if (authLoading || isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-medium text-foreground">
            {isAuthenticating ? 'Authenticating...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      {/* Back to Landing Link */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 bg-muted/50 text-primary backdrop-blur-md border border-border"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Auth Card - Glass Effect */}
      <div
        ref={cardRef}
        className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-card/85 backdrop-blur-xl border border-border"
      >
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div
            ref={logoRef}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-5 shadow-lg bg-primary text-primary-foreground"
          >
            Q
          </div>
          <h1 className="text-3xl font-bold mb-2 text-foreground">
            Quillscape
          </h1>
          <p className="text-muted-foreground">
            Your thoughts, your space
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 mb-8">
          {/* Email Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-primary">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2 text-primary">
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl text-sm text-center bg-destructive/10 text-destructive border border-destructive/20">
              {error}
            </div>
          )}

          <Signin email={email} password={password} setError={setError} setAuthLoading={setIsAuthenticating} />

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-sm text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Signup email={email} password={password} setError={setError} setAuthLoading={setIsAuthenticating} />
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs mt-8 text-muted-foreground">
          Sign in or create your account
        </p>
      </div>
    </div>
  )
}
