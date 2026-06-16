import { useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { allStickers } from '@mi-album-fifa/shared'
import { useAuth } from '@/src/hooks/useAuth'
import { useCollection } from '@/src/context/CollectionContext'
import { useTheme, colors } from '@/src/hooks/useTheme'
import { useI18n } from '@/src/hooks/useI18n'
import flags from '@/src/data/flags'
import CuriosityCarousel from '@/src/components/CuriosityCarousel'
import StickerPanel from '@/src/components/StickerPanel'
import Svg, { Path } from 'react-native-svg'

const GoogleIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
)

export default function CountryScreen() {
  const { code, highlight } = useLocalSearchParams<{ code: string; highlight?: string }>()
  const highlightNumber = highlight ? parseInt(highlight, 10) : null
  const router = useRouter()
  const { user, signInWithGoogle } = useAuth()
  const { collection, updateEntry } = useCollection()
  const { theme, isDark } = useTheme()
  const { t } = useI18n()

  const countryStickers = useMemo(() => allStickers.filter((s) => s.country_code === code), [code])
  const stickerCount = countryStickers.length
  const teamName = countryStickers[0]?.team_name ?? code
  const page = countryStickers[0]?.page ?? null
  const isoCode = countryStickers[0]?.iso ?? null

  const collectedData = collection[code ?? ''] ?? {}
  const collectedCount = Object.values(collectedData).filter((e) => e.collected).length
  const repeatedCount = Object.values(collectedData).reduce((acc, e) => acc + (e.repeated ?? 0), 0)
  const isComplete = stickerCount > 0 && collectedCount >= stickerCount

  const rawFlag = isoCode ? flags[isoCode] : null
  const FlagSvg = rawFlag
    ? (((rawFlag as { default?: unknown }).default ?? rawFlag) as React.FC<{
        width: number
        height: number
      }>)
    : null

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgPrimary}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          backgroundColor: theme.bgSecondary,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Text style={{ color: colors.accentBlue, fontSize: 15 }}>← {t('back')}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
          {FlagSvg && (
            <View style={{ width: 28, height: 20, borderRadius: 2, overflow: 'hidden' }}>
              <FlagSvg width={28} height={20} />
            </View>
          )}
          <View>
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>
              {teamName}
            </Text>
            {page != null && (
              <Text style={{ color: theme.textMuted, fontSize: 11 }}>
                {t('stickerPanelPageLabel')} {page}
              </Text>
            )}
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: colors.accentBlue, fontWeight: '700', fontSize: 14 }}>
            {collectedCount}
            <Text style={{ color: theme.textMuted, fontWeight: '500' }}>/{stickerCount}</Text>
          </Text>
          {repeatedCount > 0 && (
            <Text style={{ color: colors.accentOrange, fontSize: 11, fontWeight: '600' }}>
              {repeatedCount}
            </Text>
          )}
        </View>
      </View>

      {!user ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🏆</Text>
          <Text
            style={{
              color: theme.textPrimary,
              fontWeight: '700',
              fontSize: 17,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {t('loginToTrack')}
          </Text>
          <Text
            style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}
          >
            {t('countryLoginPrompt')
              .replace('{count}', String(stickerCount))
              .replace('{country}', teamName ?? code)}
          </Text>
          <TouchableOpacity
            onPress={signInWithGoogle}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: theme.bgTertiary,
              borderWidth: 1,
              borderColor: theme.borderStrong,
              borderRadius: 9999,
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
            activeOpacity={0.75}
          >
            <GoogleIcon />
            <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '600' }}>
              {t('loginBarCta')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          <StickerPanel
            countryCode={code ?? ''}
            user={user}
            stickerCount={stickerCount}
            initialData={collectedData}
            highlightNumber={highlightNumber}
            onCollectionChange={(cc, number, data) => updateEntry(cc, number, data)}
          />

          <View style={{ marginTop: 16 }}>
            <CuriosityCarousel countryCode={code ?? ''} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
