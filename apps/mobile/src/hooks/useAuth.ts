import { useState, useEffect } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import type { User } from '@supabase/supabase-js'
import { supabase, invokeFunction } from '../lib/supabaseClient'

WebBrowser.maybeCompleteAuthSession()

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentUser) {
        try {
          await invokeFunction(
            'upsert-user',
            {
              email: currentUser.email,
              display_name: currentUser.user_metadata?.full_name || currentUser.email,
            },
            session?.access_token
          )
        } catch (err) {
          console.error('upsert-user error:', err) // eslint-disable-line no-console
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const returnUrl = Linking.createURL('auth/callback')
    const redirectTo = `https://mialbumfifa.com/mobile-callback.html?return=${encodeURIComponent(returnUrl)}`
    console.log('returnUrl:', returnUrl) // eslint-disable-line no-console
    console.log('redirectTo:', redirectTo) // eslint-disable-line no-console
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    })
    if (error || !data.url) {
      console.error('OAuth error:', error) // eslint-disable-line no-console
      return
    }
    console.log('OAuth URL:', data.url) // eslint-disable-line no-console

    const result = await WebBrowser.openAuthSessionAsync(data.url, returnUrl)
    console.log('result type:', result.type) // eslint-disable-line no-console
    if (result.type === 'success') {
      await handleAuthCallback(result.url)
    }

    async function handleAuthCallback(url: string) {
      const parsed = Linking.parse(url)
      const params = (parsed.queryParams ?? {}) as Record<string, string>
      const hash = url.split('#')[1] ?? ''
      const hashParams = Object.fromEntries(new URLSearchParams(hash).entries())
      const accessToken = params['access_token'] ?? hashParams['access_token']
      const refreshToken = params['refresh_token'] ?? hashParams['refresh_token']
      // eslint-disable-next-line no-console
      console.log('callback url:', url, {
        accessToken: !!accessToken,
        refreshToken: !!refreshToken,
      })
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
      }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, signInWithGoogle, signOut }
}
