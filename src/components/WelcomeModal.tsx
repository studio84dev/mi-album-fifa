interface WelcomeModalProps {
  onClose: () => void
  t: (_key: string) => string
}

function WelcomeModal({ onClose, t }: WelcomeModalProps) {
  return (
    <div className="welcome-modal-overlay" onClick={onClose}>
      <div className="welcome-modal" onClick={(e) => e.stopPropagation()}>
        <button className="welcome-modal-close" onClick={onClose} aria-label={t('closeAriaLabel')}>
          ×
        </button>
        <div className="welcome-modal-icon">🎉</div>
        <h2 className="welcome-modal-title">{t('welcomeTitle')}</h2>
        <p className="welcome-modal-body">
          {t('welcomeBody1')} <strong>{t('welcomeBody1b')}</strong>, {t('welcomeBody2')}
        </p>
        <p className="welcome-modal-body">{t('welcomeBody3')} 😄</p>
        <button className="welcome-modal-cta" onClick={onClose}>
          {t('welcomeCta')}
        </button>
      </div>
    </div>
  )
}

export default WelcomeModal
