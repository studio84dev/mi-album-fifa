import { flags } from '@mi-album-fifa/shared'
import type { CardType } from '@mi-album-fifa/shared'

const GROUP_COLORS: Record<string, string> = {
  a: '#2d7a35',
  b: '#c53030',
  c: '#b7791f',
  d: '#2b6cb0',
  e: '#c05621',
  f: '#276749',
  g: '#6b46c1',
  h: '#086f83',
  i: '#553c9a',
  j: '#b7445a',
  k: '#97266d',
  l: '#744210',
}

const ICON_CLASS = 'w-[1.625rem] h-auto flex-shrink-0 block'

const FWC_ICON = (
  <svg
    className={ICON_CLASS}
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
  <svg className={ICON_CLASS} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
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
    className={ICON_CLASS}
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
  single?: boolean
}

function TeamCard({ team, stats, isComplete, isActive, onClick, single }: TeamCardProps) {
  const cardBase = [
    'rounded-lg p-4 w-full box-border min-w-0 flex items-center gap-[0.875rem] border cursor-pointer',
    'transition-[background,border-color,box-shadow] duration-base',
    single ? 'max-w-[400px]' : '',
    isActive
      ? 'border-accent-blue-border bg-accent-blue-subtle hover:bg-accent-blue-subtle hover:border-accent-blue-border'
      : isComplete
        ? 'border-accent-orange-border bg-accent-orange-subtle hover:bg-accent-orange-subtle hover:border-accent-orange-border'
        : 'bg-card-bg border-border-color hover:bg-bg-tertiary hover:border-border-strong hover:shadow-sm',
  ]
    .filter(Boolean)
    .join(' ')

  const pageNumClass =
    'text-[1.5rem] min-[601px]:text-[1.375rem] font-bold text-text-muted min-w-[50px] min-[601px]:min-w-[44px] text-center tracking-[-0.02em] tabular-nums'

  const statsBlock = (collected: number, total: number, repeated: number) => {
    const complete = collected >= total
    return (
      <div className="flex flex-col items-end gap-[0.2rem] flex-shrink-0">
        <div
          className={`text-sm font-semibold leading-[1.2] tabular-nums${
            complete ? ' text-accent-blue' : ''
          }`}
        >
          <span className={complete ? 'text-inherit' : 'text-accent-blue'}>{collected}</span>
          <span className={complete ? 'text-inherit' : 'text-text-muted font-medium'}>/</span>
          <span className={complete ? 'text-inherit' : 'text-text-muted font-medium'}>{total}</span>
        </div>
        {repeated > 0 && (
          <div className="text-xs text-accent-orange leading-[1.2] tabular-nums">{repeated}</div>
        )}
      </div>
    )
  }

  const isSpecial =
    team.card_type === 'panini_logo' || team.card_type === 'fwc_special' || team.card_type === 'cc'

  if (isSpecial) {
    const icon =
      team.card_type === 'fwc_special' ? FWC_ICON : team.card_type === 'cc' ? CC_ICON : PANINI_ICON
    const label =
      team.card_type === 'fwc_special' ? 'FWC' : team.card_type === 'cc' ? 'CC' : '00 PANINI'
    const codeColor =
      team.card_type === 'fwc_special' ? '#3b82f6' : team.card_type === 'cc' ? '#e84040' : undefined
    const total = team.count
    return (
      <div className={`${cardBase} justify-start`} onClick={onClick}>
        <div className={pageNumClass}>{team.page}</div>
        {icon}
        <div className="flex-1 min-w-0">
          <div
            className="text-xs font-semibold uppercase tracking-[0.08em] mb-[0.2rem]"
            style={codeColor ? { color: codeColor } : undefined}
          >
            {team.code}
          </div>
          <div className="text-[1.1rem] min-[601px]:text-base font-semibold text-country-name whitespace-nowrap overflow-hidden text-ellipsis">
            {label}
          </div>
        </div>
        {stats ? statsBlock(stats.collected, total, stats.repeated) : null}
      </div>
    )
  }

  const groupKey = team.group?.toLowerCase() ?? ''
  const groupColor = GROUP_COLORS[groupKey] ?? '#888'

  return (
    <div className={cardBase} onClick={onClick}>
      <div className={pageNumClass}>{team.page}</div>
      <img
        src={flags[team.iso ?? '']}
        alt={team.team_name ?? ''}
        className="w-[1.625rem] h-auto flex-shrink-0 rounded-[3px] block"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-text-muted font-semibold uppercase tracking-[0.08em] leading-none">
            {team.code}
          </span>
          <span
            className="w-4 h-4 rounded-full inline-flex items-center justify-center font-bold text-[0.6rem] text-white flex-shrink-0 opacity-85"
            style={{ backgroundColor: groupColor }}
          >
            {team.group}
          </span>
        </div>
        <div className="text-[1.1rem] min-[601px]:text-base font-semibold text-country-name whitespace-nowrap overflow-hidden text-ellipsis">
          {team.team_name}
        </div>
        {team.matchedSticker && (
          <div className="text-xs font-medium text-accent-blue bg-accent-blue-subtle border border-accent-blue-border rounded-sm px-2 py-[2px] w-fit mt-1">
            {team.matchedSticker.code} — {team.matchedSticker.description}
          </div>
        )}
      </div>
      {stats ? (
        statsBlock(stats.collected, stats.total, stats.repeated)
      ) : (
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-text-muted bg-bg-quaternary border border-border-color flex-shrink-0">
          {team.group}
        </div>
      )}
    </div>
  )
}

export default TeamCard
