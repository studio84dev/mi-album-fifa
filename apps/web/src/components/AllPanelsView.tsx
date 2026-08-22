import { useMemo } from 'react'
import { flags } from '@mi-album-fifa/shared'
import type { CollectionMap } from '@mi-album-fifa/shared'
import StickerPanel from './StickerPanel.tsx'
import type { TeamSummary } from '../hooks/useSearchResults.ts'

interface CountryDetails {
  stickerCount: number
  stickerNumbers: number[]
}

interface AllPanelsViewProps {
  allCountries: TeamSummary[]
  countryDetails: Record<string, CountryDetails>
  collection: CollectionMap
  user: { id: string } | null
  updateEntry: (
    _countryCode: string,
    _stickerNumber: number | string,
    _data: { collected: boolean; repeated?: number }
  ) => void
  searchQuery?: string
  matchedCountryCodes?: Set<string> | null
  highlightByCountry?: Record<string, number> | null
  t: (_key: string) => string
}

function CountrySection({
  team,
  details,
  collection,
  user,
  updateEntry,
  highlightNumber,
  t,
}: {
  team: TeamSummary
  details: CountryDetails
  collection: CollectionMap
  user: { id: string } | null
  updateEntry: AllPanelsViewProps['updateEntry']
  highlightNumber: number | null
  t: (_key: string) => string
}) {
  const initialData = collection[team.code] ?? {}

  return (
    <section className="w-full">
      <div className="flex items-center gap-3 py-3 border-b border-border-color mb-2">
        {team.iso && flags[team.iso] ? (
          <img
            src={flags[team.iso]}
            alt={team.team_name ?? ''}
            className="w-7 h-auto rounded-[3px] block"
          />
        ) : null}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-text-primary">
            {team.code} — {team.team_name}
          </h2>
          {team.page != null && (
            <p className="text-xs text-text-muted">
              {t('stickerPanelPageLabel')} {team.page}
            </p>
          )}
        </div>
      </div>

      <StickerPanel
        countryCode={team.code}
        user={user}
        stickerCount={details.stickerCount}
        stickerNumbers={details.stickerNumbers}
        page={team.page ?? null}
        initialData={initialData}
        highlightNumber={highlightNumber}
        onCollectionChange={updateEntry}
        t={t}
      />
    </section>
  )
}

function AllPanelsView({
  allCountries,
  countryDetails,
  collection,
  user,
  updateEntry,
  searchQuery,
  matchedCountryCodes,
  highlightByCountry,
  t,
}: AllPanelsViewProps) {
  const isSearching = Boolean(searchQuery?.trim())

  const filteredCountries = useMemo(() => {
    if (!isSearching || !matchedCountryCodes) return allCountries
    return allCountries.filter((c) => matchedCountryCodes.has(c.code))
  }, [allCountries, matchedCountryCodes, isSearching])

  if (isSearching && filteredCountries.length === 0) {
    return (
      <div className="w-full text-center px-4 py-12 text-text-muted text-base">
        <div className="text-[2.5rem] mb-3">🔍</div>
        <p>{t('noResults')}</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{t('sureNotPasted')}</p>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {filteredCountries.map((team) => {
        const details = countryDetails[team.code]
        if (!details) return null
        return (
          <CountrySection
            key={team.code}
            team={team}
            details={details}
            collection={collection}
            user={user}
            updateEntry={updateEntry}
            highlightNumber={highlightByCountry?.[team.code] ?? null}
            t={t}
          />
        )
      })}
    </div>
  )
}

export default AllPanelsView
