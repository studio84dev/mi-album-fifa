import { useState, useMemo, useRef, useCallback } from 'react'
import {
  createAlbumSearchIndex,
  getAlbumStickers,
  searchAlbum,
  DEFAULT_ALBUM_ID,
} from '@mi-album-fifa/shared'
import type { Sticker, CardType } from '@mi-album-fifa/shared'

/* ── Static helpers ────────────────────────────────────────── */

const EXACT_CODE_RE = /^([A-Z0-9]+?)(\d+)$/i

function parseExactCode(query: string): { prefix: string; number: number } | null {
  const noSpaces = query.replace(/\s+/g, '')
  const match = noSpaces.match(EXACT_CODE_RE)
  if (!match) return null
  return { prefix: match[1].toUpperCase(), number: parseInt(match[2], 10) }
}

export interface TeamSummary {
  code: string
  team_name: string | null
  group: string | null
  iso: string | null
  page: number
  card_type: CardType
  description: string
  count: number
}

export interface TeamCardResult extends TeamSummary {
  kind: 'teamCard'
}

export interface StickerCardResult {
  kind: 'stickerCard'
  code: string
  country_code: string
  number: number
  description: string
  page: number
  group: string | null
  iso: string | null
  card_type: CardType
}

export type SearchResult = TeamCardResult | StickerCardResult

export interface StickerCardLike {
  code: string
  country_code: string | null
}

interface CountryDetails {
  stickerCount: number
  stickerNumbers: number[]
}

function buildSearchData(allStickers: Sticker[]) {
  const teamsObj = allStickers.reduce<Record<string, TeamSummary>>((acc, sticker) => {
    const key = sticker.country_code ?? sticker.code
    if (!acc[key]) {
      acc[key] = {
        code: key,
        team_name: sticker.team_name,
        group: sticker.group,
        iso: sticker.iso,
        page: sticker.page,
        card_type: sticker.card_type,
        description: sticker.description,
        count: 0,
      }
    }
    acc[key].count++
    return acc
  }, {})

  const countryDetails = allStickers.reduce<Record<string, CountryDetails>>((acc, sticker) => {
    const key = sticker.country_code ?? sticker.code
    if (!acc[key]) {
      acc[key] = { stickerCount: 0, stickerNumbers: [] }
    }
    acc[key].stickerCount++
    if (sticker.number != null) {
      acc[key].stickerNumbers.push(sticker.number)
    }
    return acc
  }, {})

  const stickerByCode = new Map<string, Sticker>()
  for (const sticker of allStickers) {
    if (sticker.number != null) {
      stickerByCode.set(`${sticker.country_code ?? sticker.code}-${sticker.number}`, sticker)
    }
  }

  return {
    teamsData: Object.values(teamsObj) as TeamSummary[],
    countryDetails,
    stickerByCode,
  }
}

/* ── Hook ─────────────────────────────────────────────────── */

export function useSearchResults(albumId = DEFAULT_ALBUM_ID) {
  const allStickers = getAlbumStickers(albumId)
  const [search, setSearch] = useState('')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const { teamsData, countryDetails, stickerByCode } = useMemo(
    () => buildSearchData(allStickers),
    [allStickers]
  )

  const searchIndex = useMemo(() => createAlbumSearchIndex(allStickers), [allStickers])
  const groupedSearchResults = useMemo(() => searchAlbum(searchIndex, search), [searchIndex, search])
  const searchResults = useMemo((): SearchResult[] => {
    if (!search.trim()) {
      return teamsData.map((team): TeamCardResult => ({ ...team, kind: 'teamCard' }))
    }
    return [
      ...groupedSearchResults.countries.map(
        (country): TeamCardResult => ({
          ...country,
          kind: 'teamCard',
          description: country.team_name ?? country.code,
        })
      ),
      ...groupedSearchResults.players.map(
        (player): StickerCardResult => ({ ...player, kind: 'stickerCard' })
      ),
    ]
  }, [search, teamsData, groupedSearchResults])

  /* ── Exact code match (auto-open) ───────────────────────── */
  const exactMatch = useMemo(() => {
    if (!search.trim()) return null
    const parsed = parseExactCode(search.trim().toUpperCase())
    if (!parsed) return null
    return stickerByCode.get(`${parsed.prefix}-${parsed.number}`) ?? null
  }, [search, stickerByCode])

  /* ── Which country panel to open ────────────────────────── */
  const activeCountry = useMemo(() => {
    if (!selectedCode) return null
    const item = teamsData.find((team) => team.code === selectedCode)
    return item ? { ...item, kind: 'teamCard' as const } : null
  }, [selectedCode, teamsData])

  /* ── Matched sticker info for highlight + badge ──────────────── */
  const matchedStickerInfo = useMemo(() => {
    if (!activeCountry || !search.trim()) return null
    const parsed = parseExactCode(search.trim().toUpperCase())
    if (!parsed || parsed.prefix !== activeCountry.code) return null
    const sticker = stickerByCode.get(`${parsed.prefix}-${parsed.number}`)
    return sticker ?? null
  }, [search, activeCountry, stickerByCode])

  const matchedNumber = matchedStickerInfo ? matchedStickerInfo.number : null
  const matchedSticker = matchedStickerInfo

  const { panelMatchedCountryCodes, panelHighlightByCountry } = useMemo(() => {
    if (!selectedCode) {
      return { panelMatchedCountryCodes: null, panelHighlightByCountry: null }
    }
    const highlightByCountry: Record<string, number> = {}
    if (exactMatch?.country_code === selectedCode && exactMatch.number != null) {
      highlightByCountry[selectedCode] = exactMatch.number
    }
    return {
      panelMatchedCountryCodes: new Set([selectedCode]),
      panelHighlightByCountry: highlightByCountry,
    }
  }, [selectedCode, exactMatch])

  /* ── Handlers ───────────────────────────────────────────── */
  const clearSearch = useCallback(() => {
    setSelectedCode(null)
    setSearch('')
  }, [])

  const selectCountry = useCallback((code: string) => {
    setSelectedCode(code)
    setSearch(code)
  }, [])

  const selectStickerCard = useCallback((sticker: StickerCardLike) => {
    setSelectedCode(sticker.country_code)
    setSearch(sticker.code)
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSelectedCode(null)
    setSearch(value)
  }, [])

  return {
    search,
    setSearch: handleSearchChange,
    selectedCode,
    selectCountry,
    selectStickerCard,
    clearSearch,
    searchFocused,
    setSearchFocused,
    searchInputRef,
    searchResults,
    groupedSearchResults,
    activeCountry,
    matchedNumber,
    matchedSticker,
    teamsData,
    countryDetails,
    panelMatchedCountryCodes,
    panelHighlightByCountry,
  }
}
