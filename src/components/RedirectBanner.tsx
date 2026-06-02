interface RedirectBannerProps {
  onDismiss: () => void
  t: (_key: string) => string
}

function RedirectBanner({ onDismiss, t }: RedirectBannerProps) {
  return (
    <div className="redirect-banner">
      <span>
        {t('redirectBanner')}{' '}
        <strong>
          <a href="https://mialbumfifa.com" className="redirect-banner-link">
            mialbumfifa.com
          </a>
        </strong>
      </span>
      <button className="redirect-banner-dismiss" onClick={onDismiss}>
        {t('redirectBannerDismiss')} ×
      </button>
    </div>
  )
}

export default RedirectBanner
