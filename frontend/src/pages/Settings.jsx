import { useEffect, useRef } from 'react'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth'
import api from '../api/axios'
import HomeNavbar from '../components/home/HomeNavbar'
import { KeyRound, Trash2, Mail } from 'lucide-react'
import gsap from 'gsap'

export default function Settings() {
  const { user, logout } = useAuth()
  const pageRef = useRef(null)

  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      )
    }
  }, [])

  const passwordResetter = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email)
      alert("Password reset email sent! Check your inbox.")
    } catch (err) {
      alert("Couldn't send reset email. Please try again.")
      console.error("Error resetting password:", err)
    }
  }

  const accountDeleter = async () => {
    if (!confirm('⚠️ This action is permanent and cannot be undone. Are you absolutely sure you want to delete your account and all your data?')) {
      return
    }
    try {
      await api.delete("/blogs/users/me")
      await deleteUser(user)
      alert("Account deleted successfully.")
      logout()
    } catch (err) {
      alert("Couldn't delete account. Please try again.")
      console.error("Error deleting account:", err)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto" ref={pageRef}>
          {/* Header */}
          <div className="mb-12 text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Settings</h1>
            <p className="text-lg text-muted-foreground">Manage your account preferences</p>
          </div>

          {/* Settings Cards */}
          <div className="space-y-6">
            {/* Account Email Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              {/* Row 1: Label pill on left, Icon square on right */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 bg-muted/50 border border-border rounded-full text-sm font-medium text-foreground">
                  Account Email
                </span>
                <div className="w-9 h-9 border border-border rounded-lg flex items-center justify-center">
                  <Mail className="w-4 h-4 text-foreground" />
                </div>
              </div>
              {/* Row 2: Value box */}
              <div className="bg-muted/30 border border-border rounded-xl p-4">
                <p className="text-foreground font-medium text-left">{user?.email}</p>
              </div>
            </div>

            {/* Password Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              {/* Row 1: Label pill on left, Icon square on right */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 bg-muted/50 border border-border rounded-full text-sm font-medium text-foreground">
                  Password
                </span>
                <div className="w-9 h-9 border border-border rounded-lg flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-foreground" />
                </div>
              </div>
              {/* Row 2: Action button */}
              <button
                onClick={passwordResetter}
                className="w-full py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg bg-secondary text-secondary-foreground"
              >
                Send Password Reset Email
              </button>
            </div>

            {/* Delete Account Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              {/* Row 1: Label pill on left, Icon square on right */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-4 py-1.5 bg-muted/50 border border-border rounded-full text-sm font-medium text-foreground">
                  Delete Account
                </span>
                <div className="w-9 h-9 border border-border rounded-lg flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-foreground" />
                </div>
              </div>
              {/* Row 2: Action button */}
              <button
                onClick={accountDeleter}
                className="w-full py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg bg-accent text-accent-foreground"
              >
                Delete Account Permanently
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
