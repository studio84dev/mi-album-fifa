import type { ReactElement } from 'react'
import { SectionList, Text, View } from 'react-native'
import type { AlbumSearchCountry, AlbumSearchPlayer } from '@mi-album-fifa/shared'
import { useI18n } from '../hooks/useI18n'
import { useTheme } from '../hooks/useTheme'

interface SearchResultsProps {
  countries: AlbumSearchCountry[]
  players: AlbumSearchPlayer[]
  renderCountry: (_country: AlbumSearchCountry) => ReactElement
  renderPlayer: (_player: AlbumSearchPlayer) => ReactElement
}

type SearchItem = AlbumSearchCountry | AlbumSearchPlayer

interface SearchSection {
  key: 'countries' | 'players'
  title: string
  data: SearchItem[]
}

export default function SearchResults({
  countries,
  players,
  renderCountry,
  renderPlayer,
}: SearchResultsProps) {
  const { t } = useI18n()
  const { theme } = useTheme()
  const sections: SearchSection[] = []
  if (countries.length > 0) {
    sections.push({ key: 'countries', title: t('searchCountries'), data: countries })
  }
  if (players.length > 0) {
    sections.push({ key: 'players', title: t('searchPlayers'), data: players })
  }

  if (sections.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
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
    <SectionList
      sections={sections}
      keyExtractor={(item) => `${item.kind}-${item.code}`}
      renderItem={({ item }) =>
        item.kind === 'country' ? renderCountry(item) : renderPlayer(item)
      }
      renderSectionHeader={({ section }) => (
        <View
          style={{
            backgroundColor: theme.bgPrimary,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 8,
          }}
        >
          <Text style={{ color: theme.textMuted, fontSize: 12, fontWeight: '700' }}>
            {section.title} · {section.data.length}
          </Text>
        </View>
      )}
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 32 }}
      initialNumToRender={15}
      maxToRenderPerBatch={10}
      windowSize={5}
    />
  )
}
