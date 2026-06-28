import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StatusBar,
  TouchableOpacity,
  Keyboard,
  type TextInput as TextInputType,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { allStickers } from '@mi-album-fifa/shared'
import type { CardType, Sticker } from '@mi-album-fifa/shared'
import TeamCard from '@/src/components/TeamCard'
import type { TeamItem } from '@/src/components/TeamCard'
import AuthBar from '@/src/components/AuthBar'
import Footer from '@/src/components/Footer'
import SearchBar from '@/src/components/SearchBar'
import ScrollTopButton from '@/src/components/ScrollTopButton'
import ViewToggle from '@/src/components/ViewToggle'
import StickerFilter, { type StickerFilterMode } from '@/src/components/StickerFilter'
import AllPanelsView from '@/src/components/AllPanelsView'
import WhatsNewModal from '@/src/components/WhatsNewModal'
import AboutModal from '@/src/components/AboutModal'
import SuggestionModal from '@/src/components/SuggestionModal'
import ImportCollectionModal from '@/src/components/ImportCollectionModal'
import { useAuth } from '@/src/hooks/useAuth'
import { useCollectionState, useCollectionDispatch } from '@/src/context/CollectionContext'
import { useI18n } from '@/src/hooks/useI18n'
import { useTheme } from '@/src/hooks/useTheme'
import { useWhatsNew } from '@/src/hooks/useWhatsNew'
import { useUpdateAvailability } from '@/src/hooks/useUpdateAvailability'

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

interface SearchableSticker {
  _kind: 'sticker'
  code: string
  country_code: string
  number: number
  description: string
  descriptionUpper: string
  iso: string | null
}

interface SearchableTeam extends TeamItem {
  teamNameUpper: string
  pageStr: string
}

interface CountryDetails {
  stickerCount: number
  stickerNumbers: number[]
}

function buildSearchData() {
  const teamsObj: Record<string, SearchableTeam> = {}
  const stickerByCode = new Map<string, Sticker>()
  const searchableStickers: SearchableSticker[] = []
  const countryDetails: Record<string, CountryDetails> = {}

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
          teamNameUpper: sticker.team_name?.toUpperCase() ?? '',
          group: sticker.group,
          iso: sticker.iso,
          page: sticker.page,
          pageStr: sticker.page.toString(),
          card_type: sticker.card_type as CardType,
          count: 0,
        }
      }
      teamsObj[key].count++
    } else {
      if (!teamsObj[key]) {
        teamsObj[key] = {
          code: key,
          team_name: null,
          teamNameUpper: '',
          group: null,
          iso: null,
          page: sticker.page,
          pageStr: sticker.page.toString(),
          card_type: sticker.card_type as CardType,
          count: 0,
        }
      }
      teamsObj[key].count++
    }

    if (!countryDetails[key]) {
      countryDetails[key] = { stickerCount: 0, stickerNumbers: [] }
    }
    countryDetails[key].stickerCount++
    if (sticker.number != null) {
      countryDetails[key].stickerNumbers.push(sticker.number === 0 ? 1 : sticker.number)
    }

    if (sticker.number != null && sticker.country_code != null) {
      stickerByCode.set(`${sticker.country_code}-${sticker.number}`, sticker)
      if (sticker.card_type !== 'team_logo' && sticker.card_type !== 'team_photo') {
        searchableStickers.push({
          _kind: 'sticker',
          code: sticker.code,
          country_code: sticker.country_code,
          number: sticker.number,
          description: sticker.description,
          descriptionUpper: sticker.description.toUpperCase(),
          iso: sticker.iso,
        })
      }
    }
  }

  return {
    allCountries: Object.values(teamsObj) as SearchableTeam[],
    stickerByCode,
    searchableStickers,
    countryDetails,
  }
}

