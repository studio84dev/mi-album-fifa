import { useState, useEffect, useCallback } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { FEATURES, STORAGE_KEY } from '../components/WhatsNewModal'

export function useWhatsNew() {
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const read: string[] = raw ? JSON.parse(raw) : []
        setHasUnread(FEATURES.some((f) => !read.includes(f.id)))
      })
      .catch(() => {})
  }, [])

  const openWhatsNew = useCallback(() => {
    setShowWhatsNew(true)
    const allIds = FEATURES.map((f) => f.id)
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(allIds)).catch(() => {})
    setHasUnread(false)
  }, [])

  return { showWhatsNew, setShowWhatsNew, hasUnread, openWhatsNew }
}
