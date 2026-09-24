import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAlbumStickers } from '../data/albums'

export async function resetUserCollection(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  albumId: string
): Promise<void> {
  if (!userId || !albumId) return

  const { error } = await supabase
    .from('sticker_collection')
    .delete()
    .eq('user_id', userId)
    .eq('album_id', albumId)
  if (error) throw error
}

export async function completeUserCollection(
  supabase: SupabaseClient,
  userId: string | null | undefined,
  albumId: string
): Promise<void> {
  if (!userId || !albumId) return

  const stickers = getAlbumStickers(albumId)
  if (stickers.length === 0) return

  const now = new Date().toISOString()
  const rows = stickers.map((sticker) => ({
    user_id: userId,
    album_id: albumId,
    country_code: sticker.country_code ?? sticker.code,
    sticker_number: sticker.number,
    repeated: 0,
    updated_at: now,
  }))

  const { error } = await supabase
    .from('sticker_collection')
    .upsert(rows, { onConflict: 'user_id,album_id,country_code,sticker_number' })
  if (error) throw error
}

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
  return function useGlobalCollection(
    user: { id?: string } | null,
    albumId = 'fifa-world-cup-2026'
  ) {
    const [collection, setCollection] = useState<CollectionMap>({})
    const [loading, setLoading] = useState<boolean>(false)

    const userId = user?.id ?? null
    const scope = `${userId}:${albumId}`
    const [loadedScope, setLoadedScope] = useState('')
    const request = useRef(0)

    const refresh = useCallback(() => {
      const version = ++request.current
      if (!userId || !albumId) {
        setCollection({})
        setLoadedScope(scope)
        setLoading(false)
        return
      }

      setLoading(true)
      supabase
        .from('sticker_collection')
        .select('country_code, sticker_number, repeated')
        .eq('user_id', userId)
        .eq('album_id', albumId)
        .then(({ data, error }) => {
          if (request.current !== version) return
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
          setLoadedScope(scope)
          setLoading(false)
        })
    }, [userId, albumId, scope])

    useEffect(() => {
      refresh()
      return () => {
        request.current++
      }
    }, [refresh])

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

    const resetCollection = useCallback(async (): Promise<void> => {
      if (!userId) return

      await resetUserCollection(supabase, userId, albumId)
      setCollection({})
    }, [userId, albumId])

    const completeCollection = useCallback(async (): Promise<void> => {
      if (!userId) return

      await completeUserCollection(supabase, userId, albumId)
      const map: CollectionMap = {}
      getAlbumStickers(albumId).forEach((sticker) => {
        const code = sticker.country_code ?? sticker.code
        const number = sticker.number as number
        if (!map[code]) map[code] = {}
        map[code][number] = { collected: true, repeated: 0 }
      })
      setCollection(map)
    }, [userId, albumId])

    const totals = useMemo(() => {
      const SPECIAL_CODES = new Set(['FWC', 'CC', '00'])
      const TEAM_CODES = new Set(Object.keys(collection).filter((c) => !SPECIAL_CODES.has(c)))
      let teamCollected = 0
      TEAM_CODES.forEach((code) => {
        teamCollected += Object.values(collection[code] ?? {}).filter((e) => e.collected).length
      })

      const fwcCollected = Object.values(collection['FWC'] ?? {}).filter((e) => e.collected).length
      const ccCollected = Object.values(collection['CC'] ?? {}).filter((e) => e.collected).length

      let totalRepeated = 0
      Object.values(collection).forEach((codeMap) => {
        Object.values(codeMap).forEach((e) => {
          totalRepeated += e.repeated ?? 0
        })
      })

      return { teamCollected, fwcCollected, ccCollected, totalRepeated }
    }, [collection])

    const ready = loadedScope === scope
    return {
      collection: ready ? collection : {},
      loading: loading || (!!userId && !ready),
      updateEntry,
      resetCollection,
      completeCollection,
      totals: ready
        ? totals
        : { teamCollected: 0, fwcCollected: 0, ccCollected: 0, totalRepeated: 0 },
      refresh,
    }
  }
}
