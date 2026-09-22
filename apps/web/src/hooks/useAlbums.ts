import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
export interface Album { id: string; name: string; description: string | null }
export const DEFAULT_ALBUM_ID = 'fifa-world-cup-2026'
export function useAlbums(userId?: string) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [activeAlbumId, setActiveAlbumId] = useState(DEFAULT_ALBUM_ID)
  const refresh = useCallback(async () => { const { data } = await supabase.from('albums').select('id, name, description').order('created_at'); if (data) setAlbums(data as Album[]) }, [])
  useEffect(() => { void refresh() }, [refresh, userId])
  const createAlbum = useCallback(async (name: string) => {
    if (!userId || !name.trim()) return
    const id = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`
    const { error } = await supabase.from('albums').insert({ id, name: name.trim(), created_by: userId, is_public: false })
    if (error) throw error
    await refresh()
    setActiveAlbumId(id)
  }, [refresh, userId])
  return { albums, activeAlbumId, setActiveAlbumId, createAlbum, refresh }
}
