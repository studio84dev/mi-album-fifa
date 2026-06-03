const STORAGE_KEY = 'share-prompt-shown'

interface SharePromptProps {
  t: (_key: string) => string
  share: (_platform: string) => void
  onDismiss: () => void
}

function SharePrompt({ t, share, onDismiss }: SharePromptProps) {
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    onDismiss()
  }

  const handleShare = (platform: string) => {
    share(platform)
  }

  return (
    <div className="relative w-full bg-bg-tertiary border border-border-color rounded-xl px-5 pt-[1.125rem] pb-4 mb-5 text-center animate-modal-fade-in">
      <button
        className="absolute top-2 right-[0.625rem] bg-bg-quaternary border-none rounded-full text-text-muted text-[1.25rem] cursor-pointer leading-none p-[0.375rem] w-7 h-7 flex items-center justify-center transition-[color,background-color] duration-fast hover:text-text-primary hover:bg-border-color"
        onClick={handleDismiss}
        aria-label={t('sharePromptDismiss')}
      >
        ×
      </button>
      <p className="text-base font-semibold text-text-primary mb-1.5">{t('sharePromptTitle')}</p>
      <p className="text-sm text-text-muted leading-relaxed mb-3.5">{t('sharePromptBody')}</p>
      <div className="flex justify-center gap-2 flex-wrap min-[601px]:gap-1.5">
        <button
          className="min-w-[6rem] px-[0.875rem] py-1.5 rounded-full border border-[rgba(37,211,102,0.3)] text-xs font-semibold cursor-pointer transition-[background,border-color] duration-fast text-[#25d366] bg-bg-secondary font-[inherit] hover:bg-[rgba(37,211,102,0.1)] hover:border-[#25d366] min-[601px]:min-w-[5rem] min-[601px]:px-[0.625rem]"
          onClick={() => handleShare('whatsapp')}
        >
          WhatsApp
        </button>
        <button
          className="min-w-[6rem] px-[0.875rem] py-1.5 rounded-full border border-[rgba(24,119,242,0.3)] text-xs font-semibold cursor-pointer transition-[background,border-color] duration-fast text-[#1877f2] bg-bg-secondary font-[inherit] hover:bg-[rgba(24,119,242,0.1)] hover:border-[#1877f2] min-[601px]:min-w-[5rem] min-[601px]:px-[0.625rem]"
          onClick={() => handleShare('facebook')}
        >
          Facebook
        </button>
        <button
          className="min-w-[6rem] px-[0.875rem] py-1.5 rounded-full border border-border-color text-xs font-semibold cursor-pointer transition-[background,border-color] duration-fast text-x-color bg-bg-secondary font-[inherit] hover:bg-bg-quaternary min-[601px]:min-w-[5rem] min-[601px]:px-[0.625rem]"
          onClick={() => handleShare('x')}
        >
          X
        </button>
        <button
          className="min-w-[6rem] px-[0.875rem] py-1.5 rounded-full border border-[rgba(10,102,194,0.3)] text-xs font-semibold cursor-pointer transition-[background,border-color] duration-fast text-[#0a66c2] bg-bg-secondary font-[inherit] hover:bg-[rgba(10,102,194,0.1)] hover:border-[#0a66c2] min-[601px]:min-w-[5rem] min-[601px]:px-[0.625rem]"
          onClick={() => handleShare('linkedin')}
        >
          LinkedIn
        </button>
      </div>
    </div>
  )
}

export { STORAGE_KEY }
export default SharePrompt
