import { useState, useRef, useCallback } from 'react'
import { View, Text, Modal, Pressable, ScrollView } from 'react-native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { decodeExternalQR } from '@mi-album-fifa/shared'
import type { AlbumState } from '@mi-album-fifa/shared'
import { useTheme } from '../hooks/useTheme'

interface ImportQRModalProps {
  visible: boolean
  onClose: () => void
}

type Screen = 'input' | 'scanner'

export default function ImportQRModal({ visible, onClose }: ImportQRModalProps) {
  const [decodedResult, setDecodedResult] = useState<AlbumState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [screen, setScreen] = useState<Screen>('input')
  const { theme } = useTheme()
  const [permission, requestPermission] = useCameraPermissions()
  const scannedRef = useRef(false)

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scannedRef.current) return
      scannedRef.current = true

      try {
        const result = decodeExternalQR(data)
        setDecodedResult(result)
        setError(null)
        setScreen('input')
        console.log('QR Externo Escaneado:', result)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error al decodificar QR'
        setError(errorMsg)
        setDecodedResult(null)
        setScreen('input')
        scannedRef.current = false
      }
    },
    []
  )

  const handleScanPress = useCallback(async () => {
    setError(null)
    setDecodedResult(null)
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setError('Permiso de cámara denegado')
        return
      }
    }
    scannedRef.current = false
    setScreen('scanner')
  }, [permission, requestPermission])

  const handleClose = () => {
    setDecodedResult(null)
    setError(null)
    setScreen('input')
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
          {screen === 'scanner' ? (
            <View style={{ height: 400, borderRadius: 12, overflow: 'hidden' }}>
              {permission?.granted ? (
                <>
                  <CameraView
                    style={{ flex: 1 }}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={handleBarCodeScanned}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      padding: 24,
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 15, textAlign: 'center' }}>
                      Escaneando QR...
                    </Text>
                    <Pressable
                      onPress={() => setScreen('input')}
                      style={{ marginTop: 16, paddingVertical: 8, paddingHorizontal: 20 }}
                    >
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Cancelar</Text>
                    </Pressable>
                  </View>
                </>
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 32,
                    gap: 16,
                  }}
                >
                  <Text style={{ color: theme.textPrimary, fontWeight: '600', textAlign: 'center' }}>
                    Permiso de cámara denegado
                  </Text>
                  <Pressable onPress={() => setScreen('input')}>
                    <Text style={{ color: '#3b82f6' }}>Volver</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
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
                  Escanea el QR de tu álbum Panini para importar tu colección
                </Text>
              </View>

              {/* Scan Button */}
              <Pressable
                onPress={handleScanPress}
                style={{
                  backgroundColor: '#3b82f6',
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Escanear QR
                </Text>
              </Pressable>

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
          )}
        </Pressable>
      </Pressable>
    </Modal>
  )
}
