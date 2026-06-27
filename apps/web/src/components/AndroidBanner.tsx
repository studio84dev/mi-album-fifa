import { useState } from 'react'
import AndroidInstallModal from './AndroidInstallModal.tsx'

interface AndroidBannerProps {
  onDismiss: () => void
  t: (_key: string) => string
}

function AndroidBanner({ onDismiss, t }: AndroidBannerProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="w-full bg-[#dcfce7] border border-[#86efac] rounded-lg px-4 py-2.5 mb-3 flex items-center justify-between gap-4 text-sm text-[#166534] animate-fade-in-up">
        <span className="flex-1 leading-snug">{t('androidBannerText')}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#166534] hover:bg-[#14532d] text-white text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer whitespace-nowrap transition-colors duration-fast border-none font-[inherit]"
          >
            {t('androidBannerCta')}
          </button>
          <button
            onClick={onDismiss}
            className="text-[#166534] hover:text-[#14532d] text-base leading-none bg-transparent border-none cursor-pointer font-[inherit] opacity-70 hover:opacity-100"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      </div>

      {showModal && <AndroidInstallModal onClose={() => setShowModal(false)} t={t} />}
    </>
  )
}

export default AndroidBanner
