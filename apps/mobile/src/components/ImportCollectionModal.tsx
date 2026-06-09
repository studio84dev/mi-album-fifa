import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import { supabase } from '../lib/supabaseClient'
import Svg, { Path } from 'react-native-svg'
import ScrollableModal from './ScrollableModal'

const CONFIRM_WORD = 'IMPORTAR'

const CheckIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2}>
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
)

const WarningIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2}>
    <Path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <Path d="M12 9v4" />
    <Path d="M12 17h.01" />
  </Svg>
)

interface ImportCollectionModalProps {
  visible: boolean
  onClose: () => void
  onSuccess?: () => void
  t: (_key: string) => string
}

export default function ImportCollectionModal({
  visible,
  onClose,
  onSuccess,
  t,
}: ImportCollectionModalProps) {
  const { theme } = useTheme()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [loadingPhase, setLoadingPhase] = useState<string | null>(null)
  const [errorState, setErrorState] = useState<{
    message?: string
    restored?: boolean
    backupCount?: number
    isImportFail?: boolean
  } | null>(null)
  const [importedCount, setImportedCount] = useState(0)

  const loading = loadingPhase !== null

  const handleCheckEmail = () => {
    if (!email.trim()) return
    setErrorState(null)
    setStep(2)
  }

  const handleImport = async () => {
    if (confirmText !== CONFIRM_WORD) return
    setErrorState(null)
    setLoadingPhase('backup')

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        setErrorState({ message: t('importError') })
        setLoadingPhase(null)
        return
      }

      await new Promise((r) => setTimeout(r, 600))
      setLoadingPhase('importing')

      const res = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/import-collection`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
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
    // Reset state
    setStep(1)
    setEmail('')
    setConfirmText('')
    setErrorState(null)
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      // Reset after animation
      setTimeout(() => {
        setStep(1)
        setEmail('')
        setConfirmText('')
        setErrorState(null)
      }, 300)
    }
  }

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.textPrimary,
    backgroundColor: theme.inputBg,
    width: '100%' as const,
  }

  return (
    <ScrollableModal
      visible={visible}
      onClose={handleClose}
      title={t('importTitle')}
      closeOnBackdrop={!loading}
    >
      {/* Step 1: Email input */}
      {step === 1 && !loading && !errorState && (
        <View style={{ gap: 16 }}>
          <Text
            style={{
              fontSize: 14,
              color: theme.textSecondary,
              lineHeight: 22,
            }}
          >
            {t('importDesc')}
          </Text>
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.textPrimary,
                marginBottom: 6,
              }}
            >
              {t('importEmailLabel')}
            </Text>
            <TextInput
              style={inputStyle}
              value={email}
              onChangeText={setEmail}
              placeholder={t('importEmailPlaceholder')}
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={handleClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.borderColor,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                {t('importCancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCheckEmail}
              disabled={!email.trim()}
              style={{
                flex: 1,
                backgroundColor: colors.accentBlue,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                opacity: !email.trim() ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t('importContinue')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && !loading && !errorState && (
        <View style={{ gap: 16 }}>
          <WarningIcon />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: theme.textPrimary,
              textAlign: 'center',
            }}
          >
            {t('importWarningTitle')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.textSecondary,
              lineHeight: 22,
            }}
          >
            {t('importWarningLine1')}
          </Text>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 13, color: theme.textMuted }}>
              • {t('importWarningBullet1')}
            </Text>
            <Text style={{ fontSize: 13, color: theme.textMuted }}>
              • {t('importWarningBullet2')}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: theme.bgTertiary,
              padding: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 13, color: theme.textMuted }}>{t('importWarningSource')}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.textPrimary }}>
              {email}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: theme.textSecondary,
            }}
          >
            {t('importConfirmInstruction')}{' '}
            <Text style={{ fontWeight: '700', color: theme.textPrimary }}>{CONFIRM_WORD}</Text>
          </Text>
          <TextInput
            style={inputStyle}
            value={confirmText}
            onChangeText={setConfirmText}
            placeholder={CONFIRM_WORD}
            placeholderTextColor={theme.textMuted}
            autoCapitalize="characters"
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setStep(1)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: theme.borderColor,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                {t('importBack')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleImport}
              disabled={confirmText !== CONFIRM_WORD}
              style={{
                flex: 1,
                backgroundColor: '#ef4444',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                opacity: confirmText !== CONFIRM_WORD ? 0.5 : 1,
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{t('importConfirmBtn')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Loading states */}
      {loading && (
        <View style={{ alignItems: 'center', paddingVertical: 32, gap: 16 }}>
          <ActivityIndicator size="large" color={colors.accentBlue} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: theme.textPrimary,
              textAlign: 'center',
            }}
          >
            {loadingPhase === 'backup' ? t('importPhaseBackup') : t('importPhaseImporting')}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: theme.textMuted,
              textAlign: 'center',
            }}
          >
            {loadingPhase === 'backup' ? t('importPhaseBackupSub') : t('importLoading')}
          </Text>
        </View>
      )}

      {/* Error state */}
      {errorState && !loading && (
        <View style={{ alignItems: 'center', paddingVertical: 16, gap: 16 }}>
          <WarningIcon />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: theme.textPrimary,
              textAlign: 'center',
            }}
          >
            {errorState.isImportFail
              ? t('importErrorRestoredTitle')
              : errorState.restored === false
                ? t('importErrorNotRestoredTitle')
                : t('importErrorGenericTitle')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.textSecondary,
              textAlign: 'center',
              lineHeight: 20,
            }}
          >
            {errorState.isImportFail
              ? t('importErrorRestoredDesc').replace('{count}', String(errorState.backupCount || 0))
              : errorState.restored === false
                ? t('importErrorNotRestoredDesc')
                : errorState.message || t('importError')}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setErrorState(null)
              setStep(1)
              setConfirmText('')
            }}
            style={{
              backgroundColor: colors.accentOrange,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{t('importTryAgain')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Success state */}
      {step === 3 && !loading && (
        <View style={{ alignItems: 'center', paddingVertical: 16, gap: 16 }}>
          <CheckIcon />
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: theme.textPrimary,
              textAlign: 'center',
            }}
          >
            {t('importSuccessTitle')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: theme.textSecondary,
              textAlign: 'center',
            }}
          >
            {t('importSuccessDesc').replace('{count}', String(importedCount))}
          </Text>
          <TouchableOpacity
            onPress={handleDone}
            style={{
              backgroundColor: colors.accentOrange,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>{t('importSuccessBtn')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollableModal>
  )
}
