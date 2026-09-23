import type { SupabaseClient } from '@supabase/supabase-js'
import { getAlbumStickers } from '../data/albums'

export async function saveAlbumSticker(
  client: SupabaseClient,
  userId: string,
  albumId: string,
  countryCode: string,
  number: number,
  collected: boolean,
  repeated: number
): Promise<void> {
  if (
    !userId ||
    !getAlbumStickers(albumId).some((s) => (s.country_code ?? s.code) === countryCode && s.number === number)
  ) {
    throw new Error('Invalid album sticker')
  }
  if (!Number.isInteger(repeated) || repeated < 0) throw new Error('Invalid repeated count')
  const query = client.from('sticker_collection')
  const { error } = collected
    ? await query.upsert(
        {
          user_id: userId,
          album_id: albumId,
          country_code: countryCode,
          sticker_number: number,
          repeated,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,album_id,country_code,sticker_number' }
      )
    : await query
        .delete()
        .eq('user_id', userId)
        .eq('album_id', albumId)
        .eq('country_code', countryCode)
        .eq('sticker_number', number)
  if (error) throw error
}
