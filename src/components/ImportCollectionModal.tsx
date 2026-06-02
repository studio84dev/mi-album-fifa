import { useState } from 'react'
import { supabase } from '../lib/supabaseClient.ts'

const CONFIRM_WORD = 'IMPORTAR'

interface ImportCollectionModalProps {
  onClose: () => void
  onSuccess?: () => void
  t: (_key: string) => string
}

function ImportCollectionModal({ onClose, onSuccess, t }: ImportCollectionModalProps) {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null) // null | 'backup' | 'importing'
  const [errorState, setErrorState] = useState<{
    message?: string
    restored?: boolean
    backupCount?: number
    isImportFail?: boolean
  } | null>(null) // null | { restored, backupCount }
  const [importedCount, setImportedCount] = useState(0)

  const loading = loadingPhase !== null

  const handleCheckEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setErrorState(null)
    setStep(2)
  }

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    if (confirmText !== CONFIRM_WORD) return
    setErrorState(null)
    setLoadingPhase('backup')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      // Small delay so user sees the "backing up" message
      await new Promise((r) => setTimeout(r, 600))
      setLoadingPhase('importing')

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-collection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session!.access_token}`,
          },
          body: JSON.stringify({ sourceEmail: email.trim().toLowerCase() }),
        }
      )
      const data = await res.json()

      if (!res.ok) {
        setErrorState({
          message: data.error === 'import_failed' ? null : data.error || t('importError'),
          restored: data.restored ?? false,
          backupCount: data.backupCount ?? 0,
          isImportFail: data.error === 'import_failed',
        })
        setLoadingPhase(null)
        return
      }
      setImportedCount(data.imported)
      setStep(3)
    } catch {
      setErrorState({
        message: t('importError'),
        restored: false,
        backupCount: 0,
        isImportFail: false,
      })
    } finally {
      setLoadingPhase(null)
    }
  }

  const handleDone = () => {
    onSuccess?.()
    onClose()
  }

  return (
    <div className="about-modal-overlay" onClick={onClose}>
      <div className="about-modal import-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="about-close-btn"
          onClick={onClose}
          aria-label={t('importCloseAriaLabel')}
        >
          ×
        </button>

        {step === 1 && (
          <form className="import-modal-body" onSubmit={handleCheckEmail}>
            <div className="import-modal-icon">📥</div>
            <h2 className="import-modal-title">{t('importTitle')}</h2>
            <p className="import-modal-desc">{t('importDesc')}</p>
            <label className="import-label" htmlFor="import-email">
              {t('importEmailLabel')}
            </label>
            <input
              id="import-email"
              type="email"
              className="import-input"
              placeholder={t('importEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {errorState?.message && <p className="import-error">{errorState.message}</p>}
            <button type="submit" className="import-btn-primary" disabled={!email.trim()}>
              {t('importContinue')}
            </button>
            <button type="button" className="import-btn-cancel" onClick={onClose}>
              {t('importCancel')}
            </button>
          </form>
        )}

        {step === 2 && !loading && !errorState && (
          <form className="import-modal-body" onSubmit={handleImport}>
            <div className="import-modal-icon">⚠️</div>
            <h2 className="import-modal-title">{t('importWarningTitle')}</h2>
            <div className="import-warning-box">
              <p>{t('importWarningLine1')}</p>
              <ul className="import-warning-list">
                <li>{t('importWarningBullet1')}</li>
                <li>{t('importWarningBullet2')}</li>
              </ul>
              <p className="import-warning-source">
                {t('importWarningSource')} <strong>{email}</strong>
              </p>
            </div>
            <p className="import-confirm-instruction">
              {t('importConfirmInstruction')} <strong>{CONFIRM_WORD}</strong>:
            </p>
            <input
              type="text"
              className={`import-input import-confirm-input ${confirmText === CONFIRM_WORD ? 'valid' : ''}`}
              placeholder={CONFIRM_WORD}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              autoFocus
            />
            <button
              type="submit"
              className="import-btn-destructive"
              disabled={confirmText !== CONFIRM_WORD}
            >
              {t('importConfirmBtn')}
            </button>
            <button
              type="button"
              className="import-btn-cancel"
              onClick={() => {
                setStep(1)
                setConfirmText('')
                setErrorState(null)
              }}
            >
              {t('importBack')}
            </button>
          </form>
        )}

        {step === 2 && loading && (
          <div className="import-modal-body">
            <div className="import-loading-spinner" />
            <p className="import-loading-phase">
              {loadingPhase === 'backup' ? t('importPhaseBackup') : t('importPhaseImporting')}
            </p>
            {loadingPhase === 'backup' && (
              <p className="import-loading-sub">{t('importPhaseBackupSub')}</p>
            )}
          </div>
        )}

        {step === 2 && !loading && errorState && (
          <div className="import-modal-body">
            {errorState.isImportFail ? (
              <>
                <div className="import-modal-icon">{errorState.restored ? '🛡️' : '⚠️'}</div>
                <h2 className="import-modal-title">
                  {errorState.restored
                    ? t('importErrorRestoredTitle')
                    : t('importErrorNotRestoredTitle')}
                </h2>
                <p className="import-modal-desc">
                  {errorState.restored
                    ? t('importErrorRestoredDesc').replace(
                        '{count}',
                        String(errorState.backupCount ?? 0)
                      )
                    : t('importErrorNotRestoredDesc')}
                </p>
              </>
            ) : (
              <>
                <div className="import-modal-icon">❌</div>
                <h2 className="import-modal-title">{t('importErrorGenericTitle')}</h2>
                <p className="import-modal-desc">{errorState.message}</p>
              </>
            )}
            <button
              className="import-btn-primary"
              onClick={() => {
                setErrorState(null)
                setConfirmText('')
              }}
            >
              {t('importTryAgain')}
            </button>
            <button type="button" className="import-btn-cancel" onClick={onClose}>
              {t('importCancel')}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="import-modal-body">
            <div className="import-modal-icon">✅</div>
            <h2 className="import-modal-title">{t('importSuccessTitle')}</h2>
            <p className="import-modal-desc">
              {t('importSuccessDesc').replace('{count}', String(importedCount))}
            </p>
            <button className="import-btn-primary" onClick={handleDone}>
              {t('importSuccessBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportCollectionModal
