import { useEffect } from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { supabase } from '@/src/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()
  const params = useLocalSearchParams<{ access_token?: string; refresh_token?: string }>()

  useEffect(() => {
    async function handleCallback() {
      const { access_token, refresh_token } = params
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token })
      }
      router.replace('/')
    }
    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#3B82F6" size="large" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
