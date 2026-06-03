import { useState } from 'react'
import { useI18n } from '../hooks/useI18n.ts'
import { invokeFunction } from '../lib/supabaseClient.ts'

interface SuggestionModalProps {
  onClose: () => void
}

function SuggestionModal({ onClose }: SuggestionModalProps) {
  const { t } = useI18n()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoursRemaining, setHoursRemaining] = useState<number | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setHoursRemaining(null)

    try {
      const response = await invokeFunction('submit-suggestion', formData)

      const data = await response.json()

      if (response.status === 429) {
        setHoursRemaining(data.hoursRemaining)
        setError('rateLimit')
      } else if (!response.ok) {
        setError(data.error || 'unknown')
      } else {
        setSuccess(true)
        setFormData({ name: '', email: '', message: '' })
      }
    } catch (_err) {
      setError('unknown')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', email: '', message: '' })
    setSuccess(false)
    setError(null)
    setHoursRemaining(null)
    onClose()
  }

  const inputClass =
    'px-[0.875rem] py-[0.65rem] border border-border-color rounded-md bg-input-bg text-text-primary text-base transition-[border-color,box-shadow] duration-base font-[inherit] caret-accent-blue placeholder:text-text-muted focus:outline-none focus:border-accent-blue-border focus:shadow-[0_0_0_3px_var(--accent-blue-subtle)] focus:bg-bg-secondary disabled:opacity-60 disabled:cursor-not-allowed'

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-overlay-bg flex items-center justify-center z-[1000] p-4 backdrop-blur-[6px]"
      onClick={handleClose}
    >
      <div
        className="bg-modal-bg border border-border-color rounded-xl max-w-[600px] w-full max-h-[80vh] overflow-y-auto relative px-6 pt-12 pb-6 min-[601px]:px-7 min-[601px]:pt-8 min-[601px]:pb-7 animate-modal-fade-in shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-[0.875rem] right-[0.875rem] w-7 h-7 rounded-full bg-bg-tertiary border border-border-color text-text-muted text-base cursor-pointer flex items-center justify-center transition-[background,color] duration-fast hover:bg-bg-quaternary hover:text-text-primary"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>

        <div>
          <h2 className="text-text-primary text-xl font-bold mb-5 text-center tracking-[-0.02em]">
            {t('suggestionTitle')}
          </h2>

          {success ? (
            <div className="text-center px-4 py-8">
              <div className="text-[3rem] mb-4">✅</div>
              <p className="text-text-secondary text-base mb-6">{t('suggestionSent')}</p>
              <button
                className="px-6 py-3 bg-accent-orange border-none rounded-full text-white font-semibold text-base cursor-pointer transition-[background] duration-base mt-2 font-[inherit] hover:enabled:bg-accent-orange-hover active:enabled:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleClose}
              >
                {t('closeButton')}
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-[0.9rem] font-medium" htmlFor="name">
                  {t('nameLabel')}
                </label>
                <input
                  className={inputClass}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={50}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-[0.9rem] font-medium" htmlFor="email">
                  {t('emailLabel')}
                </label>
                <input
                  className={inputClass}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  maxLength={50}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-text-primary text-[0.9rem] font-medium" htmlFor="message">
                  {t('messageLabel')}
                </label>
                <textarea
                  className={`${inputClass} resize-y min-h-[100px]`}
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={5}
                  maxLength={250}
                />
                <small className="text-text-muted text-[0.8rem] text-right">
                  {formData.message.length}/{250}
                </small>
              </div>

              {error === 'rateLimit' && hoursRemaining && (
                <div className="px-4 py-3 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded-md text-[#ffc107] text-sm">
                  <p className="m-0">{t('rateLimitMessage')}</p>
                  <p className="mt-2 font-semibold m-0">
                    {t('hoursRemaining').replace('{hours}', String(hoursRemaining))}
                  </p>
                </div>
              )}

              {error && error !== 'rateLimit' && (
                <div className="px-4 py-3 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-md text-[#fca5a5] text-sm">
                  {t('suggestionError')}
                </div>
              )}

              <button
                type="submit"
                className="px-6 py-3 bg-accent-orange border-none rounded-full text-white font-semibold text-base cursor-pointer transition-[background] duration-base mt-2 font-[inherit] hover:enabled:bg-accent-orange-hover active:enabled:opacity-85 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !!(error === 'rateLimit' && hoursRemaining)}
              >
                {loading ? t('sending') : t('sendButton')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SuggestionModal
