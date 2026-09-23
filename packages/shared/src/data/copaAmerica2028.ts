import type { Sticker } from './stickers'

// Demonstration catalog; these are sample slots, not an official roster.
const teams = [
  { code: 'ARG', name: 'Argentina', iso: 'ar', page: 1 },
  { code: 'BRA', name: 'Brazil', iso: 'br', page: 2 },
  { code: 'CHI', name: 'Chile', iso: 'cl', page: 3 },
]
const cards: Sticker[] = teams.flatMap((team, index) =>
  Array.from({ length: 3 }, (_, slot) => ({
    id: index * 3 + slot + 1,
    code: `${team.code} ${slot + 1}`,
    country_code: team.code,
    number: slot + 1,
    description: slot === 0 ? 'Team Logo' : slot === 1 ? 'Team Photo' : 'Sample Player',
    team_name: team.name,
    card_type: slot === 0 ? 'team_logo' : slot === 1 ? 'team_photo' : 'player',
    is_foil: slot === 0,
    owned_count: 0,
    page: team.page,
    group: 'A',
    iso: team.iso,
  }))
)
export default cards
