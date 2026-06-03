import ShareMenu from './ShareMenu.tsx'

interface AboutModalProps {
  onClose: () => void
  t: (_key: string) => string
  share: (_platform: string) => void
  shareOptions: { id: string; label: string; icon: string }[]
}

function AboutModal({ onClose, t, share, shareOptions }: AboutModalProps) {
  const overlayClass =
    'fixed top-0 left-0 right-0 bottom-0 bg-overlay-bg flex items-center justify-center z-[1000] p-4 backdrop-blur-[6px]'
  const modalClass =
    'bg-modal-bg border border-border-color rounded-xl max-w-[580px] w-full max-h-[85vh] min-[601px]:max-h-[82vh] overflow-y-auto relative p-6 pt-12 min-[601px]:p-8 animate-modal-fade-in shadow-xl mx-4 min-[601px]:mx-0'
  const closeBtnClass =
    'absolute top-[0.875rem] right-[0.875rem] w-7 h-7 rounded-full bg-bg-tertiary border border-border-color text-text-muted text-[1.25rem] min-[601px]:text-base cursor-pointer flex items-center justify-center transition-[background,color] duration-fast hover:bg-bg-quaternary hover:text-text-primary'

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <button className={closeBtnClass} onClick={onClose} aria-label={t('closeAriaLabel')}>
          ×
        </button>
        <div>
          <h2 className="text-text-primary text-[1.25rem] min-[601px]:text-xl font-bold mb-4 min-[601px]:mb-5 text-center tracking-[-0.02em]">
            {t('aboutTitle')}
          </h2>
          <p className="text-text-secondary text-[0.9rem] min-[601px]:text-base leading-[1.5] min-[601px]:leading-[1.65] mb-4 text-justify min-[601px]:text-left">
            {t('aboutParagraph1')}
          </p>
          <p className="text-text-secondary text-[0.9rem] min-[601px]:text-base leading-[1.5] min-[601px]:leading-[1.65] mb-4 text-justify min-[601px]:text-left">
            {t('aboutParagraph2')}
          </p>
          <p className="text-text-secondary text-[0.9rem] min-[601px]:text-base leading-[1.5] min-[601px]:leading-[1.65] mb-4 text-justify min-[601px]:text-left">
            {t('aboutParagraph2b')}
          </p>
          <p className="text-text-secondary text-[0.9rem] min-[601px]:text-base leading-[1.5] min-[601px]:leading-[1.65] mb-4 text-justify min-[601px]:text-left">
            {t('aboutParagraph3')}
          </p>
          <p className="text-text-secondary text-[0.9rem] min-[601px]:text-base leading-[1.5] min-[601px]:leading-[1.65] mb-4 text-justify min-[601px]:text-left">
            {t('aboutParagraph4a')}{' '}
            <a
              href="https://link.mercadopago.cl/mialbumfifa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff5e5b] font-semibold underline underline-offset-[2px] transition-[color] duration-[0.3s] hover:text-[#ff7a77] hover:[text-decoration-color:#ff7a77]"
            >
              {t('aboutParagraph4b')}
            </a>
            {'. '}
          </p>
          <p className="text-text-secondary text-[0.9rem] min-[601px]:text-base leading-[1.5] min-[601px]:leading-[1.65] mb-4 text-justify min-[601px]:text-left">
            {t('aboutParagraph4d')}
          </p>

          <div className="mt-5 px-[1.125rem] py-4 bg-bg-tertiary border border-border-color rounded-lg">
            <div className="flex items-center gap-[0.625rem] mb-[0.625rem]">
              <span className="text-xs font-semibold text-accent-blue bg-accent-blue-subtle border border-accent-blue-border rounded-full px-[0.6rem] py-[0.15rem] whitespace-nowrap">
                {t('aboutOpenSourceBadge')}
              </span>
              <h3 className="text-sm font-bold text-text-primary m-0">
                {t('aboutOpenSourceTitle')}
              </h3>
            </div>
            <p className="text-sm text-text-secondary leading-[1.6] mb-[0.875rem]">
              {t('aboutOpenSourceDesc')}
            </p>
            <div className="flex items-center justify-between gap-3 mb-[0.875rem] px-3 py-[0.625rem] bg-bg-secondary border border-border-color rounded-md">
              <span className="text-sm text-text-secondary leading-[1.5] flex-1">
                {t('aboutShareText')}
              </span>
              <ShareMenu t={t} share={share} shareOptions={shareOptions} />
            </div>
            <div className="flex items-center gap-2 flex-wrap mb-[0.875rem]">
              <span className="text-xs text-text-muted font-medium">{t('aboutBuiltWith')}</span>
              <div className="flex gap-[0.35rem] flex-wrap">
                {['React', 'Vite', 'Supabase', 'Tailwind CSS'].map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-semibold text-text-secondary bg-bg-quaternary border border-border-color rounded-sm px-2 py-[0.15rem] font-['SF_Mono','Fira_Code',monospace] tracking-[0.01em]"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <a
                href="https://github.com/studio84dev/mi-album-fifa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-[0.375rem] text-xs font-semibold text-text-secondary bg-bg-secondary border border-border-color rounded-full px-3 py-[0.3rem] no-underline cursor-pointer transition-[color,border-color,background] duration-fast font-[inherit] hover:text-[#f59e0b] hover:border-[rgba(245,158,11,0.4)] hover:bg-[rgba(245,158,11,0.08)]"
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
                className="inline-flex items-center gap-[0.375rem] text-xs font-semibold text-text-secondary bg-bg-secondary border border-border-color rounded-full px-3 py-[0.3rem] no-underline cursor-pointer transition-[color,border-color,background] duration-fast font-[inherit] hover:text-text-primary hover:border-border-strong hover:bg-bg-tertiary"
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
                className="inline-flex items-center gap-[0.375rem] text-xs font-semibold text-text-secondary bg-bg-secondary border border-border-color rounded-full px-3 py-[0.3rem] no-underline cursor-pointer transition-[color,border-color,background] duration-fast font-[inherit] hover:text-text-primary hover:border-border-strong hover:bg-bg-tertiary"
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
            <p className="mt-3 text-[0.7rem] text-text-disabled tracking-[0.02em]">
              Open source · MIT License
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutModal
