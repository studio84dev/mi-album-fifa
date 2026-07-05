import { useEffect, useState } from 'react'
import * as Application from 'expo-application'

const VERSION_URL =
  'https://jmgiooeiimjyyltpgrna.supabase.co/storage/v1/object/public/app-updates/version.json'

interface VersionInfo {
  androidVersionCode: number
  published: boolean
}

interface UseUpdateAvailabilityResult {
  updateAvailable: boolean
  loading: boolean
  error: Error | null
}

export function useUpdateAvailability(): UseUpdateAvailabilityResult {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const localVersionCode = parseInt(Application.nativeBuildVersion ?? '0', 10)
        const response = await fetch(VERSION_URL, { cache: 'no-store' })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const data = (await response.json()) as VersionInfo

        if (!cancelled) {
          setUpdateAvailable(data.published && localVersionCode < (data.androidVersionCode ?? 0))
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setUpdateAvailable(false)
          setError(err instanceof Error ? err : new Error(String(err)))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [])

  return { updateAvailable, loading, error }
}
