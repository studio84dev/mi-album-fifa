import { useState, useEffect } from 'react'

interface StatValueProps {
  collected: number
  total?: number
  isRepeated?: boolean
  loading: boolean
  compact?: boolean
  ccColor?: boolean
  paniniColor?: boolean
}

function StatValue({
  collected,
  total,
  isRepeated,
  loading,
  compact,
  ccColor,
  paniniColor,
}: StatValueProps) {
  const sizeClass = compact ? 'text-base' : 'text-xl'
  if (loading)
    return (
      <span className="block w-8 h-5 rounded-sm bg-[linear-gradient(90deg,var(--shimmer-start)_25%,var(--shimmer-middle)_50%,var(--shimmer-end)_75%)] bg-[length:200%_100%] animate-skeleton-shimmer" />
    )
  if (isRepeated) {
    return (
      <span className={`${sizeClass} font-bold leading-[1.1] tracking-[-0.02em] tabular-nums`}>
        <span className="text-accent-orange">{collected}</span>
      </span>
    )
  }
  const complete = total !== undefined && collected >= total
  const accentColor = ccColor ? '#e84040' : paniniColor ? '#6366f1' : undefined
  const numClass = complete ? 'text-inherit' : accentColor ? '' : 'text-accent-blue'
  return (
    <span
      className={`${sizeClass} font-bold leading-[1.1] tracking-[-0.02em] tabular-nums${complete ? (accentColor ? '' : ' text-accent-blue') : ''}`}
      style={complete && accentColor ? { color: accentColor } : undefined}
    >
      <span
        className={numClass}
        style={!complete && accentColor ? { color: accentColor } : undefined}
      >
        {collected}
      </span>
      <span className={`font-medium${complete ? '' : ' text-text-muted'}`}>/</span>
      <span className={`font-medium${complete ? '' : ' text-text-muted'}`}>{total}</span>
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
  compact?: boolean
}

function GlobalStatsBar({ totals, loading, t, compact = false }: GlobalStatsBarProps) {
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
    <div
      className={`w-full${
        compact
          ? ' bg-transparent border-none p-1 mb-0'
          : ' bg-card-bg border border-border-color rounded-xl px-5 py-[1.125rem] mb-5'
      }`}
    >
      <div className="flex justify-between items-center mb-[0.625rem]">
        <span className="text-sm font-semibold text-text-primary">{t('myAlbumTitle')}</span>
        <span className="text-sm font-bold text-accent-blue tabular-nums">
          {loading ? '...' : `${pct}%`}
        </span>
      </div>
      <div className="w-full h-1 bg-bg-quaternary rounded-full overflow-hidden mb-[0.875rem] relative">
        <div
          className="h-full bg-accent-blue rounded-full transition-[width] duration-[600ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          style={{ width: `${displayPct}%` }}
        />
        {loading && (
          <div className="absolute top-0 left-0 h-full w-full rounded-full bg-[linear-gradient(90deg,var(--shimmer-start)_25%,var(--shimmer-middle)_50%,var(--shimmer-end)_75%)] bg-[length:200%_100%] animate-skeleton-shimmer" />
        )}
      </div>
      <div
        className={`grid gap-1 max-[400px]:grid-cols-2 max-[400px]:gap-3${
          compact ? ' grid-cols-3 gap-[2px]' : ' grid-cols-4'
        }`}
      >
        <div
          className={`flex flex-col items-center gap-px${compact ? ' py-1 px-1 gap-0' : ' py-1'}`}
        >
          <StatValue
            collected={teamCollected}
            total={TEAM_TOTAL}
            loading={loading}
            compact={compact}
          />
          <span
            className={`text-text-muted font-medium uppercase tracking-[0.06em]${compact ? ' text-[0.65rem]' : ' text-xs'}`}
          >
            {t('statTeams')}
          </span>
        </div>
        <div
          className={`flex flex-col items-center gap-px${compact ? ' py-1 px-1 gap-0' : ' py-1'}`}
        >
          <StatValue
            collected={fwcCollected}
            total={FWC_TOTAL}
            loading={loading}
            compact={compact}
          />
          <span
            className={`text-text-muted font-medium uppercase tracking-[0.06em]${compact ? ' text-[0.65rem]' : ' text-xs'}`}
          >
            FWC
          </span>
        </div>
        <div
          className={`flex flex-col items-center gap-px${compact ? ' py-1 px-1 gap-0' : ' py-1'}`}
        >
          <StatValue
            collected={ccCollected}
            total={CC_TOTAL}
            loading={loading}
            compact={compact}
            ccColor
          />
          <span
            className={`text-text-muted font-medium uppercase tracking-[0.06em]${compact ? ' text-[0.65rem]' : ' text-xs'}`}
          >
            CC
          </span>
        </div>
        {!compact && (
          <div className="flex flex-col items-center gap-px py-1">
            <StatValue
              collected={paniniCollected}
              total={PANINI_TOTAL}
              loading={loading}
              paniniColor
            />
            <span className="text-xs text-text-muted font-medium uppercase tracking-[0.06em]">
              00 PANINI
            </span>
          </div>
        )}
        <div
          className={`flex flex-col items-center gap-px${compact ? ' py-1 px-1 gap-0' : ' py-1'}`}
        >
          <StatValue collected={totalRepeated} isRepeated loading={loading} compact={compact} />
          <span
            className={`text-text-muted font-medium uppercase tracking-[0.06em]${compact ? ' text-[0.65rem]' : ' text-xs'}`}
          >
            {t('statRepeated')}
          </span>
        </div>
      </div>
    </div>
  )
}

export default GlobalStatsBar
