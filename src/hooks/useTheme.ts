import { useState, useEffect } from 'react'

const THEME_KEY = 'worldcup-album-theme'
const DEFAULT_THEME = 'light'

export function useTheme() {
  const [theme, setTheme] = useState<string>(() => {
    const stored = localStorage.getItem(THEME_KEY)
    return stored || DEFAULT_THEME
  })

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}
