import { useMemo } from 'react'
import TeamCard from './TeamCard.tsx'
import StickerCard from './StickerCard.tsx'
import type { SearchResult } from '../hooks/useSearchResults.ts'

interface StickerListProps {
  results: SearchResult[]
  onSelect: (_result: SearchResult) => void
  collection: Record<string, Record<string, { collected: boolean; repeated: number }>>
  selectedCode: string | null
  t: (_key: string) => string
}

function StickerList({ results, onSelect, collection, selectedCode, t }: StickerListProps) {
  const { completedCodes, statsMap } = useMemo(() => {
    const completed = new Set<string>()
    const stats: Record<string, { collected: number; total: number; repeated: number }> = {}
    results.forEach((result) => {
      const total = result.kind === 'teamCard' ? (result.count ?? 20) : 20
      const codeMap = collection?.[result.code] ?? {}
      const entries = Object.values(codeMap) as { collected: boolean; repeated: number }[]
      const collectedCount = entries.filter((e) => e.collected).length
      const repeatedCount = entries.reduce((acc, e) => acc + (e.repeated ?? 0), 0)
      if (collectedCount >= total) completed.add(result.code)
      stats[result.code] = { collected: collectedCount, total, repeated: repeatedCount }
    })
    return { completedCodes: completed, statsMap: stats }
  }, [results, collection])

  const isSingle = results.length === 1
  const gridClass = isSingle
    ? 'w-full grid gap-[0.625rem] min-w-0 overflow-x-hidden grid-cols-1 place-items-center'
    : 'w-full grid gap-[0.625rem] min-w-0 overflow-x-hidden [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))] max-[600px]:grid-cols-1'

  if (results.length === 0) {
    return (
      <div className={gridClass}>
        <div className="max-w-[400px] w-full text-center px-4 py-12 text-text-muted text-base">
          <div className="text-[2.5rem] mb-3">🤷‍♂️</div>
          <p>{t('noResults')}</p>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{t('sureNotPasted')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={gridClass}>
      {results.map((result) =>
        result.kind === 'teamCard' ? (
          <TeamCard
            key={result.code}
            team={result}
            stats={statsMap[result.code]}
            isComplete={completedCodes.has(result.code)}
            isActive={selectedCode === result.code}
            onClick={() => onSelect(result)}
            single={isSingle}
          />
        ) : (
          <StickerCard
            key={result.code}
            sticker={result}
            collection={collection}
            onClick={() => onSelect(result)}
            single={isSingle}
          />
        )
      )}
    </div>
  )
}

export default StickerList
