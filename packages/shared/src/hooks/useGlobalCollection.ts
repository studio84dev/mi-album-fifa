import { useState, useEffect, useCallback } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface CollectionEntry {
  collected: boolean
  repeated: number
}

export interface CollectionMap {
  [countryCode: string]: {
    [stickerNumber: string | number]: CollectionEntry
  }
}

export function createUseGlobalCollection(supabase: SupabaseClient) {
  return function useGlobalCollection(user: { id?: string } | null) {
    const [collection, setCollection] = useState<CollectionMap>({})
    const [loading, setLoading] = useState<boolean>(false)

    const userId = user?.id ?? null

    useEffect(() => {
      if (!userId) {
        setCollection({})
        return
      }

      setLoading(true)
      supabase
        .from('sticker_collection')
        .select('country_code, sticker_number, repeated')
        .eq('user_id', userId)
        .then(({ data, error }) => {
          if (error) {
            console.error('Error loading global collection:', error) // eslint-disable-line no-console
            setLoading(false)
            return
          }
          const map: CollectionMap = {}
          if (data) {
            data.forEach(
              ({
                country_code,
                sticker_number,
                repeated,
              }: {
                country_code: string
                sticker_number: string
                repeated: number
              }) => {
                if (!map[country_code]) map[country_code] = {}
                map[country_code][sticker_number] = { collected: true, repeated: repeated ?? 0 }
              }
            )
          }
          setCollection(map)
          setLoading(false)
        })
    }, [userId])

    const updateEntry = useCallback(
      (
        countryCode: string,
        stickerNumber: number | string,
        { collected, repeated }: { collected: boolean; repeated?: number }
      ) => {
        setCollection((prev) => {
          const prevCode = prev[countryCode] ?? {}
          if (!collected) {
            const { [stickerNumber]: _removed, ...rest } = prevCode
            return { ...prev, [countryCode]: rest }
          }
          return {
            ...prev,
            [countryCode]: {
              ...prevCode,
              [stickerNumber]: { collected: true, repeated: repeated ?? 0 },
            },
          }
        })
      },
      []
    )

    const totals = (() => {
      const SPECIAL_CODES = new Set(['FWC', 'CC', '00'])
      const TEAM_CODES = new Set(Object.keys(collection).filter((c) => !SPECIAL_CODES.has(c)))
      let teamCollected = 0
      TEAM_CODES.forEach((code) => {
        teamCollected += Object.values(collection[code] ?? {}).filter((e) => e.collected).length
      })

      const fwcCollected = Object.values(collection['FWC'] ?? {}).filter((e) => e.collected).length
      const ccCollected = Object.values(collection['CC'] ?? {}).filter((e) => e.collected).length
      const paniniCollected = Object.values(collection['00'] ?? {}).filter(
        (e) => e.collected
      ).length

      let totalRepeated = 0
      Object.values(collection).forEach((codeMap) => {
        Object.values(codeMap).forEach((e) => {
          totalRepeated += e.repeated ?? 0
        })
      })

      return { teamCollected, fwcCollected, ccCollected, paniniCollected, totalRepeated }
    })()

    return { collection, loading, updateEntry, totals }
  }
}
