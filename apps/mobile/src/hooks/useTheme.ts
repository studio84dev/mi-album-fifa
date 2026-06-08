import { useColorScheme } from 'react-native'

const light = {
  bgPrimary:     '#f8fafc',
  bgSecondary:   '#ffffff',
  bgTertiary:    '#f1f5f9',
  bgQuaternary:  '#e2e8f0',
  textPrimary:   '#0f172a',
  textSecondary: '#334155',
  textMuted:     '#64748b',
  textDisabled:  '#94a3b8',
  borderColor:   '#e2e8f0',
  borderStrong:  '#cbd5e1',
  cardBg:        '#ffffff',
  inputBg:       '#ffffff',
}

const dark = {
  bgPrimary:     '#0f172a',
  bgSecondary:   '#111827',
  bgTertiary:    '#1e293b',
  bgQuaternary:  '#273449',
  textPrimary:   '#f8fafc',
  textSecondary: '#cbd5e1',
  textMuted:     '#64748b',
  textDisabled:  '#334155',
  borderColor:   'rgba(255,255,255,0.07)',
  borderStrong:  'rgba(255,255,255,0.14)',
  cardBg:        '#111827',
  inputBg:       '#111827',
}

export const colors = {
  accentBlue:         '#3b82f6',
  accentBlueHover:    '#2563eb',
  accentOrange:       '#e8742a',
  accentOrangeHover:  '#d4621c',
}

export function useTheme() {
  const scheme = useColorScheme()
  const theme = scheme === 'light' ? light : dark
  return { theme, colors, isDark: scheme !== 'light' }
}
