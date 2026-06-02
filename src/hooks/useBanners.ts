import { useState, useEffect, useCallback } from 'react'
import { FEATURES, STORAGE_KEY as WHATS_NEW_KEY } from '../components/WhatsNewModal.tsx'

export function useBanners(user: { id?: string } | null) {
  const [showWhatsNew, setShowWhatsNew] = useState(false)
  const [whatsNewUnread, setWhatsNewUnread] = useState(() => {
    const read = JSON.parse(localStorage.getItem(WHATS_NEW_KEY) || '[]')
    return FEATURES.some((f) => !read.includes(f.id))
  })
  const [showWelcomeModal, setShowWelcomeModal] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showSuggestionModal, setShowSuggestionModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showRedirectBanner, setShowRedirectBanner] = useState(() => {
    const dismissed = sessionStorage.getItem('redirect-banner-dismissed')
    if (dismissed) return false
    return new URLSearchParams(window.location.search).get('ref') === 'old'
  })

  useEffect(() => {
    if (user) {
      if (!localStorage.getItem('welcome-modal-dismissed')) {
        setShowWelcomeModal(true)
      }
    }
  }, [user])

  const dismissWelcomeModal = useCallback(() => {
    localStorage.setItem('welcome-modal-dismissed', '1')
    setShowWelcomeModal(false)
  }, [])

  const dismissRedirectBanner = useCallback(() => {
    sessionStorage.setItem('redirect-banner-dismissed', '1')
    setShowRedirectBanner(false)
  }, [])

  const openWhatsNew = useCallback(() => {
    setShowWhatsNew(true)
    const allIds = FEATURES.map((f) => f.id)
    localStorage.setItem(WHATS_NEW_KEY, JSON.stringify(allIds))
    setWhatsNewUnread(false)
  }, [])

  return {
    showWhatsNew,
    setShowWhatsNew,
    whatsNewUnread,
    openWhatsNew,
    showWelcomeModal,
    dismissWelcomeModal,
    showAbout,
    setShowAbout,
    showSuggestionModal,
    setShowSuggestionModal,
    showImportModal,
    setShowImportModal,
    showRedirectBanner,
    dismissRedirectBanner,
  }
}
