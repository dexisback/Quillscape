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
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setError("Invalid email or password. Please try again.")
      } else if (error.code === 'auth/user-not-found') {
        setError("No account found with this email. Please sign up first.")
      } else if (error.code === 'auth/too-many-requests') {
        setError("Too many failed attempts. Please try again later.")
      } else {
        setError("Sign in failed. Please try again.")
      }
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: 'oklch(0.35 0.1 35)',
        color: 'oklch(0.96 0.025 75)'
      }}
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
      
      if (error.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try signing in instead.")
      } else if (error.code === 'auth/weak-password') {
        setError("Password is too weak. Please use a stronger password.")
      } else if (error.code === 'auth/invalid-email') {
        setError("Invalid email address.")
      } else {
        setError("Signup failed. Please try again.")
      }
    }
  }

  return (
    <button
      onClick={handleSignUp}
      disabled={loading}
      className="w-full py-3.5 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        backgroundColor: 'oklch(0.82 0.06 45)',
        color: 'oklch(0.35 0.1 35)'
      }}
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
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'oklch(0.96 0.025 75)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: 'oklch(0.35 0.1 35)', borderTopColor: 'transparent' }}
          />
          <p style={{ color: 'oklch(0.35 0.1 35)' }} className="font-medium">
            {isAuthenticating ? 'Authenticating...' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        backgroundColor: 'oklch(0.96 0.025 75)',
        backgroundImage: `
          repeating-linear-gradient(
            45deg,
            transparent,
            transparent 3px,
            rgba(139, 115, 85, 0.03) 3px,
            rgba(139, 115, 85, 0.03) 6px
          ),
          repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 3px,
            rgba(139, 115, 85, 0.02) 3px,
            rgba(139, 115, 85, 0.02) 6px
          ),
          radial-gradient(ellipse at 30% 20%, rgba(139, 115, 85, 0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(139, 115, 85, 0.04) 0%, transparent 50%)
        `
      }}
    >
      {/* Back to Landing Link */}
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
        style={{
          backgroundColor: 'rgba(139, 115, 85, 0.1)',
          color: 'oklch(0.35 0.1 35)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Auth Card - Glass Effect */}
      <div
        ref={cardRef}
        className="w-full max-w-md p-8 rounded-3xl shadow-2xl"
        style={{
          backgroundColor: 'rgba(255, 253, 250, 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(139, 115, 85, 0.2)'
        }}
      >
        {/* Logo and Title */}
        <div className="text-center mb-10">
          <div
            ref={logoRef}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold mx-auto mb-5 shadow-lg"
            style={{
              backgroundColor: 'oklch(0.35 0.1 35)',
              color: 'oklch(0.96 0.025 75)'
            }}
          >
            Q
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: 'oklch(0.25 0.05 40)' }}
          >
            Quillscape
          </h1>
          <p style={{ color: 'oklch(0.48 0.03 40)' }}>
            Your thoughts, your space
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5 mb-8">
          {/* Email Field */}
          <div>
            <label
              className="flex items-center gap-2 text-sm font-medium mb-2"
              style={{ color: 'oklch(0.35 0.1 35)' }}
            >
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-4 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(139, 115, 85, 0.08)',
                border: '1px solid rgba(139, 115, 85, 0.2)',
                color: 'oklch(0.25 0.05 40)'
              }}
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              className="flex items-center gap-2 text-sm font-medium mb-2"
              style={{ color: 'oklch(0.35 0.1 35)' }}
            >
              <Lock className="w-4 h-4" />
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-4 rounded-xl text-base transition-all duration-300 focus:outline-none focus:ring-2"
              style={{
                backgroundColor: 'rgba(139, 115, 85, 0.08)',
                border: '1px solid rgba(139, 115, 85, 0.2)',
                color: 'oklch(0.25 0.05 40)'
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Error Message */}
          {error && (
            <div 
              className="p-3 rounded-xl text-sm text-center"
              style={{ 
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
                color: 'rgb(185, 28, 28)',
                border: '1px solid rgba(220, 38, 38, 0.2)'
              }}
            >
              {error}
            </div>
          )}

          <Signin email={email} password={password} setError={setError} setAuthLoading={setIsAuthenticating} />

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(139, 115, 85, 0.2)' }} />
            <span className="text-sm" style={{ color: 'oklch(0.48 0.03 40)' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(139, 115, 85, 0.2)' }} />
          </div>

          <Signup email={email} password={password} setError={setError} setAuthLoading={setIsAuthenticating} />
        </div>

        {/* Footer Note */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: 'oklch(0.55 0.03 40)' }}
        >
          By continuing, you agree to write thoughtfully ✍️
        </p>
      </div>
    </div>
  )
}
