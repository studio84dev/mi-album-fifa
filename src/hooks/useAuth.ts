import { useState, useEffect } from 'react'
import { supabase, invokeFunction } from '../lib/supabaseClient.ts'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

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
          console.error('upsert-user error:', err)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return { user, loading, signInWithGoogle, signOut }
}
