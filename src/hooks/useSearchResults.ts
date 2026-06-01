import { useState, useMemo, useRef, useCallback } from 'react'
import allStickers, { Sticker } from '../data/stickers.ts'
import type { CardType } from '../data/stickers.ts'

/* ── Static helpers ────────────────────────────────────────── */

const EXACT_CODE_RE = /^([A-Z0-9]+?)(\d+)$/i

function parseExactCode(query: string): { prefix: string; number: number } | null {
  const noSpaces = query.replace(/\s+/g, '')
  const match = noSpaces.match(EXACT_CODE_RE)
  if (!match) return null
  return { prefix: match[1].toUpperCase(), number: parseInt(match[2], 10) }
}

interface TeamSummary {
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

  const stickerByCode = new Map<string, Sticker>()
  for (const sticker of allStickers) {
    if (sticker.number != null) {
      stickerByCode.set(`${sticker.country_code ?? sticker.code}-${sticker.number}`, sticker)
    }
  }

  return {
    teamsData: Object.values(teamsObj) as TeamSummary[],
    stickerByCode,
  }
}

/* ── Hook ─────────────────────────────────────────────────── */

export function useSearchResults() {
  const [search, setSearch] = useState('')
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [searchFocused, setSearchFocused] = useState(false)
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  const { teamsData, stickerByCode } = useMemo(() => buildSearchData(allStickers), [])

  /* ── Search results (list view) ─────────────────────────── */
  const searchResults = useMemo((): SearchResult[] => {
    if (!search.trim()) return teamsData.map((s): TeamCardResult => ({ ...s, kind: 'teamCard' }))
    const query = search.trim().toUpperCase()

    const matchedTeams = teamsData.filter(
      (s) =>
        s.code.includes(query) ||
        (s.team_name && s.team_name.toUpperCase().includes(query)) ||
        s.page.toString().includes(query)
    )

    const matchedStickerCards: StickerCardResult[] = allStickers
      .filter((sticker): sticker is Sticker & { country_code: string; number: number } => {
        const descMatch = sticker.description.toUpperCase().includes(query)
        const notInTeamResults = !matchedTeams.some((t) => t.code === sticker.country_code)
        const isHiddenType = sticker.card_type === 'team_logo' || sticker.card_type === 'team_photo'
        return (
          descMatch &&
          notInTeamResults &&
          !isHiddenType &&
          sticker.number != null &&
          sticker.country_code != null
        )
      })
      .map(
        (sticker): StickerCardResult => ({
          kind: 'stickerCard',
          code: sticker.code,
          country_code: sticker.country_code,
          number: sticker.number,
          description: sticker.description,
          page: sticker.page,
          group: sticker.group,
          iso: sticker.iso,
          card_type: sticker.card_type,
        })
      )

    return [
      ...matchedTeams.map((t): TeamCardResult => ({ ...t, kind: 'teamCard' })),
      ...matchedStickerCards,
    ]
  }, [search, teamsData])

  /* ── Exact code match (auto-open) ───────────────────────── */
  const exactMatch = useMemo(() => {
    if (!search.trim()) return null
    const parsed = parseExactCode(search.trim().toUpperCase())
    if (!parsed) return null
    return stickerByCode.get(`${parsed.prefix}-${parsed.number}`) ?? null
  }, [search, stickerByCode])

  /* ── Which country panel to open ────────────────────────── */
  const activeCountry = useMemo(() => {
    // 1. Auto-open from exact sticker code (e.g. "ARG 17")
    if (exactMatch) {
      const item = teamsData.find((s) => s.code === exactMatch.country_code)
      return item ? { ...item, kind: 'teamCard' } : null
    }
    // 2. Persist from explicit click
    if (selectedCode) {
      const item = teamsData.find((s) => s.code === selectedCode)
      return item ? { ...item, kind: 'teamCard' } : null
    }
    return null
  }, [exactMatch, selectedCode, teamsData])

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
    activeCountry,
    matchedNumber,
    matchedSticker,
  }
}
