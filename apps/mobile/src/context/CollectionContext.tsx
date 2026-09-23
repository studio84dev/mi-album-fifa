import {
  createContext,
  useContext,
  ReactNode,
  useMemo,
  useState,
  useEffect,
  useCallback,
} from 'react'
import type { User } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useGlobalCollection } from '../hooks/useGlobalCollection'
import type { CollectionMap } from '@mi-album-fifa/shared'
import { SYSTEM_ALBUMS, nextActiveAlbum, unlinkAlbum } from '@mi-album-fifa/shared'
import { supabase } from '../lib/supabaseClient'

export const DEFAULT_ALBUM_ID = 'fifa-world-cup-2026'
const ACTIVE_ALBUM_KEY = 'mi-album-fifa.active-album'

export interface Album {
  id: string
  name: string
  description: string | null
  created_by: string | null
  is_public: boolean
}

interface CollectionState {
  collection: CollectionMap
  loading: boolean
  albums: Album[]
  albumsLoading: boolean
  myAlbumIds: string[]
  albumsError: boolean
  activeAlbumId: string
  activeAlbum: Album | null
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
    totalRepeated: number
  }
}

interface CollectionDispatch {
  updateEntry: (
    _countryCode: string,
    _stickerNumber: number | string,
    _data: { collected: boolean; repeated?: number }
  ) => void
  resetCollection: () => Promise<void>
  refresh: () => void
  selectAlbum: (_albumId: string) => Promise<void>
  addAlbum: (_albumId: string) => Promise<void>
  removeAlbum: (_albumId: string) => Promise<void>
  refreshAlbums: () => Promise<void>
}

interface CollectionContextValue extends CollectionState, CollectionDispatch {}

const CollectionStateContext = createContext<CollectionState | null>(null)
const CollectionDispatchContext = createContext<CollectionDispatch | null>(null)

export function CollectionProvider({ user, children }: { user: User | null; children: ReactNode }) {
  return (
    <UserCollectionProvider key={user?.id ?? 'guest'} user={user}>
      {children}
    </UserCollectionProvider>
  )
}

