import { useMemo, useState } from 'react'
import { View, Text, TextInput, FlatList, StatusBar, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { allStickers } from '@mi-album-fifa/shared'
import type { CardType, Sticker } from '@mi-album-fifa/shared'
import CommunityStats from '@/src/components/CommunityStats'
import TeamCard from '@/src/components/TeamCard'
import type { TeamItem } from '@/src/components/TeamCard'
import AuthBar from '@/src/components/AuthBar'
import Footer from '@/src/components/Footer'
import WhatsNewModal from '@/src/components/WhatsNewModal'
import AboutModal from '@/src/components/AboutModal'
import SuggestionModal from '@/src/components/SuggestionModal'
import ImportCollectionModal from '@/src/components/ImportCollectionModal'
import { useAuth } from '@/src/hooks/useAuth'
import { useGlobalCollection } from '@/src/hooks/useGlobalCollection'
import { useI18n } from '@/src/hooks/useI18n'
import { useTheme } from '@/src/hooks/useTheme'
import { useWhatsNew } from '@/src/hooks/useWhatsNew'

const EXACT_CODE_RE = /^([A-Z0-9]+?)(\.?\d+)$/i

function parseExactCode(query: string): { prefix: string; number: number } | null {
  const noSpaces = query.replace(/\s+/g, '')
  const match = noSpaces.match(EXACT_CODE_RE)
  if (!match) return null
  return { prefix: match[1].toUpperCase(), number: parseInt(match[2], 10) }
}

interface StickerResult {
  _kind: 'sticker'
  code: string
  country_code: string
  number: number
  description: string
  iso: string | null
}

type ListItem = { _type: 'search' } | TeamItem | StickerResult

function buildSearchData() {
  const teamsObj: Record<string, TeamItem> = {}
  const stickerByCode = new Map<string, Sticker>()

  for (const sticker of allStickers) {
    const key = sticker.country_code ?? sticker.code
    const isSpecial =
      sticker.card_type === 'fwc_special' ||
      sticker.card_type === 'cc' ||
      sticker.card_type === 'panini_logo'

    if (!isSpecial) {
      if (!teamsObj[key]) {
        teamsObj[key] = {
          code: key,
          team_name: sticker.team_name,
          group: sticker.group,
          iso: sticker.iso,
          page: sticker.page,
          card_type: sticker.card_type as CardType,
          count: 0,
        }
      }
      teamsObj[key].count++
    }

    if (sticker.number != null && sticker.country_code != null) {
      stickerByCode.set(`${sticker.country_code}-${sticker.number}`, sticker)
    }
  }

  return { allCountries: Object.values(teamsObj), stickerByCode }
}

export default function HomeScreen() {
  const [search, setSearch] = useState('')
  const { showWhatsNew, setShowWhatsNew, hasUnread, openWhatsNew } = useWhatsNew()
  const [showAbout, setShowAbout] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const { collection, totals, loading: collectionLoading } = useGlobalCollection(user)
  const { t, locale, toggleLocale: toggleI18nLocale } = useI18n()
  const { theme, isDark, effectiveTheme, toggleTheme } = useTheme()
  const { allCountries, stickerByCode } = useMemo(() => buildSearchData(), [])

  const { teamCollected, fwcCollected, ccCollected, paniniCollected } = totals
  const totalCollected = teamCollected + fwcCollected + ccCollected + paniniCollected

  const exactMatch = useMemo(() => {
    if (!search.trim()) return null
    const parsed = parseExactCode(search.trim())
    if (!parsed) return null
    return stickerByCode.get(`${parsed.prefix}-${parsed.number}`) ?? null
  }, [search, stickerByCode])

  const searchResults = useMemo((): (TeamItem | StickerResult)[] => {
    if (!search.trim()) return allCountries
    const q = search.trim().toUpperCase()

    const matchedTeams = allCountries.filter(
      (c) =>
        c.code.includes(q) ||
        (c.team_name && c.team_name.toUpperCase().includes(q)) ||
        c.page.toString().includes(q)
    )
    const matchedTeamCodes = new Set(matchedTeams.map((t) => t.code))

    const matchedStickers: StickerResult[] = []
    for (const sticker of allStickers) {
      if (
        sticker.description.toUpperCase().includes(q) &&
        sticker.country_code != null &&
        sticker.number != null &&
        !matchedTeamCodes.has(sticker.country_code) &&
        sticker.card_type !== 'team_logo' &&
        sticker.card_type !== 'team_photo'
      ) {
        matchedStickers.push({
          _kind: 'sticker',
          code: sticker.code,
          country_code: sticker.country_code,
          number: sticker.number,
          description: sticker.description,
          iso: sticker.iso,
        })
      }
    }

    if (matchedTeams.length === 0 && matchedStickers.length === 0 && exactMatch) {
      return [
        {
          _kind: 'sticker' as const,
          code: exactMatch.code,
          country_code: exactMatch.country_code!,
          number: exactMatch.number!,
          description: exactMatch.description,
          iso: exactMatch.iso,
        },
      ]
    }

    return [...matchedTeams, ...matchedStickers]
  }, [search, allCountries, exactMatch])

  const handleCountryPress = (code: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(`/country/${code}` as any)
  }

  const toggleLocale = () => {
    toggleI18nLocale()
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgPrimary}
      />
      <AuthBar
        user={user}
        loading={authLoading}
        onSignIn={signInWithGoogle}
        onSignOut={signOut}
        onImport={() => setShowImport(true)}
        onWhatsNew={openWhatsNew}
        whatsNewUnread={hasUnread}
        totals={totals}
        collectionLoading={collectionLoading}
      />
      <FlatList
        data={[{ _type: 'search' as const }, ...searchResults] as ListItem[]}
        extraData={effectiveTheme}
        keyExtractor={(item) =>
          '_type' in item ? '__search__' : '_kind' in item ? `sticker-${item.code}` : item.code
        }
        stickyHeaderIndices={[1]}
        renderItem={({ item }) => {
          if ('_type' in item) {
            return (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  backgroundColor: theme.bgPrimary,
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: theme.bgTertiary,
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ color: theme.textMuted, marginRight: 8 }}>🔍</Text>
                  <TextInput
                    style={{ flex: 1, color: theme.textPrimary, fontSize: 14 }}
                    placeholder={t('searchPlaceholder')}
                    placeholderTextColor={theme.textMuted}
                    value={search}
                    onChangeText={setSearch}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    multiline={false}
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
            )
          }
          if ('_kind' in item) {
            return (
              <TouchableOpacity
                onPress={() =>
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  router.push(`/country/${item.country_code}?highlight=${item.number}` as any)
                }
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 16,
                  marginBottom: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor: theme.cardBg,
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                  borderRadius: 12,
                  gap: 12,
                }}
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: theme.textMuted,
                      fontSize: 11,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      marginBottom: 2,
                    }}
                  >
                    {item.country_code} #{item.number}
                  </Text>
                  <Text
                    style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '500' }}
                    numberOfLines={2}
                  >
                    {item.description}
                  </Text>
                </View>
                <Text style={{ color: theme.textMuted, fontSize: 12 }}>›</Text>
              </TouchableOpacity>
            )
          }
          const countryCollection = collection[item.code] ?? {}
          const entries = Object.values(countryCollection)
          const collectedCount = entries.filter((e) => e.collected).length
          const repeatedCount = entries.reduce((acc, e) => acc + (e.repeated ?? 0), 0)
          return (
            <TeamCard
              item={item}
              collectedCount={collectedCount}
              repeatedCount={repeatedCount}
              onPress={handleCountryPress}
            />
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
                marginBottom: 16,
              }}
            >
              ⚽ {t('title')}
            </Text>

            <Text
              style={{
                fontSize: 13,
                color: theme.textMuted,
                textAlign: 'center',
                marginBottom: 16,
                lineHeight: 20,
              }}
            >
              {t('description')}
            </Text>
            <CommunityStats />
          </View>
        }
        ListFooterComponent={() => (
          <Footer
            t={t}
            locale={locale}
            toggleLocale={toggleLocale}
            onShowAbout={() => setShowAbout(true)}
            onShowSuggestion={() => setShowSuggestion(true)}
            themeMode={effectiveTheme}
            onToggleTheme={toggleTheme}
            user={user}
            totalCollected={totalCollected}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <WhatsNewModal
        visible={showWhatsNew}
        onClose={() => setShowWhatsNew(false)}
        t={t}
        locale={locale}
      />

      <AboutModal visible={showAbout} onClose={() => setShowAbout(false)} t={t} />

      <SuggestionModal visible={showSuggestion} onClose={() => setShowSuggestion(false)} t={t} />

      <ImportCollectionModal
        visible={showImport}
        onClose={() => setShowImport(false)}
        onSuccess={() => {
          // Refresh collection data
        }}
        t={t}
      />
    </SafeAreaView>
  )
}
