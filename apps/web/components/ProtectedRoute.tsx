"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const isHomePath = pathname === "/home" || pathname.startsWith("/home/")

    useEffect(() => {
        if (isHomePath) return
        if (!loading && !user) router.replace("/auth")
    }, [isHomePath, user, loading, router])

    if (isHomePath) return <>{children}</>

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-muted-foreground">Loading your workspace...</p>
                </div>
            </div>
        )
    }

    if (!user) return null

    return <>{children}</>
}