function UserCollectionProvider({ user, children }: { user: User | null; children: ReactNode }) {
  const [albums, setAlbums] = useState<Album[]>([])
  const [albumsLoading, setAlbumsLoading] = useState(false)
  const [myAlbumIds, setMyAlbumIds] = useState<string[]>([])
  const [albumsError, setAlbumsError] = useState(false)
  const [activeAlbumId, setActiveAlbumId] = useState(user ? '' : DEFAULT_ALBUM_ID)
  const { collection, loading, updateEntry, resetCollection, totals, refresh } =
    useGlobalCollection(user, activeAlbumId)

  const refreshAlbums = useCallback(async () => {
    setAlbumsLoading(true)
    setAlbumsError(false)
    try {
      const bundledAlbums: Album[] = SYSTEM_ALBUMS.map((album) => ({
        id: album.id,
        name: album.id,
        description: null,
        created_by: null,
        is_public: true,
      }))
      setAlbums(bundledAlbums)

      const { data } = await supabase
        .from('albums')
        .select('id, name, description, created_by, is_public')
        .eq('is_public', true)
        .is('created_by', null)
        .order('created_at')

      const databaseAlbums = (data ?? []).filter((album) =>
        SYSTEM_ALBUMS.some((systemAlbum) => systemAlbum.id === album.id)
      )
      const available = bundledAlbums.map(
        (bundled) => databaseAlbums.find((album) => album.id === bundled.id) ?? bundled
      )

      let owned = user?.id ? [] : [DEFAULT_ALBUM_ID]
      if (user?.id) {
        const result = await supabase.from('user_albums').select('album_id').eq('user_id', user.id)
        // Compatibility while the membership migration is being deployed: the
        // bundled catalog remains usable and existing users keep FIFA selected.
        owned = result.error
          ? [DEFAULT_ALBUM_ID]
          : [...new Set((result.data ?? []).map((row) => row.album_id))]
      }
      const saved = await AsyncStorage.getItem(`${ACTIVE_ALBUM_KEY}:${user?.id ?? 'guest'}`)
      setAlbums(available)
      owned = owned.filter((id) => available.some((a) => a.id === id))
      setMyAlbumIds(owned)
      setActiveAlbumId(nextActiveAlbum(saved ?? '', owned))
    } catch (error) {
      console.error('Error loading albums:', error) // eslint-disable-line no-console
      setAlbumsError(true)
    } finally {
      setAlbumsLoading(false)
    }
  }, [user])

  useEffect(() => {
    // Fetch server catalog and membership when the authenticated session changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshAlbums()
  }, [refreshAlbums])

  const selectAlbum = useCallback(
    async (albumId: string) => {
      if (!myAlbumIds.includes(albumId) || !albums.some((a) => a.id === albumId)) return
      await AsyncStorage.setItem(`${ACTIVE_ALBUM_KEY}:${user?.id ?? 'guest'}`, albumId)
      setActiveAlbumId(albumId)
    },
    [albums, myAlbumIds, user?.id]
  )

  const addAlbum = useCallback(
    async (albumId: string) => {
      if (!user?.id || !albums.some((a) => a.id === albumId)) throw new Error('Invalid album')
      const { error } = await supabase
        .from('user_albums')
        .upsert(
          { user_id: user.id, album_id: albumId },
          { onConflict: 'user_id,album_id', ignoreDuplicates: true }
        )
      if (error) throw error
      setMyAlbumIds((prev) => [...new Set([...prev, albumId])])
      await AsyncStorage.setItem(`${ACTIVE_ALBUM_KEY}:${user.id}`, albumId)
      setActiveAlbumId(albumId)
    },
    [albums, user]
  )

  const removeAlbum = useCallback(
    async (albumId: string) => {
      if (!user?.id) throw new Error('Not authenticated')
      await unlinkAlbum(supabase, user.id, albumId)
      const remaining = myAlbumIds.filter((id) => id !== albumId)
      const next = nextActiveAlbum(activeAlbumId, remaining)
      setMyAlbumIds(remaining)
      setActiveAlbumId(next)
      await AsyncStorage.setItem(`${ACTIVE_ALBUM_KEY}:${user.id}`, next)
    },
    [user, myAlbumIds, activeAlbumId]
  )

  const activeAlbum = useMemo(
    () => albums.find((album) => album.id === activeAlbumId) ?? null,
    [albums, activeAlbumId]
  )
  const state = useMemo(
    () => ({
      collection,
      loading,
      totals,
      albums,
      albumsLoading,
      myAlbumIds,
      albumsError,
      activeAlbumId,
      activeAlbum,
    }),
    [
      collection,
      loading,
      totals,
      albums,
      albumsLoading,
      myAlbumIds,
      albumsError,
      activeAlbumId,
      activeAlbum,
    ]
  )
  const dispatch = useMemo(
    () => ({
      updateEntry,
      resetCollection,
      refresh,
      selectAlbum,
      addAlbum,
      removeAlbum,
      refreshAlbums,
    }),
    [updateEntry, resetCollection, refresh, selectAlbum, addAlbum, removeAlbum, refreshAlbums]
  )

  return (
    <CollectionStateContext.Provider value={state}>
      <CollectionDispatchContext.Provider value={dispatch}>
        <CollectionScope key={`${user?.id ?? 'guest'}:${activeAlbumId}`}>
          {children}
        </CollectionScope>
      </CollectionDispatchContext.Provider>
    </CollectionStateContext.Provider>
  )
}

export function useCollection(): CollectionContextValue {
  const state = useContext(CollectionStateContext)
  const dispatch = useContext(CollectionDispatchContext)
  if (!state || !dispatch) throw new Error('useCollection must be used within CollectionProvider')
  return { ...state, ...dispatch }
}

export function useCollectionState(): CollectionState {
  const ctx = useContext(CollectionStateContext)
  if (!ctx) throw new Error('useCollectionState must be used within CollectionProvider')
  return ctx
}

export function useCollectionDispatch(): CollectionDispatch {
  const ctx = useContext(CollectionDispatchContext)
  if (!ctx) throw new Error('useCollectionDispatch must be used within CollectionProvider')
  return ctx
}

function CollectionScope({ children }: { children: ReactNode }) {
  return <>{children}</>
}
