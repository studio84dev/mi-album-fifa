import { createUseAuth } from '@mi-album-fifa/shared'
import { supabase, invokeFunction } from '../lib/supabaseClient.ts'

const useAuthBase = createUseAuth(supabase, invokeFunction)

export function useAuth() {
  const { user, loading, signInWithGoogle, signOut } = useAuthBase()

  const signInWithGoogleWeb = async () => {
    await signInWithGoogle(window.location.origin)
  }

  return { user, loading, signInWithGoogle: signInWithGoogleWeb, signOut }
}
