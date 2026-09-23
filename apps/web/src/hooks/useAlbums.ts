import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
export interface Album {
  id: string
  name: string
  description: string | null
}
export const DEFAULT_ALBUM_ID = 'fifa-world-cup-2026'
export function useAlbums(userId?: string) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [activeAlbumId, setActiveAlbumId] = useState(DEFAULT_ALBUM_ID)
  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from('albums')
      .select('id, name, description')
      .eq('is_public', true)
      .is('created_by', null)
      .order('created_at')
    if (data) setAlbums(data as Album[])
  }, [])
  useEffect(() => {
    void refresh()
  }, [refresh, userId])
  return { albums, activeAlbumId, setActiveAlbumId, refresh }
}
