import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect, useState } from 'react'
import '../global.css'
import { initLocale } from '@/src/hooks/useI18n'

export { ErrorBoundary } from 'expo-router'

export const unstable_settings = {
  initialRouteName: '(tabs)',
}

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initLocale().then(() => {
      setReady(true)
      SplashScreen.hideAsync()
    })
  }, [])

  if (!ready) return null

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="country/[code]" options={{ headerShown: false }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  )
}
