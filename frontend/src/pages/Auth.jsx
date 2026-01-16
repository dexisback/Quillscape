import { useNavigate, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "../firebase"
import { syncUserWithMongoDB } from "../api/user.api"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import gsap from "gsap"

function Signin({ email, password }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    if (!email || !password) {
      alert("Please enter both email and password")
      return
    }

    setLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      const user = result.user
      const token = await auth.currentUser.getIdToken()
      await syncUserWithMongoDB({
        firebaseUid: user.uid,
        email: user.email
      })
      navigate("/home")
    } catch (error) {
      console.error("Sign in error:", error)
      alert("Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
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

function Signup({ email, password }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSignUp = async () => {
    if (!email || !password) {
      alert("Please enter both email and password")
      return
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password)
      const token = await res.user.getIdToken()
      await syncUserWithMongoDB({
        firebaseUid: res.user.uid,
        email: res.user.email
      })
      navigate("/home")
    } catch (error) {
      console.error("Sign up error:", error)
      alert("Signup failed. User may already exist.")
    } finally {
      setLoading(false)
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
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const cardRef = useRef(null)
  const logoRef = useRef(null)

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
          <Signin email={email} password={password} />

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(139, 115, 85, 0.2)' }} />
            <span className="text-sm" style={{ color: 'oklch(0.48 0.03 40)' }}>or</span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(139, 115, 85, 0.2)' }} />
          </div>

          <Signup email={email} password={password} />
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
