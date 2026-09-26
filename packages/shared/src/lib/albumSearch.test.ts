import { describe, expect, it } from 'vitest'
import type { Sticker } from '../data/stickers'
import { createAlbumSearchIndex, normalizeAlbumSearch, searchAlbum } from './albumSearch'

const stickers: Sticker[] = [
  {
    id: 1,
    code: 'BRA1',
    country_code: 'BRA',
    number: 1,
    description: 'Brazil team logo',
    team_name: 'Brazil',
    card_type: 'team_logo',
    is_foil: false,
    owned_count: 0,
    page: 10,
    group: 'C',
    iso: 'br',
  },
  {
    id: 2,
    code: 'BRA10',
    country_code: 'BRA',
    number: 10,
    description: 'Gabriel Martinelli',
    team_name: 'Brazil',
    card_type: 'player',
    is_foil: false,
    owned_count: 0,
    page: 10,
    group: 'C',
    iso: 'br',
  },
  {
    id: 3,
    code: 'ARG10',
    country_code: 'ARG',
    number: 10,
    description: 'Lionel Messi',
    team_name: 'Argentina',
    card_type: 'player',
    is_foil: false,
    owned_count: 0,
    page: 20,
    group: 'J',
    iso: 'ar',
  },
  {
    id: 4,
    code: 'COL8',
    country_code: 'COL',
    number: 8,
    description: 'Brayan Córdova',
    team_name: 'Colombia',
    card_type: 'player',
    is_foil: false,
    owned_count: 0,
    page: 30,
    group: 'K',
    iso: 'co',
  },
]

const index = createAlbumSearchIndex(stickers)

describe('album search', () => {
  it('keeps country and player matches in separate ranked groups', () => {
    const results = searchAlbum(index, 'bra')

    expect(results.countries.map((country) => country.code)).toEqual(['BRA'])
    expect(results.players.map((player) => player.code)).toEqual(['COL8'])
  })

  it('prioritizes an exact sticker code and accepts separators', () => {
    expect(searchAlbum(index, 'ARG 10').players[0].code).toBe('ARG10')
    expect(searchAlbum(index, 'ARG.10').players[0].code).toBe('ARG10')
  })

  it('finds countries and players independently', () => {
    expect(searchAlbum(index, 'Brazil').countries[0].code).toBe('BRA')
    expect(searchAlbum(index, 'Messi').players[0].code).toBe('ARG10')
  })

  it('normalizes case and diacritics', () => {
    expect(normalizeAlbumSearch('  córdova ')).toBe('CORDOVA')
    expect(searchAlbum(index, 'cordova').players[0].code).toBe('COL8')
  })

  it('does not duplicate a country for each matching player', () => {
    const results = searchAlbum(index, 'li')

    expect(results.countries).toEqual([])
    expect(new Set(results.players.map((player) => player.code)).size).toBe(results.players.length)
  })
})
