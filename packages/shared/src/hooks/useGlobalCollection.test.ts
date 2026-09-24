import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { completeUserCollection, resetUserCollection } from './useGlobalCollection'
import { DEFAULT_ALBUM_ID, getAlbumStickers } from '../data/albums'

function mockSupabase(result: { error: Error | null }): SupabaseClient {
  const query = { eq: vi.fn() }
  query.eq.mockReturnValue(query)
  query.eq.mockImplementationOnce(() => query).mockImplementationOnce(() => Promise.resolve(result))
  const deleteQuery = vi.fn(() => query)
  const from = vi.fn(() => ({ delete: deleteQuery }))
  return { from } as unknown as SupabaseClient
}

function mockUpsertSupabase(result: { error: Error | null }): SupabaseClient {
  const upsert = vi.fn(() => Promise.resolve(result))
  const from = vi.fn(() => ({ upsert }))
  return { from } as unknown as SupabaseClient
}

describe('resetUserCollection', () => {
  it('does nothing when there is no authenticated user', async () => {
    const supabase = mockSupabase({ error: null })

    await resetUserCollection(supabase, null, 'album-1')

    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('deletes every collection row belonging to the user', async () => {
    const supabase = mockSupabase({ error: null })

    await resetUserCollection(supabase, 'user-123', 'album-1')

    expect(supabase.from).toHaveBeenCalledWith('sticker_collection')
    const query = supabase.from('sticker_collection')
    expect(query.delete).toHaveBeenCalledTimes(1)
    expect(query.delete().eq).toHaveBeenCalledWith('user_id', 'user-123')
    expect(query.delete().eq).toHaveBeenCalledWith('album_id', 'album-1')
  })

  it('propagates a database error', async () => {
    const error = new Error('delete failed')
    const supabase = mockSupabase({ error })

    await expect(resetUserCollection(supabase, 'user-123', 'album-1')).rejects.toBe(error)
  })
})

describe('completeUserCollection', () => {
  it('does nothing when there is no authenticated user', async () => {
    const supabase = mockUpsertSupabase({ error: null })

    await completeUserCollection(supabase, null, DEFAULT_ALBUM_ID)

    expect(supabase.from).not.toHaveBeenCalled()
  })

  it('upserts every sticker of the album as collected with no duplicates', async () => {
    const supabase = mockUpsertSupabase({ error: null })

    await completeUserCollection(supabase, 'user-123', DEFAULT_ALBUM_ID)

    expect(supabase.from).toHaveBeenCalledWith('sticker_collection')
    const query = supabase.from('sticker_collection')
    const stickers = getAlbumStickers(DEFAULT_ALBUM_ID)
    expect(query.upsert).toHaveBeenCalledTimes(1)
    const [rows, options] = (query.upsert as ReturnType<typeof vi.fn>).mock.calls[0]
    expect(rows).toHaveLength(stickers.length)
    expect(rows[0]).toMatchObject({
      user_id: 'user-123',
      album_id: DEFAULT_ALBUM_ID,
      repeated: 0,
    })
    expect(options).toEqual({ onConflict: 'user_id,album_id,country_code,sticker_number' })
  })

  it('propagates a database error', async () => {
    const error = new Error('upsert failed')
    const supabase = mockUpsertSupabase({ error })

    await expect(completeUserCollection(supabase, 'user-123', DEFAULT_ALBUM_ID)).rejects.toBe(error)
  })
})
