import { useCallback, useEffect, useState } from 'react'

export const APP_PROMOTION_STORAGE_KEY = 'albumfan-play-store-accepted'

function hasAcceptedPromotion() {
  try {
    return localStorage.getItem(APP_PROMOTION_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function useAppPromotion() {
  const [showAppPromotion, setShowAppPromotion] = useState(() => !hasAcceptedPromotion())

  // Dismiss only for this visit. A reload/new visit shows the invitation again.
  const dismissAppPromotion = useCallback(() => setShowAppPromotion(false), [])
  const acceptAppPromotion = useCallback(() => {
    try {
      localStorage.setItem(APP_PROMOTION_STORAGE_KEY, '1')
    } catch {
      // Storage can be unavailable; the store link must still work.
    }
    setShowAppPromotion(false)
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === APP_PROMOTION_STORAGE_KEY && event.newValue === '1') {
        setShowAppPromotion(false)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { showAppPromotion, dismissAppPromotion, acceptAppPromotion }
}
