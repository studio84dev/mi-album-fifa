import { useState, useEffect, useCallback } from 'react'

export function useScroll(threshold = 300, bottomOffset = 100) {
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false)
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > threshold
      setShowScrollTop(scrolled)

      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - bottomOffset
      setIsAtBottom(scrolled && nearBottom)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold, bottomOffset])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { showScrollTop, isAtBottom, scrollToTop }
}
