import { useState, useEffect, useRef } from 'react'
import curiositiesEs from '../data/curiosities.es.json'
import curiositiesEn from '../data/curiosities.en.json'

const mapsCache: Record<string, Map<string, string[]>> = {
  es: new Map(curiositiesEs.map((c) => [c.code, c.datos_curiosos])),
  en: new Map(curiositiesEn.map((c) => [c.code, c.datos_curiosos])),
}
const SWIPE_THRESHOLD = 50

interface CuriosityCarouselProps {
  countryCode: string
  locale?: string
}

function CuriosityCarousel({ countryCode, locale = 'es' }: CuriosityCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchCurrentX = useRef<number | null>(null)

  const curiositiesMap = mapsCache[locale] ?? mapsCache.es
  const countryCuriosities = curiositiesMap.get(countryCode) || []

  useEffect(() => {
    setCurrentIndex(0)
  }, [countryCode])

  if (countryCuriosities.length === 0) return null

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? countryCuriosities.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === countryCuriosities.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX
    touchCurrentX.current = e.touches[0].clientX
    setIsDragging(true)
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchCurrentX.current === null) return
    touchCurrentX.current = e.touches[0].clientX
    const diff = touchCurrentX.current - touchStartX.current
    setDragOffset(diff)
  }

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchCurrentX.current === null) {
      setIsDragging(false)
      setDragOffset(0)
      return
    }

    const diff = touchStartX.current - touchCurrentX.current

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      if (diff > 0) {
        goToNext()
      } else {
        goToPrev()
      }
    }

    setIsDragging(false)
    setDragOffset(0)
    touchStartX.current = null
    touchCurrentX.current = null
  }

  return (
    <div className="w-full max-w-[600px] mx-auto mt-5 px-5 py-[1.125rem] bg-card-bg rounded-xl border border-border-color min-[601px]:mx-6 min-[601px]:p-4">
      <div className="flex items-center justify-between mb-[0.875rem] pb-3 border-b border-border-color">
        <span className="text-lg">💡</span>
        <span className="font-semibold text-base text-text-primary flex-1 ml-2 min-[601px]:text-[1rem]">
          {locale === 'en' ? 'Did you know?' : '¿Sabías que...'}
        </span>
        <span className="text-xs text-text-muted font-medium">
          {currentIndex + 1} / {countryCuriosities.length}
        </span>
      </div>

      <div className="flex items-center gap-[0.625rem] min-h-[112px] min-[601px]:min-h-[140px]">
        <button
          className="w-8 h-8 rounded-full border border-border-color bg-bg-tertiary text-text-muted text-xl cursor-pointer flex items-center justify-center transition-[background,border-color,color] duration-base flex-shrink-0 pb-[3px] hover:bg-bg-quaternary hover:border-border-strong hover:text-text-primary active:opacity-70"
          onClick={goToPrev}
          aria-label={locale === 'en' ? 'Previous' : 'Anterior'}
        >
          ‹
        </button>

        <div
          className="flex-1 overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`leading-[1.65] text-text-secondary text-base text-center px-2 py-2 will-change-transform min-[601px]:text-[0.95rem] animate-slide-in ${isDragging ? '[transition:none]' : 'transition-[transform,opacity] duration-100 ease-out'}`}
            key={currentIndex}
            style={{
              transform: `translateX(${dragOffset}px)`,
              opacity: Math.max(0.3, 1 - Math.abs(dragOffset) / 300),
            }}
          >
            {countryCuriosities[currentIndex]}
          </div>
        </div>

        <button
          className="w-8 h-8 rounded-full border border-border-color bg-bg-tertiary text-text-muted text-xl cursor-pointer flex items-center justify-center transition-[background,border-color,color] duration-base flex-shrink-0 pb-[3px] hover:bg-bg-quaternary hover:border-border-strong hover:text-text-primary active:opacity-70"
          onClick={goToNext}
          aria-label={locale === 'en' ? 'Next' : 'Siguiente'}
        >
          ›
        </button>
      </div>

      <div className="flex justify-center gap-[0.375rem] mt-[0.875rem]">
        {countryCuriosities.map((_, index) => (
          <button
            key={index}
            className={`h-[6px] rounded-full border-none cursor-pointer transition-all duration-base ${index === currentIndex ? 'w-4 bg-accent-blue' : 'w-[6px] bg-border-strong hover:bg-text-muted'}`}
            onClick={() => goToSlide(index)}
            aria-label={`${locale === 'en' ? 'Go to fact' : 'Ir a curiosidad'} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default CuriosityCarousel
