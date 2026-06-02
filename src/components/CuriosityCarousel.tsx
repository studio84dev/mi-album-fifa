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
    <div className="curiosity-carousel">
      <div className="curiosity-header">
        <span className="curiosity-icon">💡</span>
        <span className="curiosity-title">
          {locale === 'en' ? 'Did you know?' : '¿Sabías que...'}
        </span>
        <span className="curiosity-counter">
          {currentIndex + 1} / {countryCuriosities.length}
        </span>
      </div>

      <div className="curiosity-content-wrapper">
        <button
          className="curiosity-nav curiosity-nav-prev"
          onClick={goToPrev}
          aria-label={locale === 'en' ? 'Previous' : 'Anterior'}
        >
          ‹
        </button>

        <div
          className="curiosity-slider"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className={`curiosity-slide ${isDragging ? 'dragging' : ''}`}
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
          className="curiosity-nav curiosity-nav-next"
          onClick={goToNext}
          aria-label={locale === 'en' ? 'Next' : 'Siguiente'}
        >
          ›
        </button>
      </div>

      <div className="curiosity-dots">
        {countryCuriosities.map((_, index) => (
          <button
            key={index}
            className={`curiosity-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`${locale === 'en' ? 'Go to fact' : 'Ir a curiosidad'} ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default CuriosityCarousel
