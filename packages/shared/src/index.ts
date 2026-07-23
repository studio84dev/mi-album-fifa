export { createSupabaseClient, createInvokeFunction } from './lib/supabaseClient'
export type { SupabaseConfig } from './lib/supabaseClient'
export { decodePaniniQR } from './lib/paniniQR'
export type { AlbumState, StickerState } from './types/paniniQR'

export { createUseAuth } from './hooks/useAuth'
export { createUseCommunityStats } from './hooks/useCommunityStats'
export type { CommunityStats } from './hooks/useCommunityStats'
export { createUseGlobalCollection } from './hooks/useGlobalCollection'
export type { CollectionEntry, CollectionMap } from './hooks/useGlobalCollection'
export { createI18nHook } from './hooks/useI18n'
export type { I18nStorageAdapter } from './hooks/useI18n'

export { default as allStickers } from './data/stickers'
export type { Sticker, CardType } from './data/stickers'
export { default as flags } from './data/flags'

export { default as esTranslations } from './i18n/es.json'
export { default as enTranslations } from './i18n/en.json'

export { default as curiositiesEs } from './data/curiosities.es.json'
export { default as curiositiesEn } from './data/curiosities.en.json'
