import { useState, useEffect } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'

export function createUseAuth(
  supabase: SupabaseClient,
  invokeFunction: (_name: string, _body: unknown, _token?: string) => Promise<Response>
) {
  return function useAuth() {
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
            console.error('upsert-user error:', err) // eslint-disable-line no-console
          }
        }
      })

      return () => subscription.unsubscribe()
    }, [])

    const signInWithGoogle = async (redirectTo: string) => {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
    }

    const signOut = async () => {
      await supabase.auth.signOut()
    }

    return { user, loading, signInWithGoogle, signOut }
  }
}
