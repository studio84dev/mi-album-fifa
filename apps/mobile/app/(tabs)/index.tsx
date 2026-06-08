import { useMemo, useState } from 'react'
import { View, Text, TextInput, FlatList, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { allStickers } from '@mi-album-fifa/shared'
import type { CardType } from '@mi-album-fifa/shared'
import CommunityStats from '@/src/components/CommunityStats'
import CountryCard from '@/src/components/CountryCard'
import type { CountryItem } from '@/src/components/CountryCard'
import AuthBar from '@/src/components/AuthBar'
import { useAuth } from '@/src/hooks/useAuth'
import { useGlobalCollection } from '@/src/hooks/useGlobalCollection'
import { useI18n } from '@/src/hooks/useI18n'
import { useTheme } from '@/src/hooks/useTheme'

function buildCountryList(): CountryItem[] {
  const seen = new Set<string>()
  const countries: CountryItem[] = []

  for (const sticker of allStickers) {
    const key = sticker.country_code ?? sticker.code
    if (seen.has(key)) {
      const existing = countries.find((c) => c.code === key)
      if (existing) existing.count++
      continue
    }
    seen.add(key)
    const isSpecial =
      sticker.card_type === 'fwc_special' ||
      sticker.card_type === 'cc' ||
      sticker.card_type === 'panini_logo'
    if (isSpecial) continue
    countries.push({
      code: key,
      team_name: sticker.team_name,
      group: sticker.group,
      iso: sticker.iso,
      page: sticker.page,
      card_type: sticker.card_type as CardType,
      count: 1,
    })
  }

  return countries
}

export default function HomeScreen() {
  const [search, setSearch] = useState('')
  const router = useRouter()
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const { collection, totals } = useGlobalCollection(user)
  const { t } = useI18n()
  const { theme, isDark } = useTheme()
  const allCountries = useMemo(() => buildCountryList(), [])

  const { teamCollected, fwcCollected, ccCollected, paniniCollected } = totals
  const totalCollected = teamCollected + fwcCollected + ccCollected + paniniCollected

  const filtered = useMemo(() => {
    if (!search.trim()) return allCountries
    const q = search.trim().toUpperCase()
    return allCountries.filter(
      (c) =>
        c.code.includes(q) ||
        (c.team_name && c.team_name.toUpperCase().includes(q)) ||
        c.page.toString().includes(q)
    )
  }, [search, allCountries])

  const handleCountryPress = (code: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`/country/${code}` as any)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgPrimary}
      />
      <AuthBar user={user} loading={authLoading} onSignIn={signInWithGoogle} onSignOut={signOut} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.code}
        renderItem={({ item }) => {
          const countryCollection = collection[item.code] ?? {}
          const collectedCount = Object.values(countryCollection).filter((e) => e.collected).length
          return (
            <CountryCard item={item} collectedCount={collectedCount} onPress={handleCountryPress} />
          )
        }}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 8 }}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '800',
                color: theme.textPrimary,
                textAlign: 'center',
                lineHeight: 32,
                letterSpacing: -0.5,
              }}
            >
              ⚽ {t('title')}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: theme.textMuted,
                textAlign: 'center',
                marginTop: 8,
                lineHeight: 20,
              }}
            >
              {t('description')}
            </Text>
            <CommunityStats />
            {user && totalCollected > 0 && (
              <View style={{ marginTop: 8, marginBottom: 4, alignItems: 'center' }}>
                <Text style={{ color: '#3b82f6', fontSize: 12, fontWeight: '600' }}>
                  {totalCollected} {t('communityStatStickers')}
                </Text>
              </View>
            )}
            <View
              style={{
                marginTop: 12,
                marginBottom: 16,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.bgTertiary,
                borderWidth: 1,
                borderColor: theme.borderColor,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <Text style={{ color: theme.textMuted, marginRight: 8 }}>🔍</Text>
              <TextInput
                style={{ flex: 1, color: theme.textPrimary, fontSize: 14 }}
                placeholder={t('searchPlaceholder')}
                placeholderTextColor={theme.textMuted}
                value={search}
                onChangeText={setSearch}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {search.length > 0 && (
                <Text
                  style={{ color: theme.textMuted, marginLeft: 8, fontSize: 16 }}
                  onPress={() => setSearch('')}
                >
                  ✕
                </Text>
              )}
            </View>
          </View>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </SafeAreaView>
  )
}
