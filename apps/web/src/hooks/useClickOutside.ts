import { useEffect, RefObject } from 'react'

export function useClickOutside(
  refs: RefObject<HTMLElement | null>[],
  onClickOutside: () => void,
  enabled = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleClick = (e: MouseEvent) => {
      const isOutside = refs.every((ref) => ref.current && !ref.current.contains(e.target as Node))
      if (isOutside) {
        onClickOutside()
      }
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [refs, onClickOutside, enabled])
}
