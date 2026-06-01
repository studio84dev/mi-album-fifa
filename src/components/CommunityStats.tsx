import { useCommunityStats } from '../hooks/useCommunityStats.ts'

interface CommunityStatsProps {
  t: (_key: string) => string
}

function CommunityStats({ t }: CommunityStatsProps) {
  const { stats, loading } = useCommunityStats()

  if (!loading && (stats?.rawCollectors ?? 0) < 10) return null

  if (loading) {
    return (
      <div className="community-stats">
        <span className="community-stat-skeleton-inline" />
      </div>
    )
  }

  const collectors = stats?.collectors ?? 0
  const stickers = stats?.stickers ?? 0
  const repeated = stats?.repeated ?? 0

  return (
    <div className="community-stats">
      <span className="community-stat-text">
        <span className="community-stat-num">{collectors}</span>
        <span className="community-stat-label"> {t('communityStatCollectors')}</span>
        <span className="community-stat-sep"> · </span>
        <span className="community-stat-num">{stickers}</span>
        <span className="community-stat-label"> {t('communityStatStickers')}</span>
        <span className="community-stat-sep"> · </span>
        <span className="community-stat-num">{repeated}</span>
        <span className="community-stat-label"> {t('communityStatRepeated')}</span>
      </span>
    </div>
  )
}

export default CommunityStats
