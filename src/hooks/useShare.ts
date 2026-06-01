import { useCallback } from 'react'

export function useShare(t: (_key: string) => string) {
  const share = useCallback(
    (platform: string) => {
      const url = window.location.href
      const title = t('shareTitle')
      const text = t('shareText')

      switch (platform) {
        case 'whatsapp': {
          const encoded = encodeURIComponent(`${title}\n${text}\n${url}`)
          window.open(`https://wa.me/?text=${encoded}`, '_blank')
          break
        }
        case 'facebook': {
          const encoded = encodeURIComponent(url)
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank')
          break
        }
        case 'x': {
          const encodedText = encodeURIComponent(`${title} - ${text}`)
          const encodedUrl = encodeURIComponent(url)
          window.open(`https://x.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, '_blank')
          break
        }
        case 'linkedin': {
          const encoded = encodeURIComponent(url)
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`, '_blank')
          break
        }
        case 'copyLink': {
          navigator.clipboard
            .writeText(`${title}\n${text}\n${url}`)
            .then(() => alert(t('linkCopied')))
            .catch((err) => console.error('Failed to copy:', err))
          break
        }
        default:
          break
      }
    },
    [t]
  )

  const shareOptions = [
    { id: 'whatsapp', label: 'WhatsApp', icon: 'whatsapp' },
    { id: 'facebook', label: 'Facebook', icon: 'facebook' },
    { id: 'x', label: 'X', icon: 'x' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
    { id: 'copyLink', label: t('copyLink'), icon: 'copy' },
  ]

  return { share, shareOptions }
}
