import { createContext, useContext, ReactNode, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'
import { useGlobalCollection } from '../hooks/useGlobalCollection'
import type { CollectionMap } from '@mi-album-fifa/shared'

interface CollectionState {
  collection: CollectionMap
  loading: boolean
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
}

interface CollectionContextValue extends CollectionState, CollectionDispatch {}

const CollectionStateContext = createContext<CollectionState | null>(null)
const CollectionDispatchContext = createContext<CollectionDispatch | null>(null)

export function CollectionProvider({ user, children }: { user: User | null; children: ReactNode }) {
  const { collection, loading, updateEntry, totals } = useGlobalCollection(user)

  const state = useMemo(() => ({ collection, loading, totals }), [collection, loading, totals])
  const dispatch = useMemo(() => ({ updateEntry }), [updateEntry])

  return (
    <CollectionStateContext.Provider value={state}>
      <CollectionDispatchContext.Provider value={dispatch}>
        {children}
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
