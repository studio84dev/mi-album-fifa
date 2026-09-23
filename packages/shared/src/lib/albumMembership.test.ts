import { describe, expect, it, vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { nextActiveAlbum, unlinkAlbum } from './albumMembership'

describe('album memberships', () => {
  it('preserves the active album when removing a different album', () => {
    expect(nextActiveAlbum('copa', ['fifa', 'copa'])).toBe('copa')
  })
  it('selects another owned album when the active album is removed', () => {
    expect(nextActiveAlbum('fifa', ['copa'])).toBe('copa')
  })
  it('allows an empty list without implicitly adding FIFA again', () => {
    expect(nextActiveAlbum('fifa', [])).toBe('')
    expect(nextActiveAlbum('', [])).toBe('')
  })
  it('deletes only the user-album association, never catalog or stickers', async () => {
    const eq = vi.fn()
    eq.mockReturnValueOnce({ eq }).mockResolvedValueOnce({ error: null })
    const from = vi.fn(() => ({ delete: () => ({ eq }) }))
    await unlinkAlbum({ from } as unknown as SupabaseClient, 'user-a', 'copa')
    expect(from.mock.calls).toEqual([['user_albums']])
    expect(eq.mock.calls).toEqual([
      ['user_id', 'user-a'],
      ['album_id', 'copa'],
    ])
  })
  it('propagates database failures instead of reporting a successful removal', async () => {
    const error = new Error('offline')
    const eq = vi.fn()
    eq.mockReturnValueOnce({ eq }).mockResolvedValueOnce({ error })
    const client = { from: () => ({ delete: () => ({ eq }) }) } as unknown as SupabaseClient
    await expect(unlinkAlbum(client, 'user-a', 'copa')).rejects.toBe(error)
  })
  it('does not issue unscoped deletes', async () => {
    const from = vi.fn()
    await expect(unlinkAlbum({ from } as unknown as SupabaseClient, '', 'copa')).rejects.toThrow()
    expect(from).not.toHaveBeenCalled()
  })
})
