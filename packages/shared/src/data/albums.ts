import fifa from './stickers'
import copaAmerica from './copaAmerica2028'
import type { Sticker } from './stickers'

export const DEFAULT_ALBUM_ID = 'fifa-world-cup-2026'
export const COPA_AMERICA_ALBUM_ID = 'copa-america-2028'
export const SYSTEM_ALBUMS = [
  { id: DEFAULT_ALBUM_ID, nameKey: 'albumsDefaultName', sample: false },
  { id: COPA_AMERICA_ALBUM_ID, nameKey: 'albumsCopaAmericaName', sample: true },
] as const
const catalogs: Record<string, Sticker[]> = {
  [DEFAULT_ALBUM_ID]: fifa,
  [COPA_AMERICA_ALBUM_ID]: copaAmerica,
}
const empty: Sticker[] = []
export function getAlbumStickers(albumId: string): Sticker[] {
  return catalogs[albumId] ?? empty
}
