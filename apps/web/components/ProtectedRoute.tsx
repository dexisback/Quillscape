"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) router.replace("/")
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[oklch(0.96_0.025_75)]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-[oklch(0.35_0.1_35)] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[oklch(0.35_0.1_35)] font-medium">Loading...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return <>{children}</>
}
