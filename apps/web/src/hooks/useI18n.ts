import { createI18nHook } from '@mi-album-fifa/shared'

function getBrowserLocale(): string {
  const browserLang =
    navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage || 'es'
  const lang = browserLang.split('-')[0].toLowerCase()
  return lang === 'en' ? 'en' : 'es'
}

export const useI18n = createI18nHook({
  getLocale: () => localStorage.getItem('locale') || getBrowserLocale(),
  setLocale: (locale: string) => localStorage.setItem('locale', locale),
})
