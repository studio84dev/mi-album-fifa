import { useRef, useState } from 'react'
import { useClickOutside } from '../hooks/useClickOutside.ts'
import GlobalStatsBar from './GlobalStatsBar.tsx'

interface UserMenuProps {
  user: { id?: string; email?: string; user_metadata?: { full_name?: string; avatar_url?: string } }
  onSignOut: () => void
  onImport: () => void
  t: (_key: string) => string
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
    paniniCollected: number
    totalRepeated: number
  }
  collectionLoading: boolean
}

function UserMenu({ user, onSignOut, onImport, t, totals, collectionLoading }: UserMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [imgError, setImgError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside([containerRef], () => setShowMenu(false), showMenu)

  const displayName = user.user_metadata?.full_name || user.email || ''
  const initial = displayName.charAt(0).toUpperCase()
  const avatarUrl = user.user_metadata?.avatar_url

  const showAvatar = avatarUrl && !imgError

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="flex items-center gap-1 bg-transparent border-none cursor-pointer p-0 text-text-muted transition-[color] duration-fast hover:text-text-secondary"
        onClick={() => setShowMenu(!showMenu)}
        aria-label={t('userMenuAriaLabel')}
      >
        <span className="relative w-8 h-8 flex-shrink-0">
          <span className="w-8 h-8 rounded-full bg-accent-blue text-white flex items-center justify-center text-[0.82rem] font-bold">
            {initial}
          </span>
          {showAvatar && (
            <img
              src={avatarUrl}
              alt=""
              className="absolute top-0 left-0 w-8 h-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          )}
        </span>
        <svg
          className="w-3 h-3 flex-shrink-0 opacity-60"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {showMenu && (
        <div className="absolute top-[calc(100%+8px)] right-0 bg-modal-bg backdrop-blur-md border border-border-color rounded-lg p-1.5 min-w-[240px] max-w-[320px] z-[1002] shadow-lg animate-fade-in-down">
          <div className="p-1">
            <GlobalStatsBar totals={totals} loading={collectionLoading} t={t} compact />
          </div>
          <div className="h-px bg-border-color my-1" />
          <div className="text-[0.8rem] text-text-muted px-3 py-2 break-all">{user.email}</div>
          <button
            className="w-full text-left bg-transparent border-none text-text-secondary text-sm px-3 py-2 rounded-md cursor-pointer transition-[background,color] duration-fast flex items-center gap-2 font-[inherit] hover:bg-bg-tertiary hover:text-text-primary"
            onClick={() => {
              onImport()
              setShowMenu(false)
            }}
          >
            <svg
              className="w-3.5 h-3.5 flex-shrink-0 opacity-70"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {t('importMenuItem')}
          </button>
          <button
            className="w-full text-left bg-transparent border-none text-text-secondary text-sm px-3 py-2 rounded-md cursor-pointer transition-[background,color] duration-fast font-[inherit] hover:bg-[rgba(239,68,68,0.08)] hover:text-[#ef4444]"
            onClick={() => {
              onSignOut()
              setShowMenu(false)
            }}
          >
            {t('signOut')}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
