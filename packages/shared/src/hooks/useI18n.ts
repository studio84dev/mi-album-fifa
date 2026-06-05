import { useState, useCallback } from 'react'
import esTranslations from '../i18n/es.json'
import enTranslations from '../i18n/en.json'

const translations: Record<string, Record<string, string>> = {
  es: esTranslations,
  en: enTranslations,
}

export interface I18nStorageAdapter {
  getLocale: () => string
  setLocale: (_locale: string) => void
}

export function createI18nHook(adapter: I18nStorageAdapter) {
  return function useI18n() {
    const [locale, setLocale] = useState<string>(() => adapter.getLocale())

    const t = useCallback(
      (key: string): string => {
        return translations[locale]?.[key] || key
      },
      [locale]
    )

    const toggleLocale = useCallback(() => {
      setLocale((prev) => {
        const newLocale = prev === 'es' ? 'en' : 'es'
        adapter.setLocale(newLocale)
        return newLocale
      })
    }, [])

    return { locale, t, toggleLocale }
  }
}
