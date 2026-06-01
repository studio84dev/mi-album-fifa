const FEATURES = [
  { id: 'sticker-panel-page', date: '2026-05-30', icon: '📄' },
  { id: 'player-search', date: '2026-05-30', icon: '🔍' },
  { id: 'avatar-refresh', date: '2026-05-28', icon: '👤' },
  { id: 'design-refresh-may28', date: '2026-05-28', icon: '🎨' },
  { id: 'release-may27', date: '2026-05-27', icon: '📖' },
  { id: 'site-redesign', date: '2026-05-27', icon: '🎨' },
  { id: 'card-collection-stats', date: '2026-05-27', icon: '📈' },
  { id: 'sticker-card-feedback', date: '2026-05-26', icon: '✅' },
  { id: 'theme-consistency', date: '2026-05-25', icon: '🎨' },
  { id: 'import-collection', date: '2026-05-25', icon: '📥' },
  { id: 'i18n-support', date: '2026-05-25', icon: '🌐' },
  { id: 'ux-improvements', date: '2026-05-25', icon: '✨' },
  { id: 'last-touched', date: '2026-05-25', icon: '🟡' },
  { id: 'global-stats', date: '2026-05-24', icon: '📊' },
  { id: 'fwc-cc-cards', date: '2026-05-24', icon: '🃏' },
  { id: 'nav-redesign', date: '2026-05-24', icon: '🎨' },
]

function formatDate(isoDate: string, locale: string) {
  const [y, m, d] = isoDate.split('-')
  const yy = y.slice(2)
  return locale === 'en' ? `${m}/${d}/${yy}` : `${d}/${m}/${yy}`
}

const STORAGE_KEY = 'whats-new-read'

interface WhatsNewModalProps {
  onClose: () => void
  t: (_key: string) => string
  locale?: string
}

function WhatsNewModal({ onClose, t, locale = 'es' }: WhatsNewModalProps) {
  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal whats-new-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="about-close-btn"
          onClick={onClose}
          aria-label={t('whatsNewCloseAriaLabel')}
        >
          ×
        </button>
        <div className="whats-new-header">
          <span className="whats-new-title-icon">✨</span>
          <h2 className="whats-new-title">{t('whatsNewTitle')}</h2>
        </div>
        <div className="whats-new-list">
          {FEATURES.map((f) => (
            <div key={f.id} className="whats-new-item">
              <div className="whats-new-item-icon">{f.icon}</div>
              <div className="whats-new-item-body">
                <div className="whats-new-item-meta">
                  <span className="whats-new-item-title">{t(`feature.${f.id}.title`)}</span>
                  <span className="whats-new-item-date">{formatDate(f.date, locale)}</span>
                </div>
                <p className="whats-new-item-desc">{t(`feature.${f.id}.description`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { FEATURES, STORAGE_KEY }
export default WhatsNewModal