export default function HomeScreen() {
  const searchInputRef = useRef<TextInputType>(null)
  const flatListRef = useRef<FlatList>(null)
  const panelRefs = useRef<Record<string, FlatList | null>>({})
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'panels'>('cards')
  const [viewModeLoaded, setViewModeLoaded] = useState(false)
  const [stickerFilter, setStickerFilter] = useState<StickerFilterMode>('all')

  useEffect(() => {
    AsyncStorage.getItem('mi-album-fifa.viewMode').then((value) => {
      if (value === 'cards' || value === 'panels') {
        setViewMode(value)
      }
      setViewModeLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (!viewModeLoaded) return
    AsyncStorage.setItem('mi-album-fifa.viewMode', viewMode)
  }, [viewMode, viewModeLoaded])
  const [inputValue, setInputValue] = useState('')
  const [search, setSearch] = useState('')
  const searchMode = search.trim().length > 0 ? 'search' : 'noSearch'
  const activeViewKey =
    viewMode === 'cards' ? `${searchMode}-cards` : `${searchMode}-${stickerFilter}`
  const [mountedViews, setMountedViews] = useState<Set<string>>(() => new Set([activeViewKey]))
  if (!mountedViews.has(activeViewKey)) {
    setMountedViews(new Set(mountedViews).add(activeViewKey))
  }

  const handleChange = useCallback((text: string) => {
    setInputValue(text)
    setSearch(text)
  }, [])
  const handleClearSearch = useCallback(() => {
    setInputValue('')
    setTimeout(() => {
      setSearch('')
      searchInputRef.current?.focus()
    }, 0)
  }, [])

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(e.nativeEvent.contentOffset.y > 300)
  }, [])

  const scrollToTop = useCallback(() => {
    if (search.trim().length > 0) return
    if (viewMode === 'cards') {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
    } else {
      const activeKey = `${searchMode}-${stickerFilter}`
      panelRefs.current[activeKey]?.scrollToOffset({ offset: 0, animated: true })
    }
  }, [search, viewMode, searchMode, stickerFilter])
  const { showWhatsNew, setShowWhatsNew, hasUnread, openWhatsNew } = useWhatsNew()
  const [showAbout, setShowAbout] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const { collection, totals, loading: collectionLoading } = useCollectionState()
  const { updateEntry } = useCollectionDispatch()
  const { t, locale, toggleLocale: toggleI18nLocale } = useI18n()
  const { theme, isDark, effectiveTheme, toggleTheme } = useTheme()
  const { updateAvailable } = useUpdateAvailability()
  const { allCountries, stickerByCode, searchableStickers, countryDetails } = useMemo(
    () => buildSearchData(),
    []
  )

  const { teamCollected, fwcCollected, ccCollected, paniniCollected } = totals
  const totalCollected = teamCollected + fwcCollected + ccCollected + paniniCollected

  const exactMatch = useMemo(() => {
    if (!search.trim()) return null
    const parsed = parseExactCode(search.trim())
    if (!parsed) return null
    return stickerByCode.get(`${parsed.prefix}-${parsed.number}`) ?? null
  }, [search, stickerByCode])

  const { searchResults, matchedCountryCodes, panelHighlightByCountry } = useMemo(() => {
    if (!search.trim()) {
      return {
        searchResults: allCountries,
        matchedCountryCodes: null,
        panelHighlightByCountry: null,
      }
    }
    const q = search.trim().toUpperCase()

    const matchedTeams = allCountries.filter(
      (c) => c.code.includes(q) || c.teamNameUpper.includes(q) || c.pageStr.includes(q)
    )
    const matchedTeamCodes = new Set(matchedTeams.map((t) => t.code))

    const matchedStickers: StickerResult[] = []
    for (const sticker of searchableStickers) {
      if (sticker.descriptionUpper.includes(q) && !matchedTeamCodes.has(sticker.country_code)) {
        matchedStickers.push(sticker)
      }
    }

    const matchedCountryCodes = new Set<string>([
      ...matchedTeams.map((c) => c.code),
      ...matchedStickers.map((s) => s.country_code),
    ])
    if (exactMatch) {
      matchedCountryCodes.add(exactMatch.country_code!)
    }

    const panelHighlightByCountry: Record<string, number> = {}
    if (exactMatch) {
      panelHighlightByCountry[exactMatch.country_code!] = exactMatch.number!
    } else {
      for (const sticker of matchedStickers) {
        if (!panelHighlightByCountry[sticker.country_code]) {
          panelHighlightByCountry[sticker.country_code] = sticker.number
        }
      }
    }

    if (matchedTeams.length === 0 && matchedStickers.length === 0 && exactMatch) {
      return {
        searchResults: [
          {
            _kind: 'sticker' as const,
            code: exactMatch.code,
            country_code: exactMatch.country_code!,
            number: exactMatch.number!,
            description: exactMatch.description,
            iso: exactMatch.iso,
          },
        ],
        matchedCountryCodes,
        panelHighlightByCountry,
      }
    }

    return {
      searchResults: [...matchedTeams, ...matchedStickers],
      matchedCountryCodes,
      panelHighlightByCountry,
    }
  }, [search, allCountries, searchableStickers, exactMatch])

  const handleCountryPress = useCallback(
    (code: string) => {
      Keyboard.dismiss()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push(`/country/${code}` as any)
    },
    [router]
  )

  const renderTeamItem = useCallback(
    ({ item }: { item: TeamItem }) => {
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
    },
    [collection, handleCountryPress]
  )

  const renderStickerItem = useCallback(
    ({ item }: { item: StickerResult }) => (
      <TouchableOpacity
        onPress={() => {
          Keyboard.dismiss()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          router.push(`/country/${item.country_code}?highlight=${item.number}` as any)
        }}
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
    ),
    [theme, router]
  )

  const isSearching = search.trim().length > 0

  const handleShowAbout = useCallback(() => setShowAbout(true), [])
  const handleShowSuggestion = useCallback(() => setShowSuggestion(true), [])
  const handleShowImport = useCallback(() => setShowImport(true), [])
  const toggleLocale = useCallback(() => toggleI18nLocale(), [toggleI18nLocale])

  const listFooter = useMemo(
    () => (
      <Footer
        t={t}
        locale={locale}
        toggleLocale={toggleLocale}
        onShowAbout={handleShowAbout}
        onShowSuggestion={handleShowSuggestion}
        themeMode={effectiveTheme}
        onToggleTheme={toggleTheme}
        user={user}
        totalCollected={totalCollected}
      />
    ),
    [
      t,
      locale,
      toggleLocale,
      handleShowAbout,
      handleShowSuggestion,
      effectiveTheme,
      toggleTheme,
      user,
      totalCollected,
    ]
  )

  useEffect(() => {
    if (viewMode !== 'panels') return
    const activeKey = `${searchMode}-${stickerFilter}`
    const targetRef = panelRefs.current[activeKey]
    const id = requestAnimationFrame(() => {
      targetRef?.scrollToOffset({ offset: 0, animated: false })
    })
    return () => cancelAnimationFrame(id)
  }, [stickerFilter, viewMode, searchMode])

  const renderSearchItem = useCallback(
    ({ item }: { item: TeamItem | StickerResult }) => {
      if ('_kind' in item) return renderStickerItem({ item })
      return renderTeamItem({ item })
    },
    [renderTeamItem, renderStickerItem]
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgPrimary}
      />
      <View style={{ flex: 1, position: 'relative' }}>
        <AuthBar
          user={user}
          loading={authLoading}
          onSignIn={signInWithGoogle}
          onSignOut={signOut}
          onImport={handleShowImport}
          onWhatsNew={openWhatsNew}
          whatsNewUnread={hasUnread}
          updateAvailable={updateAvailable}
          totals={totals}
          collectionLoading={collectionLoading}
        />

        <View style={{ marginBottom: 12 }}>
          <SearchBar
            ref={searchInputRef}
            value={inputValue}
            onChangeText={handleChange}
            onClear={handleClearSearch}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
              marginHorizontal: 16,
              gap: 8,
            }}
          >
            <ViewToggle
              mode={viewMode}
              onChange={setViewMode}
              cardsLabel={t('viewModeCards')}
              panelsLabel={t('viewModePanels')}
              style={{ alignSelf: 'center' }}
            />
            {viewMode === 'panels' && (
              <StickerFilter
                mode={stickerFilter}
                onChange={setStickerFilter}
                allLabel={t('stickerFilterAll')}
                missingLabel={t('stickerFilterMissing')}
                repeatedLabel={t('stickerFilterRepeated')}
              />
            )}
          </View>
        </View>

        <View style={{ flex: 1 }}>
          {/* Cards view — no search */}
          {mountedViews.has('noSearch-cards') && (
            <View
              style={{
                flex: 1,
                display: searchMode === 'noSearch' && viewMode === 'cards' ? 'flex' : 'none',
              }}
            >
              <FlatList
                ref={flatListRef}
                data={allCountries}
                extraData={effectiveTheme}
                keyExtractor={(item) => item.code}
                renderItem={renderTeamItem}
                ListFooterComponent={listFooter}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
          )}

          {/* Cards view — search */}
          {mountedViews.has('search-cards') && (
            <View
              style={{
                flex: 1,
                display: searchMode === 'search' && viewMode === 'cards' ? 'flex' : 'none',
              }}
            >
              <FlatList<TeamItem | StickerResult>
                data={searchResults}
                extraData={effectiveTheme}
                keyExtractor={(item) => ('_kind' in item ? `sticker-${item.code}` : item.code)}
                renderItem={renderSearchItem}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
                initialNumToRender={15}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
              />
            </View>
          )}

          {/* Panels view — no search, all */}
          {mountedViews.has('noSearch-all') && (
            <View
              style={{
                flex: 1,
                display:
                  searchMode === 'noSearch' && viewMode === 'panels' && stickerFilter === 'all'
                    ? 'flex'
                    : 'none',
              }}
            >
              <AllPanelsView
                ref={(ref) => {
                  panelRefs.current['noSearch-all'] = ref
                }}
                allCountries={allCountries}
                countryDetails={countryDetails}
                collection={collection}
                user={user}
                updateEntry={updateEntry}
                stickerFilter="all"
                onScroll={handleScroll}
                ListFooterComponent={listFooter}
              />
            </View>
          )}

          {/* Panels view — no search, missing */}
          {mountedViews.has('noSearch-missing') && (
            <View
              style={{
                flex: 1,
                display:
                  searchMode === 'noSearch' && viewMode === 'panels' && stickerFilter === 'missing'
                    ? 'flex'
                    : 'none',
              }}
            >
              <AllPanelsView
                ref={(ref) => {
                  panelRefs.current['noSearch-missing'] = ref
                }}
                allCountries={allCountries}
                countryDetails={countryDetails}
                collection={collection}
                user={user}
                updateEntry={updateEntry}
                stickerFilter="missing"
                onScroll={handleScroll}
                ListFooterComponent={listFooter}
              />
            </View>
          )}

          {/* Panels view — no search, repeated */}
          {mountedViews.has('noSearch-repeated') && (
            <View
              style={{
                flex: 1,
                display:
                  searchMode === 'noSearch' && viewMode === 'panels' && stickerFilter === 'repeated'
                    ? 'flex'
                    : 'none',
              }}
            >
              <AllPanelsView
                ref={(ref) => {
                  panelRefs.current['noSearch-repeated'] = ref
                }}
                allCountries={allCountries}
                countryDetails={countryDetails}
                collection={collection}
                user={user}
                updateEntry={updateEntry}
                stickerFilter="repeated"
                onScroll={handleScroll}
                ListFooterComponent={listFooter}
              />
            </View>
          )}

          {/* Panels view — search, all */}
          {mountedViews.has('search-all') && (
            <View
              style={{
                flex: 1,
                display:
                  searchMode === 'search' && viewMode === 'panels' && stickerFilter === 'all'
                    ? 'flex'
                    : 'none',
              }}
            >
              <AllPanelsView
                ref={(ref) => {
                  panelRefs.current['search-all'] = ref
                }}
                allCountries={allCountries}
                countryDetails={countryDetails}
                collection={collection}
                user={user}
                updateEntry={updateEntry}
                searchQuery={search}
                matchedCountryCodes={matchedCountryCodes}
                highlightByCountry={panelHighlightByCountry}
                stickerFilter="all"
                onScroll={handleScroll}
                ListFooterComponent={listFooter}
              />
            </View>
          )}

          {/* Panels view — search, missing */}
          {mountedViews.has('search-missing') && (
            <View
              style={{
                flex: 1,
                display:
                  searchMode === 'search' && viewMode === 'panels' && stickerFilter === 'missing'
                    ? 'flex'
                    : 'none',
              }}
            >
              <AllPanelsView
                ref={(ref) => {
                  panelRefs.current['search-missing'] = ref
                }}
                allCountries={allCountries}
                countryDetails={countryDetails}
                collection={collection}
                user={user}
                updateEntry={updateEntry}
                searchQuery={search}
                matchedCountryCodes={matchedCountryCodes}
                highlightByCountry={panelHighlightByCountry}
                stickerFilter="missing"
                onScroll={handleScroll}
                ListFooterComponent={listFooter}
              />
            </View>
          )}

          {/* Panels view — search, repeated */}
          {mountedViews.has('search-repeated') && (
            <View
              style={{
                flex: 1,
                display:
                  searchMode === 'search' && viewMode === 'panels' && stickerFilter === 'repeated'
                    ? 'flex'
                    : 'none',
              }}
            >
              <AllPanelsView
                ref={(ref) => {
                  panelRefs.current['search-repeated'] = ref
                }}
                allCountries={allCountries}
                countryDetails={countryDetails}
                collection={collection}
                user={user}
                updateEntry={updateEntry}
                searchQuery={search}
                matchedCountryCodes={matchedCountryCodes}
                highlightByCountry={panelHighlightByCountry}
                stickerFilter="repeated"
                onScroll={handleScroll}
                ListFooterComponent={listFooter}
              />
            </View>
          )}
        </View>

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
        <ScrollTopButton visible={showScrollTop && !isSearching} onPress={scrollToTop} />
      </View>
    </SafeAreaView>
  )
}
