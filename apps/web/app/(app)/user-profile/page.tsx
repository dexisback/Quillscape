"use client"

import { useState, useEffect, useRef } from "react"
import { getUserProfile, updateUserProfile } from "@/lib/api/user"
import HomeNavbar from "@/components/home/HomeNavbar"
import { User, Mail, FileText, Pencil, Check, X } from "lucide-react"
import gsap from "gsap"
import { auth } from "@/lib/firebase"
import { motion } from "framer-motion"

type UserProfile = {
    username: string
    email: string
    bio: string
}

export default function UserProfile() {
    const firebaseUser = auth?.currentUser
    const providers = firebaseUser ? firebaseUser.providerData : []
    const isGoogleUser = providers.some((p) => p.providerId === "google.com")

    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ username: "", bio: "" })
    const [saving, setSaving] = useState(false)
    const pageRef = useRef<HTMLDivElement>(null)
    const avatarRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile()
                setUser(response.data)
                setFormData({ username: response.data.username || "", bio: response.data.bio || "" })
            } catch {
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
                gsap.to(avatarRef.current, { scale: 1.1, duration: 0.2, yoyo: true, repeat: 1 })
            }
        } catch {
            alert("Update failed! Please try again.")
        } finally {
            setSaving(false)
        }
    }

    const cancelEdit = () => {
        setFormData({ username: displayUser?.username || "", bio: displayUser?.bio || "" })
        setIsEditing(false)
    }

    const avatarUrl = isGoogleUser && firebaseUser?.photoURL
        ? firebaseUser.photoURL
        : user?.email || firebaseUser?.email
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || firebaseUser?.email || "anonymous")}`
            : null

    if (loading) return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />
            <main className="app-main-shell">
                <div className="max-w-2xl mx-auto text-center app-wrap-2xl block-pad-64">
                    <div className="inline-block w-8 h-8 rounded-full animate-spin mb-4" style={{ border: '2px solid var(--color-primary)', borderTopColor: 'transparent' }}></div>
                    <p className="text-muted-foreground inter-tight">Loading profile...</p>
                </div>
            </main>
        </div>
    )
    const displayUser = user || (firebaseUser ? {
        username: firebaseUser.displayName || "",
        email: firebaseUser.email || "",
        bio: ""
    } : null)

    if (!displayUser) return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />
            <main className="app-main-shell">
                <div className="max-w-2xl mx-auto text-center app-wrap-2xl block-pad-64">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-muted)' }}>
                        <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg inter-tight">User not found</p>
                </div>
            </main>
        </div>
    )

    return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />

            <main className="app-main-shell">
                <div className="max-w-2xl mx-auto app-wrap-2xl" ref={pageRef}>
                    <div className="text-left" style={{ marginBottom: '28px' }}>
                        <p className="text-lg text-muted-foreground inter-tight">
                            Your{" "}
                            <span className="relative inline-block marker-wrap">
                                <motion.span
                                    className="absolute rounded-sm marker-swipe"
                                    initial={{ scaleX: 0, originX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <span className="relative font-medium text-neutral-800 marker-text">public presence</span>
                            </span>
                            {" "}on Quillscape
                        </p>
                    </div>

                    <div className="rounded-xl overflow-hidden relative" style={{ backgroundColor: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <div className="absolute top-4 right-4 z-10">
                            {isEditing ? (
                                <div className="flex gap-1">
                                    <button
                                        onClick={handleUpdate}
                                        disabled={saving}
                                        className="transition-all duration-200 text-primary disabled:opacity-50"
                                        style={{ padding: '8px', borderRadius: '8px' }}
                                        onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = 'rgba(139,90,43,0.15)')}
                                        onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = 'transparent')}
                                        title="Save"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={cancelEdit}
                                        disabled={saving}
                                        className="transition-all duration-200 text-muted-foreground"
                                        style={{ padding: '8px', borderRadius: '8px' }}
                                        onMouseEnter={(e) => !saving && (e.currentTarget.style.backgroundColor = 'rgba(139,90,43,0.08)')}
                                        onMouseLeave={(e) => !saving && (e.currentTarget.style.backgroundColor = 'transparent')}
                                        title="Cancel"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="transition-all duration-200 text-muted-foreground hover:text-primary"
                                    style={{ padding: '8px', borderRadius: '8px' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(139,90,43,0.08)' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
                                    title="Edit Profile"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center panel-pad-24" style={{ backgroundColor: 'rgba(139,90,43,0.03)', borderBottom: '1px solid rgba(0,0,0,0.08)', gap: '20px' }}>
                            <div
                                ref={avatarRef}
                                className="w-16 h-16 rounded-full overflow-hidden shadow-lg flex-shrink-0"
                                style={{ border: '3px solid var(--color-card)' }}
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={displayUser.username || "User"}
                                        className="w-full h-full object-cover bg-muted"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary flex items-center justify-center">
                                        <User className="w-8 h-8 text-primary-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="text-left">
                                <h2 className="text-lg font-semibold text-foreground inter-tight">
                                    {displayUser.username || "Anonymous Writer"}
                                </h2>
                                <p className="text-muted-foreground text-xs inter-tight">{displayUser.email}</p>
                            </div>
                        </div>

                        <div className="panel-pad-24">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="rounded-xl" style={{ backgroundColor: 'rgba(139,90,43,0.05)', border: '1px solid rgba(0,0,0,0.08)', padding: '16px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-primary" />
                                        <label className="text-xs font-medium text-muted-foreground inter-tight">Username</label>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Enter your username"
                                            className="w-full rounded-lg text-sm text-foreground placeholder:text-muted-foreground inter-tight focus:outline-none"
                                            style={{ backgroundColor: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.12)', padding: '10px' }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)' }}
                                        />
                                    ) : (
                                        <p className="text-foreground text-sm font-medium text-left inter-tight">
                                            {displayUser.username || <span className="text-muted-foreground italic">Not set</span>}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-xl" style={{ backgroundColor: 'rgba(139,90,43,0.05)', border: '1px solid rgba(0,0,0,0.08)', padding: '16px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <label className="text-xs font-medium text-muted-foreground inter-tight">Bio</label>
                                    </div>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                            className="w-full rounded-lg text-sm text-foreground placeholder:text-muted-foreground min-h-[100px] resize-y inter-tight focus:outline-none"
                                            style={{ backgroundColor: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.12)', padding: '10px' }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)' }}
                                        />
                                    ) : (
                                        <p className="text-foreground text-sm leading-relaxed text-left inter-tight">
                                            {displayUser.bio || <span className="text-muted-foreground italic">No bio yet. Tell the world about yourself!</span>}
                                        </p>
                                    )}
                                </div>

                                <div className="rounded-xl" style={{ backgroundColor: 'rgba(139,90,43,0.05)', border: '1px solid rgba(0,0,0,0.08)', padding: '16px' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <label className="text-xs font-medium text-muted-foreground inter-tight">Email</label>
                                        <span className="text-xs rounded-full text-muted-foreground inter-tight" style={{ backgroundColor: 'var(--color-muted)', padding: '2px 8px' }}>Read-only</span>
                                    </div>
                                    <p className="text-foreground text-sm text-left inter-tight">{displayUser.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
