"use client"

import { useEffect, useRef } from "react"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/context/AuthContext"
import { deleteUser } from "firebase/auth"
import api from "@/lib/api/axios"
import HomeNavbar from "@/components/home/HomeNavbar"
import { KeyRound, Trash2, Mail, ChevronRight } from "lucide-react"
import gsap from "gsap"
import { motion, useMotionValue, useTransform } from "framer-motion"

export default function Settings() {
    const { user, logout } = useAuth()
    const pageRef = useRef<HTMLDivElement>(null)
    const dragX = useMotionValue(0)
    const sliderWidth = 280
    const triggerThreshold = sliderWidth - 60

    const backgroundOpacity = useTransform(dragX, [0, triggerThreshold], [0.3, 1])
    const textOpacity = useTransform(dragX, [0, triggerThreshold * 0.5], [1, 0])

    useEffect(() => {
        if (pageRef.current) {
            gsap.fromTo(
                pageRef.current.children,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }
            )
        }
    }, [])

    const accountDeleter = async () => {
        try {
            await api.delete("/blogs/users/me")
            if (user) await deleteUser(user)
            alert("Account deleted successfully.")
            logout()
        } catch {
            alert("Couldn't delete account. Please try again.")
        }
    }

    const handleDragEnd = (_event: any, info: any) => {
        if (info.offset.x >= triggerThreshold) {
            accountDeleter()
        } else {
            dragX.set(0)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <HomeNavbar />

            <main style={{ paddingTop: "96px", paddingRight: "24px", paddingBottom: "48px", paddingLeft: "24px" }}>
                <div className="max-w-2xl mx-auto" style={{ maxWidth: "672px", marginLeft: "auto", marginRight: "auto" }} ref={pageRef}>
                    <div className="text-left" style={{ marginBottom: "40px" }}>
                        <p className="text-lg text-muted-foreground" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
                            <span className="relative inline-block" style={{ isolation: "isolate" }}>
                                <motion.span
                                    className="absolute rounded-sm"
                                    style={{
                                        backgroundColor: "#fde047",
                                        zIndex: 0,
                                        transform: "skewY(-2deg) rotate(-0.5deg)",
                                        top: "2px", bottom: "2px", left: "-3px", right: "-3px",
                                        borderRadius: "2px 8px 4px 6px",
                                    }}
                                    initial={{ scaleX: 0, originX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <span className="relative font-medium text-neutral-800" style={{ zIndex: 1 }}>Manage</span>
                            </span>
                            {" "}your account preferences
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div style={{ paddingTop: "24px", paddingRight: "24px", paddingBottom: "24px", paddingLeft: "24px" }}>
                            <div
                                className="bg-muted/20 rounded-xl border border-border"
                                style={{ paddingTop: "16px", paddingRight: "16px", paddingBottom: "16px", paddingLeft: "16px" }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <label className="text-xs font-medium text-muted-foreground" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>Account Email</label>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Read-only</span>
                                </div>
                                <p className="text-foreground text-sm text-left" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>{user?.email}</p>
                            </div>

                            <div
                                className="bg-destructive/5 rounded-xl border border-destructive/20"
                                style={{ marginTop: "16px", paddingTop: "16px", paddingRight: "16px", paddingBottom: "16px", paddingLeft: "16px" }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                    <label className="text-sm font-medium text-red-500 dark:text-red-200" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
                                        Permanently Delete Your Account
                                    </label>
                                </div>
                                <p className="text-xs text-red-500 mb-4 text-left" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}>
                                    This action is permanent.
                                </p>

                                <div
                                    className="relative h-12 rounded-full overflow-hidden w-full max-w-[280px]"
                                    style={{ backgroundColor: "#e57373" }}
                                >
                                    <motion.div
                                        className="absolute inset-0"
                                        style={{ opacity: backgroundOpacity, backgroundColor: "#c62828" }}
                                    />
                                    <motion.span
                                        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white pointer-events-none"
                                        style={{ opacity: textOpacity, fontFamily: "Inter, sans-serif", letterSpacing: "-0.02em" }}
                                    >
                                        Slide to delete →
                                    </motion.span>
                                    <motion.div
                                        drag="x"
                                        dragConstraints={{ left: 0, right: sliderWidth - 48 }}
                                        dragElastic={0}
                                        onDragEnd={handleDragEnd}
                                        style={{ x: dragX }}
                                        className="absolute top-1 left-1 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing"
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <ChevronRight className="w-5 h-5" style={{ color: "#e57373" }} />
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
