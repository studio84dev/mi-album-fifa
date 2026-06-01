import { useMemo } from 'react'
import TeamCard from './TeamCard.tsx'
import StickerCard from './StickerCard.tsx'

interface StickerListProps {
  results: Array<Record<string, unknown> & { kind: string; code: string; count?: number }>
  onSelect: (_result: unknown) => void
  collection: Record<string, Record<string, { collected: boolean; repeated: number }>>
  selectedCode: string | null
  t: (_key: string) => string
}

function StickerList({ results, onSelect, collection, selectedCode, t }: StickerListProps) {
  const { completedCodes, statsMap } = useMemo(() => {
    const completed = new Set<string>()
    const stats: Record<string, { collected: number; total: number; repeated: number }> = {}
    results.forEach((result) => {
      const total = result.count ?? 20
      const codeMap = collection?.[result.code] ?? {}
      const entries = Object.values(codeMap) as { collected: boolean; repeated: number }[]
      const collectedCount = entries.filter((e) => e.collected).length
      const repeatedCount = entries.reduce((acc, e) => acc + (e.repeated ?? 0), 0)
      if (collectedCount >= total) completed.add(result.code)
      stats[result.code] = { collected: collectedCount, total, repeated: repeatedCount }
    })
    return { completedCodes: completed, statsMap: stats }
  }, [results, collection])

  if (results.length === 0) {
    return (
      <div className="no-results">
        <div className="no-results-emoji">🤷‍♂️</div>
        <p>{t('noResults')}</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{t('sureNotPasted')}</p>
      </div>
    )
  }

  return (
    <div className="stickers-list">
      {results.map((result) =>
        result.kind === 'teamCard' ? (
          <TeamCard
            key={result.code}
            team={result as any}
            stats={statsMap[result.code]}
            isComplete={completedCodes.has(result.code)}
            isActive={selectedCode === result.code}
            onClick={() => onSelect(result)}
          />
        ) : (
          <StickerCard
            key={result.code}
            sticker={result as any}
            collection={collection}
            onClick={() => onSelect(result)}
          />
        )
      )}
    </div>
  )
}

export default StickerList
