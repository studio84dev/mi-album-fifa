import ShareMenu from './ShareMenu.tsx'

interface AboutModalProps {
  onClose: () => void
  t: (_key: string) => string
  share: (_platform: string) => void
  shareOptions: { id: string; label: string; icon: string }[]
}

function AboutModal({ onClose, t, share, shareOptions }: AboutModalProps) {
  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-close-btn" onClick={onClose} aria-label={t('closeAriaLabel')}>
          ×
        </button>
        <div className="about-content">
          <h2>{t('aboutTitle')}</h2>
          <p>{t('aboutParagraph1')}</p>
          <p>{t('aboutParagraph2')}</p>
          <p>{t('aboutParagraph2b')}</p>
          <p>{t('aboutParagraph3')}</p>
          <p>
            {t('aboutParagraph4a')}{' '}
            <a
              href="https://link.mercadopago.cl/mialbumfifa"
              target="_blank"
              rel="noopener noreferrer"
              className="about-kofi-link"
            >
              {t('aboutParagraph4b')}
            </a>
            {'. '}
          </p>
          <p>{t('aboutParagraph4d')}</p>

          <div className="about-opensource">
            <div className="about-opensource-header">
              <span className="about-opensource-badge">{t('aboutOpenSourceBadge')}</span>
              <h3 className="about-opensource-title">{t('aboutOpenSourceTitle')}</h3>
            </div>
            <p className="about-opensource-desc">{t('aboutOpenSourceDesc')}</p>
            <div className="about-share-row">
              <span className="about-share-text">{t('aboutShareText')}</span>
              <ShareMenu
                t={t}
                share={share}
                shareOptions={shareOptions}
                className="about-share-menu"
              />
            </div>
            <div className="about-stack">
              <span className="about-stack-label">{t('aboutBuiltWith')}</span>
              <div className="about-stack-pills">
                <span className="about-stack-pill">React</span>
                <span className="about-stack-pill">Vite</span>
                <span className="about-stack-pill">Supabase</span>
                <span className="about-stack-pill">Pure CSS</span>
              </div>
            </div>
            <div className="about-opensource-actions">
              <a
                href="https://github.com/studio84dev/mi-album-fifa"
                target="_blank"
                rel="noopener noreferrer"
                className="about-opensource-btn about-opensource-btn--star"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {t('aboutActionStar')}
              </a>
              <a
                href="https://github.com/studio84dev/mi-album-fifa/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="about-opensource-btn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="14"
                  height="14"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {t('aboutActionIssue')}
              </a>
              <a
                href="https://github.com/studio84dev/mi-album-fifa/blob/master/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="about-opensource-btn"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  width="14"
                  height="14"
                >
                  <path d="M16 18l6-6-6-6" />
                  <path d="M8 6l-6 6 6 6" />
                </svg>
                {t('aboutActionContribute')}
              </a>
            </div>
            <p className="about-opensource-meta">Open source · MIT License</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutModal
