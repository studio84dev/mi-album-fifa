import flags from '../data/flags.ts'
import type { CardType } from '../data/stickers.ts'

const FWC_ICON = (
  <svg
    className="special-icon"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
    fill="#FFD700"
  >
    <path
      d="M384,449.963v-12.629c0-17.643-14.357-32-32-32h-15.104c-19.989-34.176-27.52-93.973-27.563-127.659
      c3.349-6.059,6.549-11.712,9.237-16.341c17.557-30.379,44.096-99.072,44.096-133.333v-4.821c0-5.845-0.043-10.368-0.192-14.336
      c0.085-0.619,0.192-1.707,0.192-2.176C362.667,47.851,314.816,0,256,0S149.333,47.851,149.333,106.667
      c0,13.141,2.645,25.835,7.211,37.717c0.043,0.213-0.021,0.427,0.021,0.64l46.763,185.728
      c-9.493,31.317-23.019,62.037-28.779,74.581H160c-17.643,0-32,14.357-32,32v12.629c-12.395,4.416-21.333,16.149-21.333,30.037
      v21.333c0,5.888,4.779,10.667,10.667,10.667h277.333c5.888,0,10.667-4.779,10.667-10.667V480
      C405.333,466.112,396.395,454.379,384,449.963z M256,21.333c40.107,0,73.579,27.883,82.709,64.747
      c-9.323,1.856-12.672,12.373-16.704,27.072c-1.792,6.528-3.691,12.843-5.76,18.859c-6.677-14.912-21.568-25.344-38.912-25.344
      c-18.667,0-34.389,12.117-40.171,28.843c-2.453-5.333-4.843-10.965-7.232-17.003c-7.04-17.792-13.12-33.173-27.285-33.173
      c-4.117,0-7.851,1.771-10.496,4.992c-7.296,8.875-5.269,28.096,3.819,76.352c-15.936-15.744-25.301-37.141-25.301-60.011
      C170.667,59.605,208.939,21.333,256,21.333z M298.667,149.333c0,11.755-9.557,21.333-21.333,21.333S256,161.088,256,149.333
      c0-11.755,9.557-21.333,21.333-21.333S298.667,137.579,298.667,149.333z M189.76,189.483c3.84,3.051,7.893,5.845,12.203,8.384
      c5.717,29.824,11.371,61.099,11.371,79.467c0,1.536-0.149,3.221-0.235,4.821L189.76,189.483z M234.667,277.333
      c0-22.933-7.168-59.904-14.101-95.659c-3.243-16.789-7.189-37.035-9.536-53.035c9.472,23.893,23.829,56.832,56.939,62.251
      c3.029,0.683,6.144,1.109,9.365,1.109c3.392,0,6.656-0.491,9.835-1.259c34.816-6.123,47.445-43.371,54.165-67.435V128
      c0,27.157-23.061,91.2-42.219,124.373C285.12,276.565,256,326.912,256,373.333c0,5.888,4.779,10.667,10.667,10.667
      s10.667-4.779,10.667-10.667c0-18.496,5.717-38.229,13.184-56.619c3.136,28.309,9.664,62.016,22.08,88.619H197.952
      C210.347,377.365,234.667,317.333,234.667,277.333z M149.333,437.333c0-5.888,4.8-10.667,10.667-10.667h192
      c5.867,0,10.667,4.779,10.667,10.667V448H149.333V437.333z M384,490.667H128V480c0-5.888,4.8-10.667,10.667-10.667h234.667
      C379.2,469.333,384,474.112,384,480V490.667z"
    />
  </svg>
)

const CC_ICON = (
  <svg className="special-icon" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
    <circle cx="14" cy="14" r="13" fill="#E8000E" />
    <text
      x="14"
      y="14"
      textAnchor="middle"
      dominantBaseline="central"
      fill="white"
      fontSize="11"
      fontWeight="800"
      fontFamily="system-ui,sans-serif"
    >
      CC
    </text>
  </svg>
)

