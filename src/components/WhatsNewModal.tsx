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
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-overlay-bg flex items-center justify-center z-[1000] p-4 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="bg-modal-bg border border-border-color rounded-xl max-w-[500px] w-full max-h-[82vh] overflow-hidden relative p-8 pb-0 animate-modal-fade-in shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-[0.875rem] right-[0.875rem] w-7 h-7 rounded-full bg-bg-tertiary border border-border-color text-text-muted text-base cursor-pointer flex items-center justify-center transition-[background,color] duration-fast hover:bg-bg-quaternary hover:text-text-primary"
          onClick={onClose}
          aria-label={t('whatsNewCloseAriaLabel')}
        >
          ×
        </button>
        <div className="flex items-center gap-2 mb-5 flex-shrink-0">
          <span className="text-[1.2rem]">✨</span>
          <h2 className="text-xl font-bold text-text-primary m-0 tracking-[-0.02em]">
            {t('whatsNewTitle')}
          </h2>
        </div>
        <div className="flex flex-col gap-3 overflow-y-auto pb-6 pr-[2px]">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className="flex gap-[0.875rem] px-4 py-[0.875rem] bg-bg-tertiary border border-border-color rounded-lg"
            >
              <div className="text-[1.25rem] flex-shrink-0 leading-none mt-[2px]">{f.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-2 mb-[0.3rem]">
                  <span className="text-sm font-semibold text-text-primary">
                    {t(`feature.${f.id}.title`)}
                  </span>
                  <span className="text-xs text-text-muted whitespace-nowrap flex-shrink-0">
                    {formatDate(f.date, locale)}
                  </span>
                </div>
                <p className="text-sm text-text-muted leading-[1.55] m-0">
                  {t(`feature.${f.id}.description`)}
                </p>
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
