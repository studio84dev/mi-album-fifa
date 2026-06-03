interface RedirectBannerProps {
  onDismiss: () => void
  t: (_key: string) => string
}

function RedirectBanner({ onDismiss, t }: RedirectBannerProps) {
  return (
    <div className="w-full bg-accent-blue-subtle border border-accent-blue-border rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between gap-4 text-sm text-accent-blue animate-fade-in-up">
      <span>
        {t('redirectBanner')}{' '}
        <strong>
          <a
            href="https://mialbumfifa.com"
            className="text-accent-blue font-semibold underline underline-offset-2"
          >
            mialbumfifa.com
          </a>
        </strong>
      </span>
      <button
        className="bg-transparent border border-accent-blue-border text-accent-blue text-xs px-2.5 py-1 rounded-sm cursor-pointer whitespace-nowrap transition-[background] duration-fast flex-shrink-0 font-[inherit] hover:bg-accent-blue-subtle"
        onClick={onDismiss}
      >
        {t('redirectBannerDismiss')} ×
      </button>
    </div>
  )
}

export default RedirectBanner
