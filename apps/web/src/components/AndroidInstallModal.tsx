import { useEffect, useRef } from 'react'
import AppPromoPreview from './app-promo/AppPromoPreview.tsx'
import { PromoIcon } from './app-promo/PromoIcon.tsx'
import appIcon from '../../public/favicon.png'
import './app-promo/appPromo.css'

interface AndroidInstallModalProps {
  onClose: () => void
  onInstall: () => void
  t: (_key: string) => string
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.studio84.mialbumfifa'

function AndroidInstallModal({ onClose, onInstall, t }: AndroidInstallModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    const previousOverflow = document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className="app-promo-modal"
      aria-labelledby="app-promo-title"
      aria-describedby="app-promo-description"
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="app-promo-layout">
        <button className="app-promo-close" onClick={onClose} aria-label={t('closeAriaLabel')}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M3 3 11 11M11 3 3 11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <div className="app-promo-copy">
          <div className="app-promo-eyebrow">
            <img src={appIcon} alt="" width="32" height="32" />
            {t('appPromoEyebrow')}
          </div>
          <h2 id="app-promo-title">{t('appPromoTitle')}</h2>
          <p id="app-promo-description">{t('appPromoBody')}</p>
          <ul className="app-promo-features">
            {['appPromoQr', 'appPromoExchange', 'appPromoConfirm', 'appPromoHistory'].map(
              (key, index) => (
                <li key={key}>
                  <span aria-hidden="true">
                    <PromoIcon
                      name={(['qr', 'swap', 'check', 'history'] as const)[index]}
                      size={16}
                    />
                  </span>
                  {t(key)}
                </li>
              )
            )}
          </ul>
          <span className="app-promo-free">{t('appPromoFree')}</span>
        </div>
        <div className="app-promo-preview">
          <AppPromoPreview t={t} />
        </div>
        <div className="app-promo-actions">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onInstall}
            onAuxClick={(event) => {
              if (event.button === 1) onInstall()
            }}
          >
            <svg aria-hidden="true" width="22" height="24" viewBox="0 0 22 24" fill="none">
              <path
                d="M2 2 20 12 2 22V2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="m2 2 12 14M2 22 14 10" stroke="currentColor" strokeWidth="1.3" />
            </svg>
            {t('appPromoInstall')}
            <span aria-hidden="true">↗</span>
          </a>
          <button onClick={onClose}>{t('appPromoLater')}</button>
          <p>{t('appPromoSync')}</p>
        </div>
      </div>
    </dialog>
  )
}

export default AndroidInstallModal
