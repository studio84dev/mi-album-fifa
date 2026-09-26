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
import { createAlbumSearchIndex, getAlbumStickers, searchAlbum } from '@mi-album-fifa/shared'
import type { AlbumSearchCountry, AlbumSearchPlayer, CardType, Sticker } from '@mi-album-fifa/shared'
import TeamCard from '@/src/components/TeamCard'
import type { TeamItem } from '@/src/components/TeamCard'
import AuthBar from '@/src/components/AuthBar'
import Footer from '@/src/components/Footer'
import SearchBar from '@/src/components/SearchBar'
import SearchResults from '@/src/components/SearchResults'
import ScrollTopButton from '@/src/components/ScrollTopButton'
import ViewToggle from '@/src/components/ViewToggle'
import StickerFilter, { type StickerFilterMode } from '@/src/components/StickerFilter'
import AllPanelsView from '@/src/components/AllPanelsView'
import WhatsNewModal from '@/src/components/WhatsNewModal'
import AboutModal from '@/src/components/AboutModal'
import SuggestionModal from '@/src/components/SuggestionModal'
import ImportCollectionModal from '@/src/components/ImportCollectionModal'
import ImportQRModal from '@/src/components/ImportQRModal'
import { useAuth } from '@/src/hooks/useAuth'
import { useCollectionState, useCollectionDispatch } from '@/src/context/CollectionContext'
import { useI18n } from '@/src/hooks/useI18n'
import { useTheme } from '@/src/hooks/useTheme'
import { useWhatsNew } from '@/src/hooks/useWhatsNew'
import { useUpdateAvailability } from '@/src/hooks/useUpdateAvailability'

type StickerResult = AlbumSearchPlayer

interface CountryDetails {
  stickerCount: number
  stickerNumbers: number[]
}

