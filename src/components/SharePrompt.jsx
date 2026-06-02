const STORAGE_KEY = 'share-prompt-shown'

function SharePrompt({ t, share, onDismiss }) {
  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    onDismiss()
  }

  const handleShare = (platform) => {
    share(platform)
  }

  return (
    <div className="share-prompt">
      <button
        className="share-prompt-close"
        onClick={handleDismiss}
        aria-label={t('sharePromptDismiss')}
      >
        ×
      </button>
      <p className="share-prompt-title">{t('sharePromptTitle')}</p>
      <p className="share-prompt-body">{t('sharePromptBody')}</p>
      <div className="share-prompt-buttons">
        <button
          className="share-prompt-btn share-prompt-btn--whatsapp"
          onClick={() => handleShare('whatsapp')}
        >
          WhatsApp
        </button>
        <button
          className="share-prompt-btn share-prompt-btn--facebook"
          onClick={() => handleShare('facebook')}
        >
          Facebook
        </button>
        <button className="share-prompt-btn share-prompt-btn--x" onClick={() => handleShare('x')}>
          X
        </button>
        <button
          className="share-prompt-btn share-prompt-btn--linkedin"
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
