import React, { forwardRef, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native'
import type { User } from '@supabase/supabase-js'
import type { CollectionEntry, CollectionMap } from '@mi-album-fifa/shared'
import type { TeamItem } from './TeamCard'
import StickerPanel from './StickerPanel'
import flags from '../data/flags'
import { useTheme } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'
import type { StickerFilterMode } from './StickerFilter'

interface CountryDetails {
  stickerCount: number
  stickerNumbers: number[]
}

interface VisiblePanelItem {
  country: TeamItem
  initialData: Record<string, CollectionEntry>
  filteredNumbers: number[]
}

interface AllPanelsViewProps {
  allCountries: TeamItem[]
  countryDetails: Record<string, CountryDetails>
  collection: CollectionMap
  user: User | null
  updateEntry: (
    _countryCode: string,
    _stickerNumber: number | string,
    _data: { collected: boolean; repeated?: number }
  ) => void
  searchQuery?: string
  matchedCountryCodes?: Set<string> | null
  highlightByCountry?: Record<string, number> | null
  onScroll?: (_event: NativeSyntheticEvent<NativeScrollEvent>) => void
  ListFooterComponent?: React.ComponentType | React.ReactElement | null
  stickerFilter: StickerFilterMode
}

function getCountryCollection(collection: CollectionMap, code: string) {
  return {
    ...(code === '00' ? (collection['null'] ?? {}) : {}),
    ...(collection[code] ?? {}),
  }
}

function filterVisibleStickers(
  numbers: number[],
  data: Record<string, CollectionEntry>,
  filter: StickerFilterMode
): number[] {
  if (filter === 'all') return numbers
  return numbers.filter((num) => {
    const entry = data[String(num)]
    if (filter === 'missing') return !entry?.collected
    return (entry?.repeated ?? 0) > 0
  })
}

type ThemeColors = {
  borderColor: string
  textPrimary: string
  textMuted: string
}

interface CountrySectionProps {
  country: TeamItem
  user: User | null
  updateEntry: AllPanelsViewProps['updateEntry']
  highlightNumber: number | null
  initialData: Record<string, CollectionEntry>
  filteredNumbers: number[]
  theme: ThemeColors
}

const CountrySection = React.memo(function CountrySection({
  country,
  user,
  updateEntry,
  highlightNumber,
  initialData,
  filteredNumbers,
  theme,
}: CountrySectionProps) {
  const { t } = useI18n()

  const rawFlag = country.iso ? flags[country.iso] : null
  const FlagSvg = rawFlag
    ? (((rawFlag as { default?: unknown }).default ?? rawFlag) as React.FC<{
        width: number
        height: number
      }>)
    : null

  return (
    <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          marginBottom: 8,
        }}
      >
        {FlagSvg && (
          <View style={{ width: 28, height: 20, borderRadius: 2, overflow: 'hidden' }}>
            <FlagSvg width={28} height={20} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>
            {country.code} — {country.team_name}
          </Text>
          {country.page != null && (
            <Text style={{ color: theme.textMuted, fontSize: 11 }}>
              {t('stickerPanelPageLabel')} {country.page}
            </Text>
          )}
        </View>
      </View>

      <StickerPanel
        countryCode={country.code}
        user={user}
        stickerCount={filteredNumbers.length}
        stickerNumbers={filteredNumbers}
        initialData={initialData}
        highlightNumber={highlightNumber}
        onCollectionChange={updateEntry}
      />
    </View>
  )
})

const AllPanelsView = forwardRef<FlatList, AllPanelsViewProps>(function AllPanelsView(
  {
    allCountries,
    countryDetails,
    collection,
    user,
    updateEntry,
    searchQuery,
    matchedCountryCodes,
    highlightByCountry,
    onScroll,
    ListFooterComponent,
    stickerFilter,
  },
  ref
) {
  const { theme } = useTheme()
  const { t } = useI18n()

  const isSearching = Boolean(searchQuery?.trim())

  const filteredCountries = useMemo(() => {
    if (!isSearching || !matchedCountryCodes) return allCountries
    return allCountries.filter((c) => matchedCountryCodes.has(c.code))
  }, [allCountries, matchedCountryCodes, isSearching])

  const countryInitialData = useMemo(() => {
    const map: Record<string, Record<string, CollectionEntry>> = {}
    for (const c of filteredCountries) {
      map[c.code] = getCountryCollection(collection, c.code)
    }
    return map
  }, [filteredCountries, collection])

  const visibleItems = useMemo(() => {
    if (stickerFilter === 'all') {
      return filteredCountries.map((c) => {
        const details = countryDetails[c.code]
        return {
          country: c,
          initialData: countryInitialData[c.code],
          filteredNumbers: details?.stickerNumbers ?? [],
        }
      })
    }
    const items: VisiblePanelItem[] = []
    for (const c of filteredCountries) {
      const details = countryDetails[c.code]
      const initialData = countryInitialData[c.code]
      if (!details || !initialData) continue
      const filteredNumbers = filterVisibleStickers(
        details.stickerNumbers,
        initialData,
        stickerFilter
      )
      if (filteredNumbers.length > 0) {
        items.push({ country: c, initialData, filteredNumbers })
      }
    }
    return items
  }, [filteredCountries, countryDetails, countryInitialData, stickerFilter])

  const renderItem = useCallback(
    ({ item }: { item: VisiblePanelItem }) => {
      if (!item.country) return null
      return (
        <CountrySection
          country={item.country}
          user={user}
          updateEntry={updateEntry}
          highlightNumber={highlightByCountry?.[item.country.code] ?? null}
          initialData={item.initialData}
          filteredNumbers={item.filteredNumbers}
          theme={theme}
        />
      )
    },
    [user, updateEntry, highlightByCountry, theme]
  )

  const keyExtractor = useCallback((item: VisiblePanelItem) => item.country.code, [])

  if (isSearching && visibleItems.length === 0) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
      >
        <Text style={{ fontSize: 40, marginBottom: 16 }}>🔍</Text>
        <Text
          style={{
            color: theme.textPrimary,
            fontWeight: '700',
            fontSize: 17,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {t('noResults')}
        </Text>
        <Text style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center' }}>
          {t('sureNotPasted')}
        </Text>
      </View>
    )
  }

  return (
    <FlatList
      ref={ref}
      data={visibleItems}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      extraData={[collection, theme]}
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 32 }}
      ListFooterComponent={ListFooterComponent}
      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      removeClippedSubviews={true}
    />
  )
})

export default React.memo(AllPanelsView)
