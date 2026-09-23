import UserMenu from './UserMenu.tsx'
import AlbumMenu from './AlbumMenu.tsx'

interface Album {
  id: string
  name: string
  description: string | null
}

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
  albums: Album[]
  activeAlbumId: string
  onChangeAlbum: (_id: string) => void
  totals: {
    teamCollected: number
    fwcCollected: number
    ccCollected: number
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
  albums,
  activeAlbumId,
  onChangeAlbum,
  totals,
  collectionLoading,
}: HeaderProps) {
  return (
    <div className="flex justify-between items-center w-full mb-4 pt-3 gap-2">
      <div className="flex gap-2 items-center">
        <AlbumMenu albums={albums} activeAlbumId={activeAlbumId} onChange={onChangeAlbum} t={t} />
        {whatsNewUnread && (
          <button
            className="relative bg-transparent border-none text-text-muted text-sm font-medium cursor-pointer px-3 py-[0.4rem] transition-[color] duration-base rounded-md font-[inherit] hover:text-text-primary hover:bg-bg-tertiary"
            onClick={onOpenWhatsNew}
          >
            {t('whatsNewButton')}
            <span className="absolute top-[3px] right-[3px] w-[7px] h-[7px] rounded-full bg-accent-orange block animate-badge-pulse" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mr-2">
        {authLoading && (
          <div
            className="w-8 h-8 rounded-full bg-[linear-gradient(90deg,var(--shimmer-start)_25%,var(--shimmer-middle)_50%,var(--shimmer-end)_75%)] bg-[length:200%_100%] animate-skeleton-shimmer"
            aria-hidden="true"
          />
        )}
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
