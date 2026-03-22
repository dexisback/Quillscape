"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { onIdTokenChanged, signOut, type User } from "firebase/auth"
import { auth } from "@/lib/firebase"

type AuthContextType = {
    user: User | null
    loading: boolean
    logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(Boolean(auth))

    useEffect(() => {
        if (!auth) return
        const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
            setUser(currentUser)
            try {
                if (currentUser) {
                    const token = await currentUser.getIdToken()
                    await fetch("/api/auth/session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ token }),
                    })
                } else {
                    await fetch("/api/auth/session", { method: "DELETE" })
                }
            } catch {}
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const logout = async () => {
        if (!auth) return
        try {
            await signOut(auth)
            await fetch("/api/auth/session", { method: "DELETE" })
        } catch {}
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
