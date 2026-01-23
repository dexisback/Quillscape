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

  // const passwordResetter = async () => {
  //   try {
  //     await sendPasswordResetEmail(auth, user.email)
  //     alert("Password reset email sent! Check your inbox.")
  //   } catch (err) {
  //     alert("Couldn't send reset email. Please try again.")
  //     console.error("Error resetting password:", err)
  //   }
  // }

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
          <div className="mb-10 text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account preferences</p>
          </div>

          {/* Settings Card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Fields */}
            <div className="p-6 space-y-4">
              {/* Account Email */}
              <div className="bg-muted/20 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <label className="text-xs font-medium text-muted-foreground">Account Email</label>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Read-only</span>
                </div>
                <p className="text-foreground text-sm text-left">{user?.email}</p>
              </div>

              {/* Danger Zone */}
              <div className="bg-destructive/5 rounded-xl p-4 border border-destructive/20">
                <div className="flex items-center gap-2 mb-3">
                  <Trash2 className="w-4 h-4 text-destructive" />
                  <label className="text-xs font-medium text-destructive">Permanently Delete Your Account</label>
                </div>
                <p className="text-muted-foreground text-xs mb-3 text-left">
                  This action is permanent.
                </p>
                <button
                  onClick={accountDeleter}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-md bg-red-500 text-white hover:bg-red-600"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
