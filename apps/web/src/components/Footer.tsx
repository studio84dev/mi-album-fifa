import ShareMenu from './ShareMenu.tsx'
import ThemeToggle from './ThemeToggle.tsx'
import CommunityStats from './CommunityStats.tsx'

interface FooterProps {
  t: (_key: string) => string
  locale: string
  toggleLocale: () => void
  onShowAbout: () => void
  onShowSuggestion: () => void
  share: (_platform: string) => void
  shareOptions: { id: string; label: string; icon: string }[]
  user: { id?: string } | null
  totalCollected: number
}
function Footer({
  t,
  locale,
  toggleLocale,
  onShowAbout,
  onShowSuggestion,
  share,
  shareOptions,
  user,
  totalCollected,
}: FooterProps) {
  const showKofi = user && totalCollected >= 20
  return (
    <footer className="mt-auto pt-10 pb-10 text-center text-text-muted text-sm w-full">
      {showKofi && (
        <div className="my-6 py-5 px-5 bg-bg-tertiary rounded-xl border border-border-color text-center">
          <p className="text-text-secondary text-base mb-2 leading-relaxed">{t('kofiMessage')}</p>
          <p className="text-text-muted text-sm mb-3.5 leading-relaxed">{t('kofiSubMessage')}</p>
          <a
            href="https://link.mercadopago.cl/mialbumfifa"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-[1.375rem] py-[0.6rem] bg-[#ff5e5b] text-white font-semibold text-sm no-underline rounded-full transition-[background] duration-base hover:bg-[#e54a48] active:opacity-85"
          >
            {t('kofiButton')}
          </a>
        </div>
      )}

      <div className="flex items-center justify-center flex-wrap gap-x-1 gap-y-1 mt-5 pt-5 border-t border-border-color">
        <button
          className="bg-transparent border-none text-text-muted text-xs cursor-pointer px-[0.4rem] py-[0.2rem] rounded-sm no-underline inline-flex items-center gap-[0.3rem] transition-[color] duration-base font-[inherit] hover:text-text-primary"
          onClick={onShowAbout}
        >
          {t('aboutButton')}
        </button>
        <span className="text-border-strong text-[0.75rem] leading-none">·</span>
        <button
          className="bg-transparent border-none text-text-muted text-xs cursor-pointer px-[0.4rem] py-[0.2rem] rounded-sm no-underline inline-flex items-center gap-[0.3rem] transition-[color] duration-base font-[inherit] hover:text-text-primary"
          onClick={onShowSuggestion}
        >
          {t('suggestionButton')}
        </button>
        <span className="text-border-strong text-[0.75rem] leading-none">·</span>
        <a
          href="https://github.com/studio84dev/mi-album-fifa"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-transparent border-none text-text-muted text-xs cursor-pointer px-[0.4rem] py-[0.2rem] rounded-sm no-underline inline-flex items-center gap-[0.3rem] transition-[color] duration-base hover:text-text-primary"
          aria-label="GitHub"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
      </div>

      <div className="flex items-center justify-center my-4">
        <ThemeToggle t={t} />
      </div>

      <div className="flex items-center justify-center gap-[0.4rem] mt-4">
        <span className="text-[0.75rem] text-text-muted">{t('langToggleLabel')}:</span>
        <button
          className={`border text-xs font-semibold px-[0.55rem] py-[0.2rem] rounded-sm cursor-pointer transition-[color,border-color,background] duration-base font-[inherit] tracking-[0.5px] ${locale === 'es' ? 'text-accent-blue border-accent-blue-border bg-accent-blue-subtle cursor-default' : 'bg-transparent border-border-color text-text-muted hover:text-text-primary hover:border-border-strong'}`}
          onClick={() => locale !== 'es' && toggleLocale()}
        >
          ES
        </button>
        <button
          className={`border text-xs font-semibold px-[0.55rem] py-[0.2rem] rounded-sm cursor-pointer transition-[color,border-color,background] duration-base font-[inherit] tracking-[0.5px] ${locale === 'en' ? 'text-accent-blue border-accent-blue-border bg-accent-blue-subtle cursor-default' : 'bg-transparent border-border-color text-text-muted hover:text-text-primary hover:border-border-strong'}`}
          onClick={() => locale !== 'en' && toggleLocale()}
        >
          EN
        </button>
      </div>

      <div className="flex justify-center mt-4">
        <ShareMenu t={t} share={share} shareOptions={shareOptions} />
      </div>

      <div className="flex justify-center mt-4">
        <CommunityStats t={t} />
      </div>

      <p className="mt-6 text-[0.7rem] text-text-muted text-center max-w-[480px] mx-auto leading-relaxed opacity-70">
        {t('footerDisclaimer')}
      </p>
    </footer>
  )
}

export default Footer
