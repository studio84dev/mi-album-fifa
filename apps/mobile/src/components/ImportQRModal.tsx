import { useState } from 'react'
import { View, Text, Modal, Pressable, TextInput, ScrollView, Alert } from 'react-native'
import { decodeExternalQR } from '@mi-album-fifa/shared'
import { useTheme } from '../hooks/useTheme'

interface ImportQRModalProps {
  visible: boolean
  onClose: () => void
}

export default function ImportQRModal({ visible, onClose }: ImportQRModalProps) {
  const [qrText, setQrText] = useState('')
  const [decodedResult, setDecodedResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()

  const handleDecode = () => {
    if (!qrText.trim()) {
      setError('Por favor ingresa un texto QR')
      return
    }

    try {
      const result = decodeExternalQR(qrText.trim())
      setDecodedResult(result)
      setError(null)
      console.log('QR Decodificado:', result)
      Alert.alert('Éxito', 'QR decodificado correctamente. Ver consola para detalles.')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al decodificar QR'
      setError(errorMsg)
      setDecodedResult(null)
    }
  }

  const handleClear = () => {
    setQrText('')
    setDecodedResult(null)
    setError(null)
  }

  const handleClose = () => {
    handleClear()
    onClose()
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
        onPress={handleClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.cardBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.borderColor,
            padding: 20,
            width: '100%',
            maxWidth: 400,
            maxHeight: '80%',
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: theme.textPrimary,
                  marginBottom: 4,
                }}
              >
                Importar QR Externo
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: theme.textMuted,
                  lineHeight: 18,
                }}
              >
                Pega el texto del QR de Panini para decodificarlo
              </Text>
            </View>

            {/* Input */}
            <TextInput
              style={{
                backgroundColor: theme.inputBg,
                borderWidth: 1,
                borderColor: theme.borderColor,
                borderRadius: 8,
                padding: 12,
                color: theme.textPrimary,
                fontSize: 12,
                fontFamily: 'monospace',
                minHeight: 100,
                marginBottom: 12,
                textAlignVertical: 'top',
              }}
              placeholder="⋋^H4sI...==;H4sI...==;H4sI...=="
              placeholderTextColor={theme.textMuted}
              value={qrText}
              onChangeText={(text) => {
                setQrText(text)
                setError(null)
                setDecodedResult(null)
              }}
              multiline
              editable
            />

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <Pressable
                onPress={handleDecode}
                disabled={!qrText.trim()}
                style={{
                  flex: 1,
                  backgroundColor: qrText.trim() ? colors.accentOrange : '#cccccc',
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Decodificar
                </Text>
              </Pressable>
              <Pressable
                onPress={handleClear}
                style={{
                  flex: 1,
                  backgroundColor: theme.bgTertiary,
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                  paddingVertical: 10,
                  borderRadius: 8,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Limpiar
                </Text>
              </Pressable>
            </View>

            {/* Error */}
            {error && (
              <View
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: '#fca5a5',
                    fontSize: 12,
                  }}
                >
                  {error}
                </Text>
              </View>
            )}

            {/* Success */}
            {decodedResult && (
              <View
                style={{
                  backgroundColor: 'rgba(34,197,94,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(34,197,94,0.3)',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: '#22c55e',
                    fontSize: 12,
                    fontWeight: '600',
                    marginBottom: 8,
                  }}
                >
                  ✓ QR decodificado correctamente
                </Text>
                <Text
                  style={{
                    color: theme.textSecondary,
                    fontSize: 11,
                    fontFamily: 'monospace',
                  }}
                  numberOfLines={10}
                >
                  {JSON.stringify(decodedResult, null, 2)}
                </Text>
              </View>
            )}

            {/* Close Button */}
            <Pressable
              onPress={handleClose}
              style={{
                paddingVertical: 10,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 14,
                }}
              >
                Cerrar
              </Text>
            </Pressable>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const colors = {
  accentOrange: '#e8742a',
}
