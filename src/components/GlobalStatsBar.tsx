import { useState, useEffect } from 'react'

interface StatValueProps {
  collected: number
  total?: number
  isRepeated?: boolean
  loading: boolean
}

function StatValue({ collected, total, isRepeated, loading }: StatValueProps) {
  if (loading) return <span className="global-stat-skeleton" />
  if (isRepeated) {
    return (
      <span className="global-stat-value">
        <span className="global-stat-value-num">{collected}</span>
      </span>
    )
  }
  const complete = total !== undefined && collected >= total
  return (
    <span className={`global-stat-value${complete ? ' is-complete' : ''}`}>
      <span className="global-stat-value-num">{collected}</span>
      <span className="global-stat-value-sep">/</span>
      <span className="global-stat-value-total">{total}</span>
    </span>
  )
}

interface GlobalStatsBarProps {
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
    paniniCollected: number
    totalRepeated: number
  }
  loading: boolean
  t: (_key: string) => string
}

function GlobalStatsBar({ totals, loading, t }: GlobalStatsBarProps) {
  const { teamCollected, fwcCollected, ccCollected, paniniCollected, totalRepeated } = totals

  const TEAM_TOTAL = 960 // 48 teams × 20 stickers
  const FWC_TOTAL = 19
  const CC_TOTAL = 14
  const PANINI_TOTAL = 1

  const overallCollected = teamCollected + fwcCollected + ccCollected + paniniCollected
  const overallTotal = TEAM_TOTAL + FWC_TOTAL + CC_TOTAL + PANINI_TOTAL

  const pct = Math.round((overallCollected / overallTotal) * 100)

  const [displayPct, setDisplayPct] = useState(0)

  useEffect(() => {
    if (loading) {
      setDisplayPct(0)
      return
    }
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDisplayPct(pct))
    })
    return () => cancelAnimationFrame(raf)
  }, [loading, pct])

  return (
    <div className="global-stats-bar">
      <div className="global-stats-header">
        <span className="global-stats-title">{t('myAlbumTitle')}</span>
        <span className="global-stats-pct">{loading ? '...' : `${pct}%`}</span>
      </div>
      <div className="global-stats-progress">
        <div className="global-stats-progress-fill" style={{ width: `${displayPct}%` }} />
        {loading && (
          <div className="global-stats-progress-skeleton global-stats-progress-skeleton--overlay" />
        )}
      </div>
      <div className="global-stats-grid">
        <div className="global-stat-item">
          <StatValue collected={teamCollected} total={TEAM_TOTAL} loading={loading} />
          <span className="global-stat-desc">{t('statTeams')}</span>
        </div>
        <div className="global-stat-item global-stat-item--fwc">
          <StatValue collected={fwcCollected} total={FWC_TOTAL} loading={loading} />
          <span className="global-stat-desc">FWC</span>
        </div>
        <div className="global-stat-item global-stat-item--cc">
          <StatValue collected={ccCollected} total={CC_TOTAL} loading={loading} />
          <span className="global-stat-desc">CC</span>
        </div>
        <div className="global-stat-item global-stat-item--panini">
          <StatValue collected={paniniCollected} total={PANINI_TOTAL} loading={loading} />
          <span className="global-stat-desc">00 PANINI</span>
        </div>
        <div className="global-stat-item global-stat-item--rep">
          <StatValue collected={totalRepeated} isRepeated loading={loading} />
          <span className="global-stat-desc">{t('statRepeated')}</span>
        </div>
      </div>
    </div>
  )
}

export default GlobalStatsBar
