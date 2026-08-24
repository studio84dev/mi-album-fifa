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
  const [previewCount, setPreviewCount] = useState<number | null>(null)

  const loading = loadingPhase !== null

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setErrorState(null)
    setLoadingPhase('preview')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-collection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session!.access_token}`,
          },
          body: JSON.stringify({ sourceEmail: email.trim().toLowerCase(), preview: true }),
        }
      )
      const data = await res.json()

      if (!res.ok) {
        setErrorState({ message: data.error || t('importError') })
        setLoadingPhase(null)
        return
      }

      setPreviewCount(data.count)
      setStep(2)
    } catch {
      setErrorState({ message: t('importError') })
    } finally {
      setLoadingPhase(null)
    }
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

  const inputClass =
    'w-full px-[0.875rem] py-[0.65rem] rounded-md border border-border-color bg-input-bg text-text-primary text-base outline-none transition-[border-color,box-shadow] duration-base box-border caret-accent-blue font-[inherit] placeholder:text-text-muted focus:border-accent-blue-border focus:shadow-[0_0_0_3px_var(--accent-blue-subtle)]'
  const bodyClass = 'flex flex-col items-center gap-[0.875rem] py-2 px-0'
  const iconClass = 'text-[2rem] leading-none'
  const titleClass = 'text-xl font-bold text-text-primary text-center m-0 tracking-[-0.02em]'
  const descClass = 'text-sm text-text-muted text-center m-0 leading-[1.55]'
  const btnPrimaryClass =
    'w-full py-[0.65rem] rounded-md border-none bg-accent-orange text-white text-base font-semibold cursor-pointer transition-[background] duration-base font-[inherit] hover:enabled:bg-accent-orange-hover disabled:opacity-50 disabled:cursor-not-allowed'
  const btnDestructiveClass =
    'w-full py-[0.65rem] rounded-md border-none bg-[rgba(239,68,68,0.85)] text-white text-base font-semibold cursor-pointer transition-[background] duration-base font-[inherit] hover:enabled:bg-[rgba(239,68,68,1)] disabled:opacity-50 disabled:cursor-not-allowed'
  const btnCancelClass =
    'bg-none border-none text-text-muted text-sm cursor-pointer py-1 transition-[color] duration-fast font-[inherit] hover:text-text-primary'

  return (
    <div
      className="fixed top-0 left-0 right-0 bottom-0 bg-overlay-bg flex items-center justify-center z-[1000] p-4 backdrop-blur-[6px]"
      onClick={onClose}
    >
      <div
        className="bg-modal-bg border border-border-color rounded-xl max-w-[420px] w-full max-h-[80vh] overflow-y-auto relative p-8 animate-modal-fade-in shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-[0.875rem] right-[0.875rem] w-7 h-7 rounded-full bg-bg-tertiary border border-border-color text-text-muted text-base cursor-pointer flex items-center justify-center transition-[background,color] duration-fast hover:bg-bg-quaternary hover:text-text-primary"
          onClick={onClose}
          aria-label={t('importCloseAriaLabel')}
        >
          ×
        </button>

        {step === 1 && loading && (
          <div className={bodyClass}>
            <div className="w-9 h-9 border-[2.5px] border-border-color border-t-accent-blue rounded-full animate-spin flex-shrink-0" />
            <p className="text-sm text-text-muted text-center m-0">{email}</p>
          </div>
        )}

        {step === 1 && !loading && (
          <form className={bodyClass} onSubmit={handleCheckEmail}>
            <div className={iconClass}>📥</div>
            <h2 className={titleClass}>{t('importTitle')}</h2>
            <p className={descClass}>{t('importDesc')}</p>
            <label
              className="text-sm text-text-secondary self-start font-medium"
              htmlFor="import-email"
            >
              {t('importEmailLabel')}
            </label>
            <input
              id="import-email"
              type="email"
              className={inputClass}
              placeholder={t('importEmailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
            {errorState?.message && (
              <p className="w-full px-3 py-2 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-md text-[#fca5a5] text-sm m-0 text-center">
                {errorState.message}
              </p>
            )}
            <button type="submit" className={btnPrimaryClass} disabled={!email.trim()}>
              {t('importContinue')}
            </button>
            <button type="button" className={btnCancelClass} onClick={onClose}>
              {t('importCancel')}
            </button>
          </form>
        )}

        {step === 2 && !loading && !errorState && (
          <form className={bodyClass} onSubmit={handleImport}>
            <div className={iconClass}>⚠️</div>
            <h2 className={titleClass}>{t('importWarningTitle')}</h2>
            <div className="w-full bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-md px-[0.875rem] py-3 text-sm text-[#ef4444] leading-[1.55]">
              <p className="m-0">{t('importWarningLine1')}</p>
              <ul className="mt-[0.375rem] mb-[0.375rem] ml-[1.2rem] p-0 list-disc">
                <li className="mb-[0.2rem]">{t('importWarningBullet1')}</li>
                <li className="mb-[0.2rem]">{t('importWarningBullet2')}</li>
              </ul>
              <p className="mt-2 text-text-secondary text-sm m-0">
                {t('importWarningSource')} <strong>{email}</strong>
              </p>
              {previewCount !== null && (
                <p className="mt-1 text-accent-blue text-sm font-semibold m-0">
                  {t('importQrStickerCount').replace('{count}', String(previewCount))}
                </p>
              )}
            </div>
            <p className="text-sm text-text-secondary self-start m-0">
              {t('importConfirmInstruction')} <strong>{CONFIRM_WORD}</strong>:
            </p>
            <input
              type="text"
              className={`${inputClass} ${confirmText === CONFIRM_WORD ? 'border-[#22c55e] shadow-[0_0_0_3px_rgba(34,197,94,0.12)]' : ''}`}
              placeholder={CONFIRM_WORD}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              autoFocus
            />
            <button
              type="submit"
              className={btnDestructiveClass}
              disabled={confirmText !== CONFIRM_WORD}
            >
              {t('importConfirmBtn')}
            </button>
            <button
              type="button"
              className={btnCancelClass}
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
          <div className={bodyClass}>
            <div className="w-9 h-9 border-[2.5px] border-border-color border-t-accent-blue rounded-full animate-spin flex-shrink-0" />
            <p className="text-base font-semibold text-text-primary text-center m-0">
              {loadingPhase === 'backup' ? t('importPhaseBackup') : t('importPhaseImporting')}
            </p>
            {loadingPhase === 'backup' && (
              <p className="text-sm text-text-muted text-center m-0 leading-[1.5]">
                {t('importPhaseBackupSub')}
              </p>
            )}
          </div>
        )}

        {step === 2 && !loading && errorState && (
          <div className={bodyClass}>
            {errorState.isImportFail ? (
              <>
                <div className={iconClass}>{errorState.restored ? '🛡️' : '⚠️'}</div>
                <h2 className={titleClass}>
                  {errorState.restored
                    ? t('importErrorRestoredTitle')
                    : t('importErrorNotRestoredTitle')}
                </h2>
                <p className={descClass}>
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
                <div className={iconClass}>❌</div>
                <h2 className={titleClass}>{t('importErrorGenericTitle')}</h2>
                <p className={descClass}>{errorState.message}</p>
              </>
            )}
            <button
              className={btnPrimaryClass}
              onClick={() => {
                setErrorState(null)
                setConfirmText('')
              }}
            >
              {t('importTryAgain')}
            </button>
            <button type="button" className={btnCancelClass} onClick={onClose}>
              {t('importCancel')}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className={bodyClass}>
            <div className={iconClass}>✅</div>
            <h2 className={titleClass}>{t('importSuccessTitle')}</h2>
            <p className={descClass}>
              {t('importSuccessDesc').replace('{count}', String(importedCount))}
            </p>
            <button className={btnPrimaryClass} onClick={handleDone}>
              {t('importSuccessBtn')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportCollectionModal
