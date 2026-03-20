"use client"

import { createContext, useContext, useState, useEffect } from "react"

type ThemeContextType = {
  darkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType>({
  darkMode: false,
  toggleTheme: () => {},
})

const THEME_VERSION = "v2"

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false)

  // Read from localStorage after mount (SSR-safe)
  useEffect(() => {
    const version = localStorage.getItem("themeVersion")
    if (version !== THEME_VERSION) {
      localStorage.removeItem("darkMode")
      localStorage.setItem("themeVersion", THEME_VERSION)
      setDarkMode(false)
    } else {
      const saved = localStorage.getItem("darkMode")
      setDarkMode(saved !== null ? JSON.parse(saved) : false)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const toggleTheme = () => setDarkMode((prev) => !prev)

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
