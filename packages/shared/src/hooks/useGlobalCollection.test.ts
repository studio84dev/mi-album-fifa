import type { SupabaseClient } from '@supabase/supabase-js'
import { describe, expect, it, vi } from 'vitest'
import { resetUserCollection } from './useGlobalCollection'

function mockSupabase(result: { error: Error | null }): SupabaseClient {
  const query = { eq: vi.fn() }
  query.eq.mockReturnValue(query)
  query.eq.mockImplementationOnce(() => query).mockImplementationOnce(() => Promise.resolve(result))
  const deleteQuery = vi.fn(() => query)
  const from = vi.fn(() => ({ delete: deleteQuery }))
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
