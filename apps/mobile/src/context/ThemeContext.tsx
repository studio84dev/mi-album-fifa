import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

const light = {
  bgPrimary: '#f8fafc',
  bgSecondary: '#ffffff',
  bgTertiary: '#f1f5f9',
  bgQuaternary: '#e2e8f0',
  textPrimary: '#0f172a',
  textSecondary: '#334155',
  textMuted: '#64748b',
  textDisabled: '#94a3b8',
  borderColor: '#e2e8f0',
  borderStrong: '#cbd5e1',
  cardBg: '#ffffff',
  inputBg: '#ffffff',
}

const dark = {
  bgPrimary: '#0f172a',
  bgSecondary: '#111827',
  bgTertiary: '#1e293b',
  bgQuaternary: '#273449',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted: '#64748b',
  textDisabled: '#334155',
  borderColor: 'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',
  cardBg: '#111827',
  inputBg: '#111827',
}

export const colors = {
  accentBlue: '#3b82f6',
  accentBlueHover: '#2563eb',
  accentOrange: '#e8742a',
  accentOrangeHover: '#d4621c',
  highlightYellow: '#facc15',
  successGreen: '#22c55e',
  errorRed: '#ef4444',
  kofiRed: '#ff5e5b',
  googleBlue: '#4285F4',
  googleGreen: '#34A853',
  googleYellow: '#FBBC05',
  googleRed: '#EA4335',
  starYellow: '#f59e0b',
  ccRed: '#e84040',
}

type ThemeMode = 'light' | 'dark' | 'system'
type ThemeColors = typeof light

interface ThemeState {
  theme: ThemeColors
  isDark: boolean
  themeMode: ThemeMode
  effectiveTheme: 'light' | 'dark'
}

interface ThemeDispatch {
  toggleTheme: () => void
  setTheme: (_mode: ThemeMode) => void
}

interface ThemeContextValue extends ThemeState, ThemeDispatch {}

const ThemeStateContext = createContext<ThemeState | null>(null)
const ThemeDispatchContext = createContext<ThemeDispatch | null>(null)

const THEME_STORAGE_KEY = 'theme_mode'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemeMode(saved)
        }
      })
      .catch(() => null)
  }, [])

  const effectiveTheme: 'light' | 'dark' =
    themeMode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themeMode

  const theme = effectiveTheme === 'dark' ? dark : light
  const isDark = effectiveTheme === 'dark'

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const currentEffective =
        prev === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : prev
      const newMode = currentEffective === 'light' ? 'dark' : 'light'
      AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => null)
      return newMode
    })
  }, [systemScheme])

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode)
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(() => null)
  }, [])

  const state = useMemo(
    () => ({ theme, isDark, themeMode, effectiveTheme }),
    [theme, isDark, themeMode, effectiveTheme]
  )

  const dispatch = useMemo(() => ({ toggleTheme, setTheme }), [toggleTheme, setTheme])

  return (
    <ThemeStateContext.Provider value={state}>
      <ThemeDispatchContext.Provider value={dispatch}>{children}</ThemeDispatchContext.Provider>
    </ThemeStateContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const state = useContext(ThemeStateContext)
  const dispatch = useContext(ThemeDispatchContext)
  if (!state || !dispatch) throw new Error('useTheme must be used within ThemeProvider')
  return { ...state, ...dispatch }
}

export function useThemeDispatch(): ThemeDispatch {
  const ctx = useContext(ThemeDispatchContext)
  if (!ctx) throw new Error('useThemeDispatch must be used within ThemeProvider')
  return ctx
}
