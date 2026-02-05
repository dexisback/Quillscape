import { useState, useEffect, useRef } from 'react'
import { getUserProfile, updateUserProfile } from '../api/user.api'
import HomeNavbar from '../components/home/HomeNavbar'
import { User, Mail, FileText, Pencil, Check, X } from 'lucide-react'
import gsap from 'gsap'
import { auth } from '../firebase'
import { motion } from 'framer-motion'

export default function UserProfile() {

  const firebaseUser = auth.currentUser;
  const providers = firebaseUser ? firebaseUser.providerData : []


  let isGoogleUser = false;
  for (const provider of providers) {
    if (provider.providerId === "google.com") {
      isGoogleUser = true;
      break;
    }
  }

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ username: '', bio: '' })
  const [saving, setSaving] = useState(false)
  const pageRef = useRef(null)
  const avatarRef = useRef(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile()
        setUser(response.data)
        setFormData({
          username: response.data.username || '',
          bio: response.data.bio || ''
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  useEffect(() => {
    if (!loading && pageRef.current) {
      gsap.fromTo(
        pageRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
      )
    }
  }, [loading])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const response = await updateUserProfile(formData)
      setUser(response.data)
      setIsEditing(false)

      if (avatarRef.current) {
        gsap.to(avatarRef.current, {
          scale: 1.1,
          duration: 0.2,
          yoyo: true,
          repeat: 1
        })
      }
    } catch (err) {
      console.error('Update failed:', err)
      alert('Update failed! Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setFormData({
      username: user?.username || '',
      bio: user?.bio || ''
    })
    setIsEditing(false)
  }

  let avatarUrl = null;
  if (isGoogleUser && firebaseUser.photoURL) {
    avatarUrl = firebaseUser.photoURL;
  } else if (user && user.email) {
    avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`
  }

  if (loading) return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Loading profile...</p>
        </div>
      </main>
    </div>
  )

  if (!user) return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>User not found</p>
        </div>
      </main>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto" ref={pageRef}>
          {/* Header */}
          <div className="mb-10 text-left">
            <p className="text-lg text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
              Your{" "}
              <span className="relative inline-block" style={{ isolation: 'isolate' }}>
                <motion.span
                  className="absolute rounded-sm"
                  style={{
                    backgroundColor: '#fde047',
                    zIndex: 0,
                    transform: 'skewY(-2deg) rotate(-0.5deg)',
                    top: '2px',
                    bottom: '2px',
                    left: '-3px',
                    right: '-3px',
                    borderRadius: '2px 8px 4px 6px'
                  }}
                  initial={{ scaleX: 0, originX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                />
                <span className="relative font-medium text-neutral-800" style={{ zIndex: 1 }}>public presence</span>
              </span>
              {" "}on Quillscape
            </p>
          </div>

          {/* Profile Card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden relative">
            {/* Edit Toggle Button - Top Right */}
            <div className="absolute top-4 right-4 z-10">
              {isEditing ? (
                <div className="flex gap-1">
                  <button
                    onClick={handleUpdate}
                    disabled={saving}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-primary/20 text-primary disabled:opacity-50"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="p-2 rounded-lg transition-all duration-200 hover:bg-muted text-muted-foreground"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg transition-all duration-200 hover:bg-muted/50 text-muted-foreground hover:text-primary"
                  title="Edit Profile"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Avatar Section - Horizontal Layout */}
            <div className="bg-muted/30 p-6 flex items-center gap-5 border-b border-border">
              <div
                ref={avatarRef}
                className="w-16 h-16 rounded-full overflow-hidden border-3 border-card shadow-lg flex-shrink-0"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.username || 'User'}
                    className="w-full h-full object-cover bg-muted"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                  {user.username || 'Anonymous Writer'}
                </h2>
                <p className="text-muted-foreground text-xs" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>{user.email}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">

              {/* Fields */}
              <div className="space-y-4">
                {/* Username */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <label className="text-xs font-medium text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Username</label>
                  </div>
                  {isEditing ? (
                    <input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your username"
                      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
                    />
                  ) : (
                    <p className="text-foreground text-sm font-medium text-left" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                      {user.username || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <label className="text-xs font-medium text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Bio</label>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about yourself..."
                      style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}
                    />
                  ) : (
                    <p className="text-foreground text-sm leading-relaxed text-left" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
                      {user.bio || <span className="text-muted-foreground italic">No bio yet. Tell the world about yourself!</span>}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <label className="text-xs font-medium text-muted-foreground" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>Email</label>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Read-only</span>
                  </div>
                  <p className="text-foreground text-sm text-left" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
