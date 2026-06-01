import { useState, useCallback } from 'react'
import esTranslations from '../i18n/es.json'
import enTranslations from '../i18n/en.json'

const translations: Record<string, Record<string, string>> = {
  es: esTranslations,
  en: enTranslations,
}

function getBrowserLocale() {
  const browserLang =
    navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage || 'es'
  const lang = browserLang.split('-')[0].toLowerCase()
  return lang === 'en' ? 'en' : 'es'
}

export function useI18n() {
  const [locale, setLocale] = useState<string>(() => {
    const saved = localStorage.getItem('locale')
    return saved || getBrowserLocale()
  })

  const t = useCallback(
    (key: string): string => {
      return translations[locale][key] || key
    },
    [locale]
  )

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const newLocale = prev === 'es' ? 'en' : 'es'
      localStorage.setItem('locale', newLocale)
      return newLocale
    })
  }, [])

  return { locale, t, toggleLocale }
}