function buildSearchData(stickers: Sticker[]) {
  const teamsObj: Record<string, TeamItem> = {}
  const countryDetails: Record<string, CountryDetails> = {}

  for (const sticker of stickers) {
    const key = sticker.country_code ?? sticker.code
    const isSpecial = sticker.card_type === 'fwc_special' || sticker.card_type === 'cc'

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
    } else {
      if (!teamsObj[key]) {
        teamsObj[key] = {
          code: key,
          team_name: null,
          group: null,
          iso: null,
          page: sticker.page,
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
      countryDetails[key].stickerNumbers.push(sticker.number)
    }
  }

  return {
    allCountries: Object.values(teamsObj),
    countryDetails,
  }
}

export default function HomeScreen() {
  const searchInputRef = useRef<TextInputType>(null)
  const flatListRef = useRef<FlatList>(null)
  const panelRef = useRef<FlatList>(null)
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
  const [selectedPanel, setSelectedPanel] = useState<{
    countryCode: string
    highlightNumber: number | null
  } | null>(null)
  const handleChange = useCallback((text: string) => {
    setSelectedPanel(null)
    setInputValue(text)
    setSearch(text)
  }, [])
  const handleClearSearch = useCallback(() => {
    setSelectedPanel(null)
    setInputValue('')
    setSearch('')
    searchInputRef.current?.focus()
  }, [])

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(e.nativeEvent.contentOffset.y > 300)
  }, [])

  const scrollToTop = useCallback(() => {
    if (search.trim().length > 0) return
    if (viewMode === 'cards') {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
    } else {
      panelRef.current?.scrollToOffset({ offset: 0, animated: true })
    }
  }, [search, viewMode])
  const { showWhatsNew, setShowWhatsNew, hasUnread, openWhatsNew } = useWhatsNew()
  const [showAbout, setShowAbout] = useState(false)
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [showImportQR, setShowImportQR] = useState(false)
  const router = useRouter()
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth()
  const { collection, totals, loading: collectionLoading, activeAlbumId } = useCollectionState()
  const { updateEntry, resetCollection, refresh } = useCollectionDispatch()
  const { t, locale, toggleLocale: toggleI18nLocale } = useI18n()
  const { theme, isDark, effectiveTheme, toggleTheme } = useTheme()
  const { updateAvailable } = useUpdateAvailability()
  const albumStickers = useMemo(() => getAlbumStickers(activeAlbumId), [activeAlbumId])
  const { allCountries, countryDetails } = useMemo(() => buildSearchData(albumStickers), [albumStickers])
  const searchIndex = useMemo(() => createAlbumSearchIndex(albumStickers), [albumStickers])
  const searchResults = useMemo(() => searchAlbum(searchIndex, search), [searchIndex, search])
  const selectedCountryCodes = useMemo(
    () => (selectedPanel ? new Set([selectedPanel.countryCode]) : null),
    [selectedPanel]
  )
  const selectedHighlight = useMemo(
    () =>
      selectedPanel?.highlightNumber == null
        ? null
        : { [selectedPanel.countryCode]: selectedPanel.highlightNumber },
    [selectedPanel]
  )

  const { teamCollected, fwcCollected, ccCollected } = totals
  const totalCollected = teamCollected + fwcCollected + ccCollected

  const handleCountryPress = useCallback(
    (code: string) => {
      Keyboard.dismiss()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.push({ pathname: '/(tabs)/country/[code]', params: { code } } as any)
    },
    [router]
  )

  const handleSearchCountryPress = useCallback(
    (country: AlbumSearchCountry) => {
      Keyboard.dismiss()
      if (viewMode === 'panels') {
        setInputValue(country.code)
        setSearch(country.code)
        setSelectedPanel({ countryCode: country.code, highlightNumber: null })
        return
      }
      handleCountryPress(country.code)
    },
    [viewMode, handleCountryPress]
  )

  const handleSearchPlayerPress = useCallback(
    (player: AlbumSearchPlayer) => {
      Keyboard.dismiss()
      if (viewMode === 'panels') {
        setInputValue(player.code)
        setSearch(player.code)
        setSelectedPanel({ countryCode: player.country_code, highlightNumber: player.number })
        return
      }
      router.push({
        pathname: '/(tabs)/country/[code]',
        params: { code: player.country_code, highlight: String(player.number) },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    },
    [viewMode, router]
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
        onPress={() => handleSearchPlayerPress(item)}
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
    [theme, handleSearchPlayerPress]
  )

  const isSearching = search.trim().length > 0

  const handleViewModeChange = useCallback((mode: 'cards' | 'panels') => {
    setSelectedPanel(null)
    setViewMode(mode)
  }, [])

  const handleShowAbout = useCallback(() => setShowAbout(true), [])
  const handleShowSuggestion = useCallback(() => setShowSuggestion(true), [])
  const handleShowImport = useCallback(() => setShowImport(true), [])
  const handleShowImportQR = useCallback(() => setShowImportQR(true), [])
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
    const id = requestAnimationFrame(() => {
      panelRef.current?.scrollToOffset({ offset: 0, animated: false })
    })
    return () => cancelAnimationFrame(id)
  }, [stickerFilter, viewMode, selectedPanel])

  const renderSearchCountry = useCallback(
    (item: AlbumSearchCountry) => {
      const entries = Object.values(collection[item.code] ?? {})
      return (
        <TeamCard
          item={item}
          collectedCount={entries.filter((entry) => entry.collected).length}
          repeatedCount={entries.reduce((total, entry) => total + (entry.repeated ?? 0), 0)}
          onPress={() => handleSearchCountryPress(item)}
        />
      )
    },
    [collection, handleSearchCountryPress]
  )

  const renderSearchPlayer = useCallback(
    (item: AlbumSearchPlayer) => renderStickerItem({ item }),
    [renderStickerItem]
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
          onImportQR={handleShowImportQR}
          onResetCollection={resetCollection}
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
            placeholder={t('searchPlaceholder')}
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
              onChange={handleViewModeChange}
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
          {isSearching && !selectedPanel ? (
            <SearchResults
              countries={searchResults.countries}
              players={searchResults.players}
              renderCountry={renderSearchCountry}
              renderPlayer={renderSearchPlayer}
            />
          ) : viewMode === 'cards' ? (
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
              initialNumToRender={12}
              maxToRenderPerBatch={8}
              windowSize={5}
              removeClippedSubviews
            />
          ) : (
            <AllPanelsView
              ref={panelRef}
              allCountries={allCountries}
              countryDetails={countryDetails}
              collection={collection}
              user={user}
              updateEntry={updateEntry}
              searchQuery={selectedPanel ? search : undefined}
              matchedCountryCodes={selectedCountryCodes}
              highlightByCountry={selectedHighlight}
              stickerFilter={stickerFilter}
              onScroll={handleScroll}
              ListFooterComponent={listFooter}
            />
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
            refresh()
          }}
          t={t}
        />

        <ImportQRModal
          visible={showImportQR}
          onClose={() => setShowImportQR(false)}
          user={user}
          onImported={() => {
            refresh()
          }}
          t={t}
        />

        <ScrollTopButton visible={showScrollTop && !isSearching} onPress={scrollToTop} />
      </View>
    </SafeAreaView>
  )
}
