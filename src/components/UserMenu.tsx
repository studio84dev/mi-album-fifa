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
    <div className="user-avatar-container" ref={containerRef}>
      <button
        className="user-avatar-btn"
        onClick={() => setShowMenu(!showMenu)}
        aria-label={t('userMenuAriaLabel')}
      >
        <span className="user-avatar-wrap">
          <span className="user-avatar-initial">{initial}</span>
          {showAvatar && (
            <img
              src={avatarUrl}
              alt=""
              className="user-avatar-img"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          )}
        </span>
        <svg
          className="user-avatar-chevron"
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
        <div className="user-dropdown">
          <div className="user-dropdown-stats">
            <GlobalStatsBar totals={totals} loading={collectionLoading} t={t} />
          </div>
          <div className="user-dropdown-divider" />
          <div className="user-dropdown-email">{user.email}</div>
          <button
            className="user-dropdown-import"
            onClick={() => {
              onImport()
              setShowMenu(false)
            }}
          >
            <svg
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
            className="user-dropdown-logout"
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
