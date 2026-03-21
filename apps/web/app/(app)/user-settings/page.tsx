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

            <main className="app-main-shell">
                <div className="max-w-2xl mx-auto app-wrap-2xl" ref={pageRef}>
                    <div className="text-left section-gap-40">
                        <p className="text-lg text-muted-foreground inter-tight">
                            <span className="relative inline-block marker-wrap">
                                <motion.span
                                    className="absolute rounded-sm marker-swipe"
                                    initial={{ scaleX: 0, originX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                />
                                <span className="relative font-medium text-neutral-800 marker-text">Manage</span>
                            </span>
                            {" "}your account preferences
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <div className="panel-pad-24">
                            <div
                                className="bg-muted/20 rounded-xl border border-border panel-pad-16"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <label className="text-xs font-medium text-muted-foreground inter-tight">Account Email</label>
                                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">Read-only</span>
                                </div>
                                <p className="text-foreground text-sm text-left inter-tight">{user?.email}</p>
                            </div>

                            <div
                                className="bg-destructive/5 rounded-xl border border-destructive/20 panel-pad-16"
                                style={{ marginTop: "16px" }}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Trash2 className="w-4 h-4 text-destructive" />
                                    <label className="text-sm font-medium text-red-500 dark:text-red-200 inter-tight">
                                        Permanently Delete Your Account
                                    </label>
                                </div>
                                <p className="text-xs text-red-500 mb-4 text-left inter-tight">
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
                                        className="absolute inset-0 flex items-center justify-center text-sm font-medium text-white pointer-events-none inter-tight"
                                        style={{ opacity: textOpacity }}
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
