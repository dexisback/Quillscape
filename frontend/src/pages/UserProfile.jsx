import { useState, useEffect, useRef } from 'react'
import { getUserProfile, updateUserProfile } from '../api/user.api'
import HomeNavbar from '../components/home/HomeNavbar'
import { User, Mail, FileText, Pencil, Check, X } from 'lucide-react'
import gsap from 'gsap'
import { auth } from '../firebase';

//this page fetches the user data from the backend for native Quillscape loggers.
//someone signs up with google, the page checks here-on and implements the required (google data/pfp) for the google loggers
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

      // Success animation
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
  // pfp: google pfp if google user, dicebear if custom quillscape user:
  if (isGoogleUser && firebaseUser.photoURL) {
    avatarUrl = firebaseUser.photoURL;
  } else if (user && user.email) {
    avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`
  }
  else {
    console.log("user not found")
  }

  if (loading) return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </main>
    </div>
  )
  console.log(user)
  if (!user) return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <main className="pt-24 pb-12 px-6">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground text-lg">User not found</p>
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Profile</h1>
            <p className="text-sm text-muted-foreground">Your public presence on Quillscape</p>
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

            {/* Avatar Section */}
            <div className="bg-muted/30 p-6 flex flex-col items-center border-b border-border">
              <div
                ref={avatarRef}
                className="w-20 h-20 rounded-full overflow-hidden border-4 border-card shadow-lg mb-3"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.username || 'User'}
                    className="w-full h-full object-cover bg-muted"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center">
                    <User className="w-10 h-10 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {user.username || 'Anonymous Writer'}
              </h2>
              <p className="text-muted-foreground text-xs">{user.email}</p>
            </div>

            {/* Profile Details */}
            <div className="p-6">

              {/* Fields */}
              <div className="space-y-6">
                {/* Username */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <label className="text-xs font-medium text-muted-foreground">Username</label>
                  </div>
                  {isEditing ? (
                    <input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your username"
                    />
                  ) : (
                    <p className="text-foreground text-sm font-medium text-left">
                      {user.username || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <label className="text-xs font-medium text-muted-foreground">Bio</label>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-foreground text-sm leading-relaxed text-left">
                      {user.bio || <span className="text-muted-foreground italic">No bio yet. Tell the world about yourself!</span>}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Read-only</span>
                  </div>
                  <p className="text-foreground text-sm text-left">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
