import { createI18nHook } from '@mi-album-fifa/shared'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getLocales } from 'expo-localization'

const LOCALE_KEY = 'locale'

let cachedLocale: string | null = null

function getDeviceLocale(): string {
  const locales = getLocales()
  const lang = locales[0]?.languageCode ?? 'es'
  return lang === 'en' ? 'en' : 'es'
}

export const useI18n = createI18nHook({
  getLocale: () => {
    return cachedLocale ?? getDeviceLocale()
  },
  setLocale: (locale: string) => {
    cachedLocale = locale
    AsyncStorage.setItem(LOCALE_KEY, locale).catch(() => null)
  },
})

export async function initLocale(): Promise<void> {
  const stored = await AsyncStorage.getItem(LOCALE_KEY)
  cachedLocale = stored ?? getDeviceLocale()
}
