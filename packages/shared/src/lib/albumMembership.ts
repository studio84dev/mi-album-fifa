import type { SupabaseClient } from '@supabase/supabase-js'

export function nextActiveAlbum(active: string, owned: string[]): string {
  return owned.includes(active) ? active : (owned[0] ?? '')
}

export async function unlinkAlbum(
  client: SupabaseClient,
  userId: string,
  albumId: string
): Promise<void> {
  if (!userId || !albumId) throw new Error('Missing album membership')
  const { error } = await client
    .from('user_albums')
    .delete()
    .eq('user_id', userId)
    .eq('album_id', albumId)
  if (error) throw error
}
