interface ViewToggleProps {
  mode: 'cards' | 'panels'
  onChange: (_mode: 'cards' | 'panels') => void
  cardsLabel: string
  panelsLabel: string
}

function CardsIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="6" rx="2" />
      <rect x="3" y="14" width="18" height="6" rx="2" />
    </svg>
  )
}

function PanelsIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  )
}

function ViewToggle({ mode, onChange, cardsLabel, panelsLabel }: ViewToggleProps) {
  const baseButton =
    'flex items-center justify-center px-2.5 py-1.5 rounded-md transition-[background,border-color] duration-base border border-transparent'

  return (
    <div
      className="inline-flex items-center gap-1 bg-bg-tertiary border border-border-color rounded-lg p-1"
      role="group"
      aria-label="View mode"
    >
      <button
        className={`${baseButton} ${
          mode === 'cards'
            ? 'bg-card-bg border-border-strong'
            : 'hover:bg-bg-quaternary'
        }`}
        onClick={() => onChange('cards')}
        aria-label={cardsLabel}
        aria-pressed={mode === 'cards'}
      >
        <CardsIcon color={mode === 'cards' ? 'var(--accent-blue)' : 'var(--text-muted)'} />
      </button>
      <button
        className={`${baseButton} ${
          mode === 'panels'
            ? 'bg-card-bg border-border-strong'
            : 'hover:bg-bg-quaternary'
        }`}
        onClick={() => onChange('panels')}
        aria-label={panelsLabel}
        aria-pressed={mode === 'panels'}
      >
        <PanelsIcon color={mode === 'panels' ? 'var(--accent-blue)' : 'var(--text-muted)'} />
      </button>
    </div>
  )
}

export default ViewToggle
