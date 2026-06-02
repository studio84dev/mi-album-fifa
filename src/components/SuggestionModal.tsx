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

  return (
    <div className="about-modal-overlay" onClick={handleClose}>
      <div className="about-modal suggestion-modal" onClick={(e) => e.stopPropagation()}>
        <button className="about-close-btn" onClick={handleClose} aria-label="Close">
          ×
        </button>

        <div className="about-content">
          <h2>{t('suggestionTitle')}</h2>

          {success ? (
            <div className="success-message">
              <div className="success-icon">✅</div>
              <p>{t('suggestionSent')}</p>
              <button className="submit-btn" onClick={handleClose}>
                {t('closeButton')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">{t('nameLabel')}</label>
                <input
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

              <div className="form-group">
                <label htmlFor="email">{t('emailLabel')}</label>
                <input
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

              <div className="form-group">
                <label htmlFor="message">{t('messageLabel')}</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  rows={5}
                  maxLength={250}
                />
                <small className="char-count">
                  {formData.message.length}/{250}
                </small>
              </div>

              {error === 'rateLimit' && hoursRemaining && (
                <div className="error-message rate-limit">
                  <p>{t('rateLimitMessage')}</p>
                  <p className="hours-remaining">
                    {t('hoursRemaining').replace('{hours}', String(hoursRemaining))}
                  </p>
                </div>
              )}

              {error && error !== 'rateLimit' && (
                <div className="error-message">{t('suggestionError')}</div>
              )}

              <button
                type="submit"
                className="submit-btn"
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
