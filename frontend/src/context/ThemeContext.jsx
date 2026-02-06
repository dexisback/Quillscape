import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()
const THEME_VERSION = 'v2'

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const version = localStorage.getItem('themeVersion')
    if (version !== THEME_VERSION) {
      localStorage.removeItem('darkMode')
      localStorage.setItem('themeVersion', THEME_VERSION)
      return false
    }
    const saved = localStorage.getItem('darkMode')
    return saved !== null ? JSON.parse(saved) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