const PANINI_ICON = (
  <svg
    className="special-icon"
    viewBox="-6.5 0 32 32"
    xmlns="http://www.w3.org/2000/svg"
    fill="#6366F1"
  >
    <path d="M2.531 4.781h13.563c1.406 0 2.531 1.156 2.531 2.531v14.844c0 1.344-1.094 2.469-2.438 2.531v-1.688c0.406-0.063 0.75-0.438 0.75-0.844v-14.844c0-0.438-0.406-0.813-0.844-0.813h-13.563c-0.438 0-0.844 0.375-0.844 0.813 0.156-0.031 0.375-0.063 0.563-0.063 0.156 0 0.281 0 0.438 0.031l10.156 1.531c1.375 0.25 2.375 1.5 2.375 2.875v13.219c0 1.313-0.938 2.281-2.219 2.281-0.125 0-0.313 0-0.469-0.031l-10.125-1.531c-1.344-0.25-2.406-1.5-2.406-2.844v-15.469c0-1.375 1.156-2.531 2.531-2.531zM3.031 12.75l8.906 1.313 0.219-1.531-8.906-1.313zM4.906 14.094l-0.125 0.938 4.938 0.75 0.125-0.938z" />
  </svg>
)

interface TeamCardProps {
  team: {
    code: string
    team_name: string | null
    group: string | null
    iso: string | null
    page: number
    card_type: CardType
    count: number
    matchedSticker?: { code: string; description: string }
  }
  stats?: { collected: number; total: number; repeated: number } | null
  isComplete: boolean
  isActive: boolean
  onClick: () => void
}

function TeamCard({ team, stats, isComplete, isActive, onClick }: TeamCardProps) {
  const stateClass = isActive ? 'sticker-card--active' : isComplete ? 'sticker-card--complete' : ''

  const isSpecial =
    team.card_type === 'panini_logo' || team.card_type === 'fwc_special' || team.card_type === 'cc'

  if (isSpecial) {
    const icon =
      team.card_type === 'fwc_special' ? FWC_ICON : team.card_type === 'cc' ? CC_ICON : PANINI_ICON
    const label =
      team.card_type === 'fwc_special' ? 'FWC' : team.card_type === 'cc' ? 'CC' : '00 PANINI'
    const total = team.count
    return (
      <div
        className={`sticker-card sticker-card--special sticker-card--${label.toLowerCase()} ${stateClass}`.trim()}
        style={{ cursor: 'pointer' }}
        onClick={onClick}
      >
        <div className="page-number">{team.page}</div>
        {icon}
        <div className="country-info">
          <div className="country-code">{team.code}</div>
          <div className="country-name">{label}</div>
        </div>
        {stats ? (
          <div className="sticker-stats">
            <div className={`sticker-stats-count${stats.collected >= total ? ' is-complete' : ''}`}>
              <span className="sticker-stats-num">{stats.collected}</span>
              <span className="sticker-stats-sep">/</span>
              <span className="sticker-stats-total">{total}</span>
            </div>
            {stats.repeated > 0 && <div className="sticker-stats-repeated">{stats.repeated}</div>}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`sticker-card ${stateClass}`.trim()}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="page-number">{team.page}</div>
      <img src={flags[team.iso ?? '']} alt={team.team_name ?? ''} className="country-flag" />
      <div className="country-info">
        <div className="country-code-row">
          <span className="country-code">{team.code}</span>
          <span className={`group-badge-small group-${team.group?.toLowerCase() ?? ''}`}>
            {team.group}
          </span>
        </div>
        <div className="country-name">{team.team_name}</div>
        {team.matchedSticker && (
          <div className="search-match-badge">
            {team.matchedSticker.code} — {team.matchedSticker.description}
          </div>
        )}
      </div>
      {stats ? (
        <div className="sticker-stats">
          <div
            className={`sticker-stats-count${stats.collected >= stats.total ? ' is-complete' : ''}`}
          >
            <span className="sticker-stats-num">{stats.collected}</span>
            <span className="sticker-stats-sep">/</span>
            <span className="sticker-stats-total">{stats.total}</span>
          </div>
          {stats.repeated > 0 && <div className="sticker-stats-repeated">{stats.repeated}</div>}
        </div>
      ) : (
        <div className={`group-badge group-${team.group?.toLowerCase() ?? ''}`}>{team.group}</div>
      )}
    </div>
  )
}

export default TeamCard
