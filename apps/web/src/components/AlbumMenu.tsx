import { useRef, useState } from 'react'
import { SYSTEM_ALBUMS } from '@mi-album-fifa/shared'
import { useClickOutside } from '../hooks/useClickOutside.ts'

interface Album {
  id: string
  name: string
  description: string | null
}

interface AlbumMenuProps {
  albums: Album[]
  activeAlbumId: string
  onChange: (_id: string) => void
  t: (_key: string) => string
}

function albumLabel(album: Album, t: (_key: string) => string) {
  const systemAlbum = SYSTEM_ALBUMS.find((a) => a.id === album.id)
  return systemAlbum ? t(systemAlbum.nameKey) : album.name
}

function AlbumMenu({ albums, activeAlbumId, onChange, t }: AlbumMenuProps) {
  const [showMenu, setShowMenu] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useClickOutside([containerRef], () => setShowMenu(false), showMenu)

  const activeAlbum = albums.find((a) => a.id === activeAlbumId)

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="flex items-center gap-1.5 max-w-[210px] bg-bg-tertiary border border-border-color rounded-lg pl-2.5 pr-2 py-1.5 text-text-secondary text-sm font-medium cursor-pointer transition-[background,color] duration-fast font-[inherit] hover:bg-bg-quaternary hover:text-text-primary"
        onClick={() => setShowMenu(!showMenu)}
        aria-label={t('albumsSelect')}
        aria-expanded={showMenu}
      >
        <svg
          className="w-4 h-4 flex-shrink-0 opacity-70"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 3h13a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V3zm3 0v18M10 7h6M10 11h6" />
        </svg>
        <span className="truncate">
          {activeAlbum ? albumLabel(activeAlbum, t) : t('albumsNoActive')}
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
        <div className="absolute top-[calc(100%+8px)] left-0 bg-modal-bg backdrop-blur-md border border-border-color rounded-lg p-1.5 min-w-[220px] max-w-[300px] z-[1002] shadow-lg animate-fade-in-down">
          <div className="text-[0.7rem] font-semibold uppercase tracking-wide text-text-muted px-3 py-1.5">
            {t('albumsTitle')}
          </div>
          {albums.map((album) => {
            const isActive = album.id === activeAlbumId
            const systemAlbum = SYSTEM_ALBUMS.find((a) => a.id === album.id)
            return (
              <button
                key={album.id}
                className={`w-full text-left flex items-center justify-between gap-2 bg-transparent border-none text-sm px-3 py-2 rounded-md cursor-pointer transition-[background,color] duration-fast font-[inherit] ${
                  isActive
                    ? 'text-accent-blue bg-accent-blue-subtle'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
                }`}
                onClick={() => {
                  onChange(album.id)
                  setShowMenu(false)
                }}
              >
                <span className="flex flex-col min-w-0">
                  <span className="truncate">{albumLabel(album, t)}</span>
                  {systemAlbum?.sample && (
                    <span className="text-[0.7rem] text-text-muted truncate">
                      {t('albumsSample')}
                    </span>
                  )}
                </span>
                {isActive && (
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AlbumMenu
