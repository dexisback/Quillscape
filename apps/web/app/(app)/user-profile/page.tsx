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
        setFormData({ username: user?.username || "", bio: user?.bio || "" })
        setIsEditing(false)
    }

    const avatarUrl = isGoogleUser && firebaseUser?.photoURL
        ? firebaseUser.photoURL
        : user?.email
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`
            : null

    if (loading) return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />
            <main className="app-main-shell">
                <div className="max-w-2xl mx-auto text-center app-wrap-2xl block-pad-64">
                    <div className="inline-block w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-muted-foreground inter-tight">Loading profile...</p>
                </div>
            </main>
        </div>
    )

    if (!user) return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />
            <main className="app-main-shell">
                <div className="max-w-2xl mx-auto text-center app-wrap-2xl block-pad-64">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
                    <div className="text-left section-gap-40">
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

                    <div className="bg-card border border-border rounded-xl overflow-hidden relative">
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

                        <div className="bg-muted/30 flex items-center border-b border-border panel-pad-24 gap-20-fixed">
                            <div
                                ref={avatarRef}
                                className="w-16 h-16 rounded-full overflow-hidden border-3 border-card shadow-lg flex-shrink-0"
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt={user.username || "User"}
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
                                    {user.username || "Anonymous Writer"}
                                </h2>
                                <p className="text-muted-foreground text-xs inter-tight">{user.email}</p>
                            </div>
                        </div>

                        <div className="panel-pad-24">
                            <div className="stack-gap-16">
                                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User className="w-4 h-4 text-primary" />
                                        <label className="text-xs font-medium text-muted-foreground inter-tight">Username</label>
                                    </div>
                                    {isEditing ? (
                                        <input
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            placeholder="Enter your username"
                                            className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary inter-tight"
                                        />
                                    ) : (
                                        <p className="text-foreground text-sm font-medium text-left inter-tight">
                                            {user.username || <span className="text-muted-foreground italic">Not set</span>}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <FileText className="w-4 h-4 text-primary" />
                                        <label className="text-xs font-medium text-muted-foreground inter-tight">Bio</label>
                                    </div>
                                    {isEditing ? (
                                        <textarea
                                            value={formData.bio}
                                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            placeholder="Tell us about yourself..."
                                            className="w-full p-2.5 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary inter-tight"
                                        />
                                    ) : (
                                        <p className="text-foreground text-sm leading-relaxed text-left inter-tight">
                                            {user.bio || <span className="text-muted-foreground italic">No bio yet. Tell the world about yourself!</span>}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-muted/20 rounded-xl p-4 border border-border">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Mail className="w-4 h-4 text-primary" />
                                        <label className="text-xs font-medium text-muted-foreground inter-tight">Email</label>
                                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Read-only</span>
                                    </div>
                                    <p className="text-foreground text-sm text-left inter-tight">{user.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
