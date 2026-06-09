import { useState } from 'react'
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'
import { invokeFunction } from '../lib/supabaseClient'
import Svg, { Path } from 'react-native-svg'
import ScrollableModal from './ScrollableModal'

const CheckIcon = () => (
  <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2}>
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
)

interface SuggestionModalProps {
  visible: boolean
  onClose: () => void
  t: (_key: string) => string
}

export default function SuggestionModal({ visible, onClose, t }: SuggestionModalProps) {
  const { theme } = useTheme()
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoursRemaining, setHoursRemaining] = useState<number | null>(null)

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return

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
    } catch {
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

  const inputStyle = {
    borderWidth: 1,
    borderColor: theme.borderColor,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.textPrimary,
    backgroundColor: theme.inputBg,
  }

  return (
    <ScrollableModal visible={visible} onClose={handleClose} title={t('suggestionTitle')}>
      {success ? (
        <View style={{ alignItems: 'center', paddingVertical: 32 }}>
          <CheckIcon />
          <Text
            style={{
              fontSize: 16,
              color: theme.textSecondary,
              textAlign: 'center',
              marginTop: 16,
              marginBottom: 24,
            }}
          >
            {t('suggestionSent')}
          </Text>
          <TouchableOpacity
            onPress={handleClose}
            style={{
              backgroundColor: colors.accentOrange,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
              {t('closeButton')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ gap: 16 }}>
          {/* Name */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.textPrimary,
                marginBottom: 6,
              }}
            >
              {t('nameLabel')}
            </Text>
            <TextInput
              style={inputStyle}
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholderTextColor={theme.textMuted}
              editable={!loading}
            />
          </View>

          {/* Email */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.textPrimary,
                marginBottom: 6,
              }}
            >
              {t('emailLabel')}
            </Text>
            <TextInput
              style={inputStyle}
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Message */}
          <View>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '500',
                color: theme.textPrimary,
                marginBottom: 6,
              }}
            >
              {t('messageLabel')}
            </Text>
            <TextInput
              style={[inputStyle, { height: 100, textAlignVertical: 'top' }]}
              value={formData.message}
              onChangeText={(text) => setFormData({ ...formData, message: text })}
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              editable={!loading}
            />
          </View>

          {/* Error */}
          {error && (
            <Text
              style={{
                fontSize: 13,
                color: '#ef4444',
                textAlign: 'center',
              }}
            >
              {error === 'rateLimit'
                ? `${t('rateLimitMessage')}. ${t('hoursRemaining').replace('{hours}', String(hoursRemaining || 24))}`
                : t('suggestionError')}
            </Text>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={
              loading || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()
            }
            style={{
              backgroundColor: colors.accentOrange,
              paddingVertical: 12,
              borderRadius: 9999,
              alignItems: 'center',
              opacity:
                loading ||
                !formData.name.trim() ||
                !formData.email.trim() ||
                !formData.message.trim()
                  ? 0.5
                  : 1,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                {t('sendButton')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollableModal>
  )
}
