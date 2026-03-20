"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth"
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
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!auth) { setLoading(false); return }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    const logout = async () => {
        if (!auth) return
        try { await signOut(auth) } catch {}
    }

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
