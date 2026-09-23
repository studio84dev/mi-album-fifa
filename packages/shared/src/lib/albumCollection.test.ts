import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_ALBUM_ID, COPA_AMERICA_ALBUM_ID, getAlbumStickers } from '../data/albums'
import { saveAlbumSticker } from './albumCollection'

describe('system album catalogs', () => {
  it('provides three countries with unique numbered slots in the sample album', () => {
    const cards = getAlbumStickers(COPA_AMERICA_ALBUM_ID)
    expect([...new Set(cards.map((c) => c.country_code))]).toEqual(['ARG', 'BRA', 'CHI'])
    expect(cards).toHaveLength(9)
    expect(new Set(cards.map((c) => c.code)).size).toBe(9)
    for (const code of ['ARG', 'BRA', 'CHI']) {
      expect(cards.filter((c) => c.country_code === code).map((c) => c.number)).toEqual([1, 2, 3])
    }
    expect(cards.every((c) => c.page > 0 && c.iso && c.team_name)).toBe(true)
    expect(getAlbumStickers(DEFAULT_ALBUM_ID).length).toBeGreaterThan(900)
    expect(getAlbumStickers('unknown')).toEqual([])
  })

  it('saves the same country and number under distinct album keys', async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null })
    const client = { from: vi.fn(() => ({ upsert })) } as unknown as SupabaseClient
    for (const id of [DEFAULT_ALBUM_ID, COPA_AMERICA_ALBUM_ID]) {
      await saveAlbumSticker(client, 'user-1', id, 'ARG', 1, true, 2)
      expect(upsert).toHaveBeenLastCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          album_id: id,
          country_code: 'ARG',
          sticker_number: 1,
          repeated: 2,
        }),
        { onConflict: 'user_id,album_id,country_code,sticker_number' }
      )
    }
  })

  it('restricts deletion to the user, album and exact sticker', async () => {
    const eq = vi.fn()
    const query = { eq }
    eq.mockReturnValue(query)
    eq.mockReturnValueOnce(query)
      .mockReturnValueOnce(query)
      .mockReturnValueOnce(query)
      .mockResolvedValueOnce({ error: null })
    const client = { from: vi.fn(() => ({ delete: () => query })) } as unknown as SupabaseClient
    await saveAlbumSticker(client, 'user-1', COPA_AMERICA_ALBUM_ID, 'BRA', 2, false, 0)
    expect(eq.mock.calls).toEqual([
      ['user_id', 'user-1'],
      ['album_id', COPA_AMERICA_ALBUM_ID],
      ['country_code', 'BRA'],
      ['sticker_number', 2],
    ])
  })

  it('rejects stickers absent from the chosen catalog before writing', async () => {
    const from = vi.fn()
    const client = { from } as unknown as SupabaseClient
    await expect(
      saveAlbumSticker(client, 'u', COPA_AMERICA_ALBUM_ID, 'MEX', 1, true, 0)
    ).rejects.toThrow()
    await expect(
      saveAlbumSticker(client, 'u', COPA_AMERICA_ALBUM_ID, 'ARG', 20, true, 0)
    ).rejects.toThrow()
    expect(from).not.toHaveBeenCalled()
  })

  it('propagates failed writes', async () => {
    const error = new Error('offline')
    const client = {
      from: () => ({ upsert: async () => ({ error }) }),
    } as unknown as SupabaseClient
    await expect(
      saveAlbumSticker(client, 'u', COPA_AMERICA_ALBUM_ID, 'ARG', 1, true, 0)
    ).rejects.toBe(error)
  })
})
