import UserMenu from './UserMenu.tsx'

interface HeaderProps {
  t: (_key: string) => string
  user: {
    id?: string
    email?: string
    user_metadata?: { full_name?: string; avatar_url?: string }
  } | null
  authLoading: boolean
  whatsNewUnread: boolean
  onOpenWhatsNew: () => void
  onSignIn: () => void
  onSignOut: () => void
  onImport: () => void
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
    paniniCollected: number
    totalRepeated: number
  }
  collectionLoading: boolean
}

function Header({
  t,
  user,
  authLoading,
  whatsNewUnread,
  onOpenWhatsNew,
  onSignOut,
  onImport,
  totals,
  collectionLoading,
}: HeaderProps) {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {whatsNewUnread && (
          <button className="about-link whats-new-btn" onClick={onOpenWhatsNew}>
            {t('whatsNewButton')}
            <span className="whats-new-badge" />
          </button>
        )}
      </div>
      <div className="user-auth-area">
        {authLoading && <div className="user-avatar-skeleton" aria-hidden="true" />}
        {!authLoading && user && (
          <UserMenu
            user={user}
            onSignOut={onSignOut}
            onImport={onImport}
            t={t}
            totals={totals}
            collectionLoading={collectionLoading}
          />
        )}
      </div>
    </div>
  )
}

export default Header
