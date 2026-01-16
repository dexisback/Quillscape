import { useEffect, useRef } from 'react'
import { auth } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth'
import api from '../api/axios'
import HomeNavbar from '../components/home/HomeNavbar'
import { KeyRound, Trash2, Mail, AlertTriangle } from 'lucide-react'
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
            {/* Account Info Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Account Email</h3>
                  <p className="text-sm text-muted-foreground">Your registered email address</p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="text-foreground font-medium">{user?.email}</p>
              </div>
            </div>

            {/* Password Card */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <KeyRound className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Password</h3>
                  <p className="text-sm text-muted-foreground">Secure your account with a strong password</p>
                </div>
              </div>
              <button
                onClick={passwordResetter}
                className="w-full py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-[1.02] bg-secondary text-secondary-foreground"
              >
                Send Password Reset Email
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground">Irreversible actions</p>
                </div>
              </div>

              <div className="bg-muted/20 rounded-lg p-4 mb-4 border border-accent/20">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <p className="text-foreground font-medium mb-1">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

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
