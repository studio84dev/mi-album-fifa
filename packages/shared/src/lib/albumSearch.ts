import type { CardType, Sticker } from '../data/stickers'

export interface AlbumSearchCountry {
  kind: 'country'
  code: string
  team_name: string | null
  group: string | null
  iso: string | null
  page: number
  card_type: CardType
  count: number
}

export interface AlbumSearchPlayer {
  kind: 'player'
  code: string
  country_code: string
  number: number
  description: string
  iso: string | null
  page: number
  group: string | null
  card_type: CardType
}

export interface AlbumSearchResults {
  countries: AlbumSearchCountry[]
  players: AlbumSearchPlayer[]
}

interface IndexedCountry extends AlbumSearchCountry {
  normalizedCode: string
  normalizedName: string
}

interface IndexedPlayer extends AlbumSearchPlayer {
  normalizedCode: string
  normalizedDescription: string
}

export interface AlbumSearchIndex {
  countries: IndexedCountry[]
  players: IndexedPlayer[]
}

export function normalizeAlbumSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase()
}

function normalizeCode(value: string): string {
  return normalizeAlbumSearch(value).replace(/[\s.-]/g, '')
}

export function createAlbumSearchIndex(stickers: Sticker[]): AlbumSearchIndex {
  const countries = new Map<string, IndexedCountry>()
  const players: IndexedPlayer[] = []

  for (const sticker of stickers) {
    const countryCode = sticker.country_code ?? sticker.code
    const country = countries.get(countryCode)
    if (country) {
      country.count++
    } else {
      countries.set(countryCode, {
        kind: 'country',
        code: countryCode,
        team_name: sticker.team_name,
        group: sticker.group,
        iso: sticker.iso,
        page: sticker.page,
        card_type: sticker.card_type,
        count: 1,
        normalizedCode: normalizeAlbumSearch(countryCode),
        normalizedName: normalizeAlbumSearch(sticker.team_name ?? sticker.description),
      })
    }

    if (
      sticker.country_code &&
      sticker.number != null &&
      sticker.card_type !== 'team_logo' &&
      sticker.card_type !== 'team_photo'
    ) {
      players.push({
        kind: 'player',
        code: sticker.code,
        country_code: sticker.country_code,
        number: sticker.number,
        description: sticker.description,
        iso: sticker.iso,
        page: sticker.page,
        group: sticker.group,
        card_type: sticker.card_type,
        normalizedCode: normalizeCode(sticker.code),
        normalizedDescription: normalizeAlbumSearch(sticker.description),
      })
    }
  }

  return { countries: [...countries.values()], players }
}

function textRank(value: string, query: string): number | null {
  if (value === query) return 0
  if (value.startsWith(query)) return 1
  if (value.includes(query)) return 2
  return null
}

export function searchAlbum(index: AlbumSearchIndex, value: string): AlbumSearchResults {
  const query = normalizeAlbumSearch(value)
  if (!query) return { countries: [], players: [] }
  const codeQuery = normalizeCode(value)

  const countries = index.countries
    .map((country) => {
      const codeRank = textRank(country.normalizedCode, query)
      const nameRank = textRank(country.normalizedName, query)
      const rank = codeRank == null ? nameRank : nameRank == null ? codeRank : Math.min(codeRank, nameRank)
      return rank == null ? null : { country, rank }
    })
    .filter((entry): entry is { country: IndexedCountry; rank: number } => entry != null)
    .sort((a, b) => a.rank - b.rank || a.country.code.localeCompare(b.country.code))
    .map(({ country }) => country)

  const players = index.players
    .map((player) => {
      if (player.normalizedCode === codeQuery) return { player, rank: -1 }
      const rank = textRank(player.normalizedDescription, query)
      return rank == null ? null : { player, rank }
    })
    .filter((entry): entry is { player: IndexedPlayer; rank: number } => entry != null)
    .sort(
      (a, b) =>
        a.rank - b.rank ||
        a.player.normalizedDescription.localeCompare(b.player.normalizedDescription) ||
        a.player.code.localeCompare(b.player.code)
    )
    .map(({ player }) => player)

  return { countries, players }
}
