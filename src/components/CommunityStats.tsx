import { useCommunityStats } from '../hooks/useCommunityStats.ts'

interface CommunityStatsProps {
  t: (_key: string) => string
}

function CommunityStats({ t }: CommunityStatsProps) {
  const { stats, loading } = useCommunityStats()

  if (!loading && (stats?.rawCollectors ?? 0) < 10) return null

  if (loading) {
    return (
      <div className="flex items-center justify-center py-3 pb-2 mb-2">
        <span className="inline-block w-56 h-4 rounded-sm bg-[linear-gradient(90deg,var(--bg-tertiary)_25%,var(--bg-quaternary)_50%,var(--bg-tertiary)_75%)] bg-[length:200%_100%] animate-skeleton-shimmer max-[480px]:w-40" />
      </div>
    )
  }

  const collectors = stats?.collectors ?? 0
  const stickers = stats?.stickers ?? 0
  const repeated = stats?.repeated ?? 0

  return (
    <div className="flex items-center justify-center py-3 pb-2 mb-2">
      <span className="text-sm text-text-muted text-center whitespace-nowrap tabular-nums max-[480px]:text-xs max-[480px]:whitespace-normal max-[480px]:leading-[1.4]">
        <span className="text-text-secondary font-semibold">{collectors}</span>
        <span className="text-xs text-text-muted uppercase tracking-[0.04em]">
          {' '}
          {t('communityStatCollectors')}
        </span>
        <span className="text-text-muted opacity-60"> · </span>
        <span className="text-text-secondary font-semibold">{stickers}</span>
        <span className="text-xs text-text-muted uppercase tracking-[0.04em]">
          {' '}
          {t('communityStatStickers')}
        </span>
        <span className="text-text-muted opacity-60"> · </span>
        <span className="text-text-secondary font-semibold">{repeated}</span>
        <span className="text-xs text-text-muted uppercase tracking-[0.04em]">
          {' '}
          {t('communityStatRepeated')}
        </span>
      </span>
    </div>
  )
}

export default CommunityStats
