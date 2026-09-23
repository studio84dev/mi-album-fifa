import { useCallback } from 'react'
import { Alert } from 'react-native'
import { saveAlbumSticker } from '@mi-album-fifa/shared'
import { supabase } from '../lib/supabaseClient'
import { useCollectionDispatch } from '../context/CollectionContext'
import { useI18n } from './useI18n'

export function useAlbumStickerMutation() {
  const { refresh } = useCollectionDispatch()
  const { t } = useI18n()
  return useCallback(
    async (
      userId: string,
      albumId: string,
      code: string,
      number: number,
      collected: boolean,
      repeated: number
    ) => {
      try {
        await saveAlbumSticker(supabase, userId, albumId, code, number, collected, repeated)
      } catch {
        refresh()
        Alert.alert(t('albumsErrorTitle'), t('albumsErrorBody'))
      }
    },
    [refresh, t]
  )
}
