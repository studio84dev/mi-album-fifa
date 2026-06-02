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
  const [hoveredNum, setHoveredNum] = useState<number | null>(null)

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

  const panelBorder = justCompleted
    ? 'animate-panel-just-completed border-accent-orange-border transition-none'
    : isComplete
      ? 'border-accent-orange-border transition-[border-color] duration-slow'
      : 'border-border-color transition-[border-color] duration-slow'

  return (
    <div className={`w-full bg-card-bg border rounded-xl px-5 py-[1.125rem] my-6 ${panelBorder}`}>
      <div className="flex justify-between items-center mb-[0.875rem]">
        <span className="text-sm text-text-secondary font-medium">
          {t('stickerPanelTitle')} <strong>{countryCode}</strong>
          {page != null && (
            <span className="text-xs text-text-muted">{` · ${t('stickerPanelPageLabel')} ${page}`}</span>
          )}
        </span>
        <span className="text-sm font-semibold text-accent-blue tabular-nums">
          {loading ? '...' : `${collectedCount} / ${stickerCount}${repeatedCount > 0 ? ` · ` : ''}`}
          {repeatedCount > 0 && <span className="text-accent-orange">{repeatedCount}</span>}
        </span>
      </div>

      {matchedSticker && (
        <div className="text-xs font-medium text-accent-blue bg-accent-blue-subtle border border-accent-blue-border rounded-sm px-2 py-[2px] w-fit mx-auto mb-[0.875rem]">
          {matchedSticker.code} — {matchedSticker.description}
        </div>
      )}

      <div className="grid [grid-template-columns:repeat(5,1fr)] gap-[0.375rem] max-[600px]:gap-[0.35rem]">
        {Array.from({ length: stickerCount }, (_, i) => i + 1).map((num) => {
          const isCollected = !!collected[num]
          const isRepeated = repeated[num] > 0
          const isLastTouched = lastTouched === num
          const isHighlighted = glowNumber === num
          const isSearchMatched = highlightNumber === num

          const isHovered = hoveredNum === num
          const canHover = !isCollected && !isRepeated && !loading

          let figuritaClass =
            'flex flex-col items-center justify-center gap-[0.1rem] border rounded-md py-2 px-1 cursor-pointer relative touch-pan-y select-none focus:outline-none focus:shadow-none disabled:opacity-40 disabled:cursor-not-allowed [touch-callout:none] [-webkit-tap-highlight-color:transparent]'

          if (isCollected && isRepeated) {
            figuritaClass += ' bg-accent-blue-hover border-accent-blue text-white'
          } else if (isCollected) {
            figuritaClass += ' bg-accent-blue border-accent-blue text-white'
          } else if (isRepeated) {
            figuritaClass +=
              ' bg-accent-orange-subtle border-accent-orange-border text-accent-orange'
          } else if (canHover && isHovered) {
            figuritaClass += ' bg-bg-quaternary border-border-strong text-text-primary'
          } else {
            figuritaClass += ' bg-bg-tertiary border-border-color text-text-muted'
          }

          if (isLastTouched)
            figuritaClass += ' !border-accent-blue !shadow-[0_0_0_2px_var(--accent-blue-subtle)]'
          if (isHighlighted) figuritaClass += ' animate-highlight-glow z-[1]'
          if (isSearchMatched) figuritaClass += ' border-2 !border-text-secondary z-[1]'

          return (
            <button
              key={num}
              className={figuritaClass}
              onClick={() => toggleSticker(num)}
              onContextMenu={(e) => handleContextMenu(e, num)}
              onTouchStart={(e) => handleTouchStart(e, num)}
              onTouchEnd={handleLongPressEnd}
              onTouchMove={handleLongPressEnd}
              onMouseEnter={() => setHoveredNum(num)}
              onMouseLeave={() => setHoveredNum(null)}
              disabled={loading}
              aria-label={`Figurita ${countryCode} ${num}`}
            >
              <span className="text-[0.9375rem] font-bold leading-none tracking-[-0.01em] pointer-events-none select-none">
                {num}
              </span>
              <span className="text-[0.5625rem] font-medium tracking-[0.04em] opacity-75 pointer-events-none select-none">
                {countryCode}
              </span>
              {isRepeated && (
                <span className="absolute top-[2px] right-[2px] text-[0.5625rem] font-bold text-white bg-accent-orange rounded-[3px] px-[2px] leading-[1.4] pointer-events-none">
                  +{repeated[num]}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-text-muted text-center mt-[0.875rem]">
        {window.matchMedia('(pointer: fine)').matches ? t('hintMouse') : t('hintTouch')}
      </p>

      {modal !== null && (
        <div
          className="fixed inset-0 bg-overlay-bg flex items-center justify-center z-[1000] p-4 overscroll-contain backdrop-blur-[4px] select-none"
          onClick={closeModal}
        >
          <div
            className="bg-modal-bg border border-border-color rounded-xl p-[1.375rem] w-full max-w-[300px] flex flex-col gap-[0.875rem] shadow-xl animate-modal-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-center text-base font-semibold text-text-primary m-0">
              {t('modalTitle')}{' '}
              <strong>
                {countryCode} #{modal}
              </strong>
            </p>
            <div className="flex items-center justify-between bg-accent-orange-subtle border border-accent-orange-border rounded-md px-[0.875rem] py-2">
              <span className="text-sm text-accent-orange font-semibold">
                {t('modalRepeatedLabel')}
              </span>
              <div className="flex items-center gap-3">
                <button
                  className="w-8 h-8 rounded-full border border-accent-orange-border bg-accent-orange-subtle text-accent-orange text-base font-bold cursor-pointer flex items-center justify-center transition-[background] duration-fast hover:bg-[rgba(232,116,42,0.25)] leading-none"
                  onClick={() => setModalRepeated((v) => Math.max(0, v - 1))}
                  aria-label={t('ariaLess')}
                >
                  −
                </button>
                <span className="text-xl font-bold text-text-primary min-w-[1.5rem] text-center tabular-nums">
                  {modalRepeated}
                </span>
                <button
                  className="w-8 h-8 rounded-full border border-accent-orange-border bg-accent-orange-subtle text-accent-orange text-base font-bold cursor-pointer flex items-center justify-center transition-[background] duration-fast hover:bg-[rgba(232,116,42,0.25)] leading-none"
                  onClick={() => setModalRepeated((v) => v + 1)}
                  aria-label={t('ariaMore')}
                >
                  +
                </button>
              </div>
            </div>
            {modalRepeated === 0 && (
              <p className="text-xs text-text-muted text-center -mt-1 m-0">
                {t('modalHintRemove')}
              </p>
            )}
            <div className="flex gap-2">
              <button
                className="flex-1 py-[0.6rem] px-[0.4rem] border-none rounded-md text-sm font-semibold cursor-pointer transition-[opacity] duration-fast font-[inherit] bg-accent-blue text-white hover:opacity-85"
                onClick={() => applyModalAction('collected')}
              >
                {modalRepeated === 0
                  ? t('modalBtnCollectedZero')
                  : t('modalBtnCollectedRep').replace('{count}', String(modalRepeated))}
              </button>
              <button
                className="flex-1 py-[0.6rem] px-[0.4rem] border border-[rgba(239,68,68,0.25)] rounded-md text-sm font-semibold cursor-pointer transition-[opacity] duration-fast font-[inherit] bg-[rgba(239,68,68,0.1)] text-[#ef4444] hover:opacity-85"
                onClick={() => applyModalAction('none')}
              >
                {t('modalBtnNone')}
              </button>
            </div>
            <button
              className="bg-none border-none text-text-muted text-sm cursor-pointer text-center py-1 font-[inherit] transition-[color] duration-fast hover:text-text-primary"
              onClick={closeModal}
            >
              {t('modalCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StickerPanel
