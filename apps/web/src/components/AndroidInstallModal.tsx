interface AndroidInstallModalProps {
  onClose: () => void
  t: (_key: string) => string
}

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.studio84.mialbumfifa'

function AndroidInstallModal({ onClose, t }: AndroidInstallModalProps) {
  const overlayClass =
    'fixed top-0 left-0 right-0 bottom-0 bg-overlay-bg flex items-center justify-center z-[1000] p-4 backdrop-blur-[6px]'
  const modalClass =
    'bg-modal-bg border border-border-color rounded-xl max-w-[420px] w-full max-h-[85vh] min-[601px]:max-h-[82vh] overflow-y-auto relative p-6 pt-12 animate-modal-fade-in shadow-xl mx-4 min-[601px]:mx-0'
  const closeBtnClass =
    'absolute top-[0.875rem] right-[0.875rem] w-7 h-7 rounded-full bg-bg-tertiary border border-border-color text-text-muted text-[1.25rem] min-[601px]:text-base cursor-pointer flex items-center justify-center transition-[background,color] duration-fast hover:bg-bg-quaternary hover:text-text-primary'

  return (
    <div className={overlayClass} onClick={onClose}>
      <div className={modalClass} onClick={(e) => e.stopPropagation()}>
        <button className={closeBtnClass} onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <h2 className="text-text-primary text-[1.1rem] font-bold mb-3 text-center tracking-[-0.02em]">
          {t('androidModalTitle')}
        </h2>

        <p className="text-text-secondary text-sm leading-relaxed mb-4">{t('androidModalBody')}</p>

        <a
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center bg-accent-blue hover:bg-accent-blue-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors duration-base mb-4"
        >
          {t('androidModalInstallBtn')}
        </a>

        <img
          src="/linktoplaystoreimage.jpg"
          alt="Instrucciones para llegar a la Play Store"
          className="w-full rounded-lg border border-border-color"
        />
      </div>
    </div>
  )
}

export default AndroidInstallModal
