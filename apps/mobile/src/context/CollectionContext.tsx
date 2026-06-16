import { createContext, useContext, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { useGlobalCollection } from '../hooks/useGlobalCollection'
import type { CollectionMap } from '@mi-album-fifa/shared'

interface CollectionContextValue {
  collection: CollectionMap
  loading: boolean
  updateEntry: (
    countryCode: string,
    stickerNumber: number | string,
    data: { collected: boolean; repeated?: number }
  ) => void
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
    paniniCollected: number
    totalRepeated: number
  }
}

const CollectionContext = createContext<CollectionContextValue | null>(null)

export function CollectionProvider({ user, children }: { user: User | null; children: ReactNode }) {
  const value = useGlobalCollection(user)
  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>
}

export function useCollection(): CollectionContextValue {
  const ctx = useContext(CollectionContext)
  if (!ctx) throw new Error('useCollection must be used within CollectionProvider')
  return ctx
}
