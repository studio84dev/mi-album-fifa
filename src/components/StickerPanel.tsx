import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient.ts'

const LONG_PRESS_MS = 500

interface InitialDataEntry {
  collected: boolean
  repeated: number
}

interface StickerPanelProps {
  countryCode: string
  user: { id: string } | null
  stickerCount?: number
  initialData?: Record<string, InitialDataEntry>
  onCollectionChange?: (
    _countryCode: string,
    _number: number | string,
    _data: InitialDataEntry
  ) => void
  onInteract?: (_countryCode: string) => void
  highlightNumber?: number | null
  matchedSticker?: { code: string; description: string } | null
  page?: number | null
  t: (_key: string) => string
}

function buildMaps(data: Record<string, InitialDataEntry>) {
  const cMap: Record<number, boolean> = {}
  const rMap: Record<number, number> = {}
  Object.entries(data).forEach(([num, entry]) => {
    cMap[Number(num)] = entry.collected
    rMap[Number(num)] = entry.repeated ?? 0
  })
  return { cMap, rMap }
}

function StickerPanel({
  countryCode,
  user,
  stickerCount = 20,
  initialData = {},
  onCollectionChange,
  onInteract,
  highlightNumber = null,
  matchedSticker = null,
  page = null,
  t,
}: StickerPanelProps) {
  const { cMap: initCollected, rMap: initRepeated } = buildMaps(initialData)
  const [collected, setCollected] = useState(initCollected)
  const [repeated, setRepeated] = useState(initRepeated)
  const [loading, _setLoading] = useState(false)
  const [modal, setModal] = useState<number | null>(null)
  const [modalRepeated, setModalRepeated] = useState(0)
  const [lastTouched, setLastTouched] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevCompleteRef = useRef(false)
  const [justCompleted, setJustCompleted] = useState(false)
  const [glowNumber, setGlowNumber] = useState<number | null>(null)

  useEffect(() => {
    const { cMap, rMap } = buildMaps(initialData)
    setCollected(cMap)
    setRepeated(rMap)
    const alreadyComplete =
      Object.values(initialData).filter((e) => e.collected).length >= stickerCount
    prevCompleteRef.current = alreadyComplete
    setJustCompleted(false)
    setGlowNumber(null)
  }, [countryCode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (highlightNumber != null) {
      setGlowNumber(highlightNumber)
      const timer = setTimeout(() => setGlowNumber(null), 2000)
      return () => clearTimeout(timer)
    }
  }, [highlightNumber])

  const collectedCount = Object.values(collected).filter(Boolean).length
  const isComplete = !loading && collectedCount >= stickerCount

  useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      setJustCompleted(true)
      const timer = setTimeout(() => setJustCompleted(false), 3000)
      prevCompleteRef.current = true
      return () => clearTimeout(timer)
    }
    if (!isComplete) {
      setJustCompleted(false)
      prevCompleteRef.current = false
    }
  }, [isComplete])

  const toggleSticker = (number: number) => {
    onInteract?.(countryCode)
    setLastTouched(number)
    if (repeated[number] > 0) {
      openModal(number)
      return
    }

    doToggleSticker(number)
  }

  const doToggleSticker = async (number: number) => {
    const current = !!collected[number]
    const next = !current

    setCollected((prev) => ({ ...prev, [number]: next }))
    if (!next) setRepeated((prev) => ({ ...prev, [number]: 0 }))
    onCollectionChange?.(countryCode, number, { collected: next, repeated: next ? 0 : 0 })

    let error
    if (next) {
      ;({ error } = await supabase.from('sticker_collection').insert({
        user_id: user!.id,
        country_code: countryCode,
        sticker_number: number,
        repeated: 0,
        updated_at: new Date().toISOString(),
      }))
    } else {
      ;({ error } = await supabase
        .from('sticker_collection')
        .delete()
        .eq('user_id', user!.id)
        .eq('country_code', countryCode)
        .eq('sticker_number', number))
    }

    if (error) {
      console.error('Error saving sticker:', error) // eslint-disable-line no-console
      setCollected((prev) => ({ ...prev, [number]: current }))
      onCollectionChange?.(countryCode, number, {
        collected: current,
        repeated: repeated[number] ?? 0,
      })
    }
  }

  useEffect(() => {
    return () => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (lastTouched === null) return
    const handler = (e: PointerEvent) => {
      if (!(e.target as Element)?.closest('.figurita-card')) {
        setLastTouched(null)
      }
    }
    document.addEventListener('pointerdown', handler)
    return () => document.removeEventListener('pointerdown', handler)
  }, [lastTouched])

  const openModal = (number: number) => {
    if (loading) return
    setLastTouched(number)
    const current = repeated[number] ?? 0
    setModalRepeated(current > 0 ? current : 1)
    setModal(number)
  }

  const closeModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }
    setModal(null)
  }

  const applyModalAction = async (action: string) => {
    const number = modal!
    const rep = modalRepeated
    closeModal()

    if (action === 'none') {
      setCollected((prev) => ({ ...prev, [number]: false }))
      setRepeated((prev) => ({ ...prev, [number]: 0 }))
      onCollectionChange?.(countryCode, number, { collected: false, repeated: 0 })
      await supabase
        .from('sticker_collection')
        .delete()
        .eq('user_id', user!.id)
        .eq('country_code', countryCode)
        .eq('sticker_number', number)
      return
    }

    setCollected((prev) => ({ ...prev, [number]: true }))
    setRepeated((prev) => ({ ...prev, [number]: rep }))
    onCollectionChange?.(countryCode, number, { collected: true, repeated: rep })

    const existing = collected[number]
    if (existing) {
      await supabase
        .from('sticker_collection')
        .update({ repeated: rep, updated_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .eq('country_code', countryCode)
        .eq('sticker_number', number)
    } else {
      await supabase.from('sticker_collection').insert({
        user_id: user!.id,
        country_code: countryCode,
        sticker_number: number,
        repeated: rep,
        updated_at: new Date().toISOString(),
      })
    }
  }

  const handleLongPressStart = (_e: React.TouchEvent | React.MouseEvent, number: number) => {
    longPressTimer.current = setTimeout(() => {
      openModal(number)
    }, LONG_PRESS_MS)
  }

  const handleTouchStart = (e: React.TouchEvent, number: number) => {
    e.preventDefault()
    handleLongPressStart(e, number)
  }

  const handleLongPressEnd = () => {
    clearTimeout(longPressTimer.current ?? undefined)
    longPressTimer.current = null
  }

  const handleContextMenu = (e: React.MouseEvent, number: number) => {
    e.preventDefault()
    openModal(number)
  }

  if (!user) return null

  const repeatedCount = Object.values(repeated).reduce((acc, v) => acc + (v || 0), 0)
  const panelClass = `sticker-panel${isComplete ? ' sticker-panel--complete' : ''}${justCompleted ? ' sticker-panel--just-completed' : ''}`

  return (
    <div className={panelClass}>
      <div className="sticker-panel-header">
        <span className="sticker-panel-title">
          {t('stickerPanelTitle')} <strong>{countryCode}</strong>
          {page != null && (
            <span className="sticker-panel-page">{` · ${t('stickerPanelPageLabel')} ${page}`}</span>
          )}
        </span>
        <span className="sticker-panel-count">
          {loading ? '...' : `${collectedCount} / ${stickerCount}${repeatedCount > 0 ? ` · ` : ''}`}
          {repeatedCount > 0 && <span className="sticker-panel-repeated">{repeatedCount}</span>}
        </span>
      </div>
      {matchedSticker && (
        <div className="search-match-badge">
          {matchedSticker.code} — {matchedSticker.description}
        </div>
      )}
      <div className="sticker-grid">
        {Array.from({ length: stickerCount }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            className={`figurita-card ${collected[num] ? 'collected' : ''} ${repeated[num] > 0 ? 'repeated' : ''} ${lastTouched === num ? 'last-touched' : ''} ${glowNumber === num ? 'highlighted' : ''} ${highlightNumber === num ? 'search-matched' : ''}`}
            onClick={() => toggleSticker(num)}
            onContextMenu={(e) => handleContextMenu(e, num)}
            onTouchStart={(e) => handleTouchStart(e, num)}
            onTouchEnd={handleLongPressEnd}
            onTouchMove={handleLongPressEnd}
            disabled={loading}
            aria-label={`Figurita ${countryCode} ${num}`}
          >
            <span className="figurita-number">{num}</span>
            <span className="figurita-code">{countryCode}</span>
            {repeated[num] > 0 && <span className="figurita-repeated-badge">+{repeated[num]}</span>}
          </button>
        ))}
      </div>
      <p className="sticker-grid-hint">
        {window.matchMedia('(pointer: fine)').matches ? t('hintMouse') : t('hintTouch')}
      </p>

      {modal !== null && (
        <div className="sticker-modal-overlay" onClick={closeModal}>
          <div className="sticker-modal" onClick={(e) => e.stopPropagation()}>
            <p className="sticker-modal-title">
              {t('modalTitle')}{' '}
              <strong>
                {countryCode} #{modal}
              </strong>
            </p>
            <div className="sticker-modal-repeated-row">
              <span className="sticker-modal-repeated-label">{t('modalRepeatedLabel')}</span>
              <div className="sticker-modal-counter">
                <button
                  className="sticker-counter-btn"
                  onClick={() => setModalRepeated((v) => Math.max(0, v - 1))}
                  aria-label={t('ariaLess')}
                >
                  −
                </button>
                <span className="sticker-counter-value">{modalRepeated}</span>
                <button
                  className="sticker-counter-btn"
                  onClick={() => setModalRepeated((v) => v + 1)}
                  aria-label={t('ariaMore')}
                >
                  +
                </button>
              </div>
            </div>
            {modalRepeated === 0 && <p className="sticker-modal-hint">{t('modalHintRemove')}</p>}
            <div className="sticker-modal-actions">
              <button
                className="sticker-modal-btn btn-collected"
                onClick={() => applyModalAction('collected')}
              >
                {modalRepeated === 0
                  ? t('modalBtnCollectedZero')
                  : t('modalBtnCollectedRep').replace('{count}', String(modalRepeated))}
              </button>
              <button
                className="sticker-modal-btn btn-none"
                onClick={() => applyModalAction('none')}
              >
                {t('modalBtnNone')}
              </button>
            </div>
            <button className="sticker-modal-cancel" onClick={closeModal}>
              {t('modalCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StickerPanel
