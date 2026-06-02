interface WelcomeModalProps {
  onClose: () => void
  t: (_key: string) => string
}

function WelcomeModal({ onClose, t }: WelcomeModalProps) {
  return (
    <div
      className="fixed inset-0 bg-overlay-bg backdrop-blur-[6px] z-[2000] flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative bg-modal-bg rounded-xl px-7 pt-8 pb-7 max-w-[420px] w-full text-center border border-border-color shadow-xl animate-modal-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-bg-tertiary border border-border-color text-text-muted text-base cursor-pointer flex items-center justify-center transition-[color,background] duration-fast hover:text-text-primary hover:bg-bg-quaternary"
          onClick={onClose}
          aria-label={t('closeAriaLabel')}
        >
          ×
        </button>
        <div className="text-[2rem] mb-3">🎉</div>
        <h2 className="text-xl font-bold text-text-primary m-0 mb-3 tracking-[-0.02em]">
          {t('welcomeTitle')}
        </h2>
        <p className="text-sm text-text-secondary leading-[1.6] m-0 mb-3 [&>strong]:text-text-primary">
          {t('welcomeBody1')} <strong>{t('welcomeBody1b')}</strong>, {t('welcomeBody2')}
        </p>
        <p className="text-sm text-text-secondary leading-[1.6] m-0 mb-3">{t('welcomeBody3')} 😄</p>
        <button
          className="inline-block mt-2 bg-accent-orange text-white border-none rounded-md px-6 py-[0.65rem] text-sm font-semibold cursor-pointer transition-[background] duration-base font-[inherit] hover:bg-accent-orange-hover"
          onClick={onClose}
        >
          {t('welcomeCta')}
        </button>
      </div>
    </div>
  )
}

export default WelcomeModal
