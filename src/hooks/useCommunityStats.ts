import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient.ts'

function formatStat(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K+`
  return String(n)
}

interface CommunityStats {
  collectors: string
  stickers: string
  repeated: string
  rawCollectors: number
}

export function useCommunityStats() {
  const [stats, setStats] = useState<CommunityStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    supabase.rpc('get_community_stats').then(({ data, error }) => {
      if (error || !data) {
        setLoading(false)
        return
      }

      const result = {
        collectors: formatStat(data.collectors ?? 0),
        stickers: formatStat(data.stickers ?? 0),
        repeated: formatStat(data.repeated ?? 0),
        rawCollectors: data.collectors ?? 0,
      }

      setStats(result)
      setLoading(false)
    })
  }, [])

  return { stats, loading }
}
