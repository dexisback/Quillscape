import { useState, useEffect, useRef } from 'react'
import { getUserProfile, updateUserProfile } from '../api/user.api'
import HomeNavbar from '../components/home/HomeNavbar'
import { User, Mail, FileText, Pencil, Check, X } from 'lucide-react'
import gsap from 'gsap'
import { auth } from '../firebase';

//this page fetches the user data from the backend for native Quillscape loggers.
//someone signs up with google, the page checks here-on and implements the required (google data/pfp) for the google loggers
export default function UserProfile() {
  
  const firebaseUser=auth.currentUser;
  const providers=firebaseUser?firebaseUser.providerData : []

  
  let isGoogleUser = false;
  for(const provider of providers){
    if(provider.providerId==="google.com"){
      isGoogleUser=true;
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
  let avatarUrl=null;
  // pfp: google pfp if google user, dicebear if custom quillscape user:
  if(isGoogleUser && firebaseUser.photoURL){
    avatarUrl=firebaseUser.photoURL;
  }else if(user && user.email){
    avatarUrl= `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`
  }
  else{
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
          <div className="mb-12 text-left">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3">Profile</h1>
            <p className="text-lg text-muted-foreground">Your public presence on Quillscape</p>
          </div>

          {/* Profile Card */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Avatar Section */}
            <div className="bg-muted/30 p-8 flex flex-col items-center border-b border-border">
              <div
                ref={avatarRef}
                className="w-24 h-24 rounded-full overflow-hidden border-4 border-card shadow-lg mb-4"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.username || 'User'}
                    className="w-full h-full object-cover bg-muted"
                  />
                ) : (
                  <div className="w-full h-full bg-primary flex items-center justify-center">
                    <User className="w-12 h-12 text-primary-foreground" />
                  </div>
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {user.username || 'Anonymous Writer'}
              </h2>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              {/* Edit Toggle Button */}
              <div className="flex justify-end mb-6">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdate}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg bg-primary text-primary-foreground disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:shadow-lg bg-secondary text-secondary-foreground"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>

              {/* Fields */}
              <div className="space-y-6">
                {/* Username */}
                <div className="bg-muted/20 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <User className="w-5 h-5 text-primary" />
                    <label className="text-sm font-medium text-muted-foreground">Username</label>
                  </div>
                  {isEditing ? (
                    <input
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full p-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your username"
                    />
                  ) : (
                    <p className="text-foreground text-lg font-medium">
                      {user.username || <span className="text-muted-foreground italic">Not set</span>}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div className="bg-muted/20 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="w-5 h-5 text-primary" />
                    <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  </div>
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-3 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-foreground leading-relaxed">
                      {user.bio || <span className="text-muted-foreground italic">No bio yet. Tell the world about yourself!</span>}
                    </p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div className="bg-muted/20 rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Read-only</span>
                  </div>
                  <p className="text-foreground text-lg">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
