import { useState, useCallback, useMemo, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { CameraView, useCameraPermissions } from 'expo-camera'
import QRCode from 'react-native-qrcode-svg'
import Svg, { Path, Rect } from 'react-native-svg'
import { useCollectionState, useCollectionDispatch } from '@/src/context/CollectionContext'
import { useAuth } from '@/src/hooks/useAuth'
import { useTheme, colors } from '@/src/hooks/useTheme'
import { useI18n } from '@/src/hooks/useI18n'
import ScrollableModal from '@/src/components/ScrollableModal'
import { supabase } from '@/src/lib/supabaseClient'
import {
  decodeQR,
  encodeQR,
  computeMatch,
  detectQRType,
  encodeTradeQR,
  decodeTradeQR,
} from '@/src/lib/qrCodec'
import type { MatchResult, TradeData, TradeStickerRef } from '@/src/lib/qrCodec'

type Screen = 'home' | 'scanner' | 'match' | 'trade_qr' | 'finalize' | 'trade_confirm' | 'success'

interface SuccessData {
  given: number
  received: number
}

const QrIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Rect x={3} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
    <Rect x={14} y={3} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
    <Rect x={3} y={14} width={7} height={7} rx={1} stroke={color} strokeWidth={2} />
    <Path
      d="M14 14h2v2h-2zM18 14h3M14 18h2M18 18h3v3M14 21h3"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
)

const ScanIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path d="M3 12h18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
)

interface StickerChipProps {
  label: string
  count: number
  selected: boolean
  accentColor: string
  onPress: () => void
  theme: ReturnType<typeof useTheme>['theme']
}

function StickerChip({ label, count, selected, accentColor, onPress, theme }: StickerChipProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: selected ? accentColor : theme.borderColor,
        backgroundColor: selected ? `${accentColor}22` : theme.bgTertiary,
        margin: 3,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: selected ? '700' : '400',
          color: selected ? accentColor : theme.textMuted,
        }}
      >
        {label}
      </Text>
      {count > 1 && (
        <View
          style={{
            backgroundColor: selected ? accentColor : theme.textDisabled,
            borderRadius: 99,
            minWidth: 16,
            height: 16,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 3,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

interface StickerSectionProps {
  title: string
  items: MatchResult['theyCanGive']
  selected: Set<string>
  accentColor: string
  onToggle: (_key: string) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  t: (_key: string) => string
  theme: ReturnType<typeof useTheme>['theme']
}

function StickerSection({
  title,
  items,
  selected,
  accentColor,
  onToggle,
  onSelectAll,
  onDeselectAll,
  t,
  theme,
}: StickerSectionProps) {
  const selCount = items.filter((i) => selected.has(i.key)).length
  const allSelected = selCount === items.length

  return (
    <View
      style={{
        backgroundColor: theme.bgSecondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.borderColor,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          backgroundColor: `${accentColor}11`,
        }}
      >
        <View>
          <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>{title}</Text>
          <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
            {t('exchangeSelectedCount')
              .replace('{selected}', String(selCount))
              .replace('{total}', String(items.length))}
          </Text>
        </View>
        <TouchableOpacity
          onPress={allSelected ? onDeselectAll : onSelectAll}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: accentColor,
            backgroundColor: `${accentColor}15`,
          }}
        >
          <Text style={{ color: accentColor, fontSize: 12, fontWeight: '600' }}>
            {allSelected ? t('exchangeDeselectAll') : t('exchangeSelectAll')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10 }}>
        {items.map((item) => (
          <StickerChip
            key={item.key}
            label={item.label}
            count={item.count}
            selected={selected.has(item.key)}
            accentColor={accentColor}
            onPress={() => onToggle(item.key)}
            theme={theme}
          />
        ))}
      </View>
    </View>
  )
}

interface StickerLabelListProps {
  title: string
  items: TradeStickerRef[]
  accentColor: string
  theme: ReturnType<typeof useTheme>['theme']
}

function StickerLabelList({ title, items, accentColor, theme }: StickerLabelListProps) {
  return (
    <View
      style={{
        backgroundColor: theme.bgSecondary,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.borderColor,
        overflow: 'hidden',
        marginBottom: 12,
      }}
    >
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          backgroundColor: `${accentColor}11`,
        }}
      >
        <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>{title}</Text>
        <Text style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
          {items.length} figurita(s)
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', padding: 10 }}>
        {items.map((item) => (
          <View
            key={item.key}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: 20,
              borderWidth: 1.5,
              borderColor: accentColor,
              backgroundColor: `${accentColor}22`,
              margin: 3,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: accentColor }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

export default function ExchangeScreen() {
  const { theme, isDark } = useTheme()
  const { t } = useI18n()
  const { user } = useAuth()
  const { collection } = useCollectionState()
  const { updateEntry } = useCollectionDispatch()
  const { width } = useWindowDimensions()

  const [screen, setScreen] = useState<Screen>('home')
  const [match, setMatch] = useState<MatchResult | null>(null)
  const [selectedReceive, setSelectedReceive] = useState<Set<string>>(new Set())
  const [selectedGive, setSelectedGive] = useState<Set<string>>(new Set())
  const [showMyQr, setShowMyQr] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [successData, setSuccessData] = useState<SuccessData | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)
  const [tradeQrValue, setTradeQrValue] = useState('')
  const [incomingTrade, setIncomingTrade] = useState<TradeData | null>(null)

  const [permission, requestPermission] = useCameraPermissions()
  const scannedRef = useRef(false)

  const myQrValue = useMemo(() => {
    if (!user) return ''
    return encodeQR(collection)
  }, [user, collection])

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scannedRef.current) return
      scannedRef.current = true

      const type = detectQRType(data)
      console.log('🔍 QR escaneado:', { type, dataLength: data.length })

      if (type === 'trade') {
        const tradeData = decodeTradeQR(data)
        if (!tradeData) {
          setScanError(t('exchangeInvalidQr'))
          scannedRef.current = false
          return
        }
        console.log('🤝 Trade QR decodificado:', tradeData)
        setIncomingTrade(tradeData)
        setScreen('trade_confirm')
        return
      }

      if (type === 'collection') {
        const result = decodeQR(data)
        if (!result) {
          setScanError(t('exchangeInvalidQr'))
          scannedRef.current = false
          return
        }
        console.log('📦 Collection QR decodificado:', {
          missingCount: result.missing.size,
          repeatedCount: result.repeated.size,
          sample: Array.from(result.missing).slice(0, 5),
        })
        const matchResult = computeMatch(collection, result)
        console.log('✨ Match result:', {
          theyCanGive: matchResult.theyCanGive.length,
          iCanGive: matchResult.iCanGive.length,
          theyCanGiveSample: matchResult.theyCanGive.slice(0, 3),
          iCanGiveSample: matchResult.iCanGive.slice(0, 3),
        })
        setMatch(matchResult)
        setSelectedReceive(new Set())
        setSelectedGive(new Set())
        setScreen('match')
        return
      }

      setScanError(t('exchangeInvalidQr'))
      scannedRef.current = false
    },
    [collection, t]
  )

  const handleScanPress = useCallback(async () => {
    setScanError(null)
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        setScanError(t('exchangeCameraPermissionDenied'))
        return
      }
    }
    scannedRef.current = false
    setScreen('scanner')
  }, [permission, requestPermission, t])

  const handleToggleReceive = useCallback((key: string) => {
    setSelectedReceive((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const handleToggleGive = useCallback((key: string) => {
    setSelectedGive((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const handleSelectAllReceive = useCallback(() => {
    if (!match) return
    setSelectedReceive(new Set(match.theyCanGive.map((i) => i.key)))
  }, [match])

  const handleDeselectAllReceive = useCallback(() => setSelectedReceive(new Set()), [])

  const handleSelectAllGive = useCallback(() => {
    if (!match) return
    setSelectedGive(new Set(match.iCanGive.map((i) => i.key)))
  }, [match])

  const handleDeselectAllGive = useCallback(() => setSelectedGive(new Set()), [])

  const canConfirm = selectedReceive.size > 0 && selectedGive.size > 0

  const applyTrade = useCallback(
    async (
      receiveItems: Array<{ code: string; number: number; key: string }>,
      giveItems: Array<{ code: string; number: number; key: string }>
    ) => {
      console.log('🔄 Aplicando intercambio a Supabase:', { receiveItems, giveItems })
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const applyEntry = async (
        code: string,
        number: number,
        collected: boolean,
        repeated: number
      ) => {
        const dbCode = code === 'null' ? null : code
        console.log('  📝 applyEntry:', { code, number, collected, repeated })
        updateEntry(code, number, { collected, repeated })
        if (!session?.user?.id) return
        if (collected) {
          await supabase.from('sticker_collection').upsert(
            {
              user_id: session.user.id,
              country_code: dbCode,
              sticker_number: number,
              repeated,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,country_code,sticker_number' }
          )
        } else {
          await supabase
            .from('sticker_collection')
            .delete()
            .eq('user_id', session.user.id)
            .eq('country_code', dbCode)
            .eq('sticker_number', number)
        }
      }

      for (const item of receiveItems) {
        const currentEntry = collection[item.code]?.[item.number]
        if (!currentEntry?.collected) {
          await applyEntry(item.code, item.number, true, 0)
        }
      }

      for (const item of giveItems) {
        const currentEntry = collection[item.code]?.[item.number]
        const currentRepeated = currentEntry?.repeated ?? 0
        const newRepeated = Math.max(0, currentRepeated - 1)
        await applyEntry(item.code, item.number, true, newRepeated)
      }
      console.log('✅ Intercambio aplicado exitosamente')
    },
    [collection, updateEntry]
  )

  const handleConfirm = useCallback(() => {
    if (!match) return

    const givingItems: TradeStickerRef[] = match.iCanGive
      .filter((i) => selectedGive.has(i.key))
      .map((i) => ({ key: i.key, code: i.code, number: i.number, label: i.label }))
    const receivingItems: TradeStickerRef[] = match.theyCanGive
      .filter((i) => selectedReceive.has(i.key))
      .map((i) => ({ key: i.key, code: i.code, number: i.number, label: i.label }))

    const qr = encodeTradeQR(givingItems, receivingItems)
    setTradeQrValue(qr)
    setShowConfirm(false)
    setScreen('trade_qr')
  }, [match, selectedGive, selectedReceive])

  const handleFinalize = useCallback(async () => {
    if (!match) return
    setConfirming(true)
    try {
      const givingItems = match.iCanGive.filter((i) => selectedGive.has(i.key))
      const receivingItems = match.theyCanGive.filter((i) => selectedReceive.has(i.key))
      console.log('✅ Confirmando intercambio:', {
        giving: givingItems,
        receiving: receivingItems,
      })
      await applyTrade(receivingItems, givingItems)
      setSuccessData({ given: selectedGive.size, received: selectedReceive.size })
      setScreen('success')
    } catch {
      Alert.alert('Error', 'No se pudo completar el intercambio. Intenta de nuevo.')
    } finally {
      setConfirming(false)
    }
  }, [match, selectedGive, selectedReceive, applyTrade])

  const handleTradeConfirm = useCallback(async () => {
    if (!incomingTrade) return
    setConfirming(true)
    try {
      console.log('✅ Confirmando trade QR:', {
        receiving: incomingTrade.giving, // Lo que el otro me da
        giving: incomingTrade.receiving, // Lo que yo le doy al otro
      })
      await applyTrade(incomingTrade.giving, incomingTrade.receiving)
      setSuccessData({
        given: incomingTrade.receiving.length,
        received: incomingTrade.giving.length,
      })
      setScreen('success')
    } catch {
      Alert.alert('Error', 'No se pudo completar el intercambio. Intenta de nuevo.')
    } finally {
      setConfirming(false)
    }
  }, [incomingTrade, applyTrade])

  const handleReset = useCallback(() => {
    setScreen('home')
    setMatch(null)
    setSelectedReceive(new Set())
    setSelectedGive(new Set())
    setSuccessData(null)
    setScanError(null)
    setTradeQrValue('')
    setIncomingTrade(null)
    scannedRef.current = false
  }, [])

  const bgColor = theme.bgPrimary

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 18 }}>
          {t('exchangeTabTitle')}
        </Text>
        {screen !== 'home' && screen !== 'success' && (
          <TouchableOpacity onPress={handleReset}>
            <Text style={{ color: colors.accentBlue, fontSize: 14 }}>{t('exchangeNewScan')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* HOME */}
      {screen === 'home' && (
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          {!user && (
            <View
              style={{
                backgroundColor: `${colors.accentOrange}15`,
                borderWidth: 1,
                borderColor: `${colors.accentOrange}40`,
                borderRadius: 12,
                padding: 16,
                width: '100%',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: theme.textPrimary, fontWeight: '600', textAlign: 'center' }}>
                {t('exchangeNeedLogin')}
              </Text>
            </View>
          )}

          <Text
            style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}
          >
            Escanea el QR de otro coleccionista o muéstrale el tuyo para encontrar las figuritas que
            pueden intercambiar.
          </Text>

          {scanError && (
            <Text style={{ color: colors.errorRed, fontSize: 13, textAlign: 'center' }}>
              {scanError}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleScanPress}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: colors.accentBlue,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: '100%',
            }}
          >
            <ScanIcon color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {t('exchangeScanBtn')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (!user) {
                Alert.alert(t('exchangeNeedLogin'))
                return
              }
              setShowMyQr(true)
            }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              backgroundColor: theme.bgSecondary,
              borderRadius: 12,
              paddingVertical: 16,
              paddingHorizontal: 32,
              width: '100%',
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}
          >
            <QrIcon color={theme.textPrimary} />
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 16 }}>
              {t('exchangeMyQrBtn')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* SCANNER */}
      {screen === 'scanner' && (
        <View style={{ flex: 1 }}>
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
                  {t('exchangeScanning')}
                </Text>
                <TouchableOpacity
                  onPress={handleReset}
                  style={{ marginTop: 16, paddingVertical: 8, paddingHorizontal: 20 }}
                >
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>Cancelar</Text>
                </TouchableOpacity>
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
                {t('exchangeCameraPermissionDenied')}
              </Text>
              <TouchableOpacity onPress={handleReset}>
                <Text style={{ color: colors.accentBlue }}>Volver</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* MATCH */}
      {screen === 'match' && match && (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {match.theyCanGive.length === 0 && match.iCanGive.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>🤷</Text>
              <Text
                style={{
                  color: theme.textPrimary,
                  fontWeight: '700',
                  fontSize: 16,
                  textAlign: 'center',
                }}
              >
                {t('exchangeNoMatch')}
              </Text>
            </View>
          ) : (
            <>
              <StickerSection
                title={t('exchangeTheyCanGive')}
                items={match.theyCanGive}
                selected={selectedReceive}
                accentColor={colors.accentBlue}
                onToggle={handleToggleReceive}
                onSelectAll={handleSelectAllReceive}
                onDeselectAll={handleDeselectAllReceive}
                t={t}
                theme={theme}
              />

              <StickerSection
                title={t('exchangeICanGive')}
                items={match.iCanGive}
                selected={selectedGive}
                accentColor={colors.accentOrange}
                onToggle={handleToggleGive}
                onSelectAll={handleSelectAllGive}
                onDeselectAll={handleDeselectAllGive}
                t={t}
                theme={theme}
              />
            </>
          )}
        </ScrollView>
      )}

      {/* MATCH bottom confirm button */}
      {screen === 'match' &&
        match &&
        (match.theyCanGive.length > 0 || match.iCanGive.length > 0) && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 16,
              backgroundColor: theme.bgPrimary,
              borderTopWidth: 1,
              borderTopColor: theme.borderColor,
            }}
          >
            {!canConfirm && (
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 12,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                {t('exchangeSelectAtLeastOne')}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => setShowConfirm(true)}
              disabled={!canConfirm}
              style={{
                backgroundColor: canConfirm ? colors.accentBlue : theme.bgTertiary,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: canConfirm ? '#fff' : theme.textDisabled,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {t('exchangeConfirmBtn')} ({selectedGive.size} → {selectedReceive.size})
              </Text>
            </TouchableOpacity>
          </View>
        )}

      {/* TRADE QR */}
      {screen === 'trade_qr' && tradeQrValue && (
        <ScrollView
          contentContainerStyle={{ padding: 16, alignItems: 'center', gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 20 }}
          >
            {t('exchangeTradeQrSubtitle')}
          </Text>
          <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12 }}>
            <QRCode value={tradeQrValue} size={Math.min(width - 120, 240)} />
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center' }}>
            {t('exchangeYouGive')}: {selectedGive.size} · {t('exchangeYouReceive')}:{' '}
            {selectedReceive.size}
          </Text>
          <TouchableOpacity
            onPress={() => setScreen('finalize')}
            style={{
              backgroundColor: colors.accentBlue,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 32,
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {t('exchangeTradeContinue')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* FINALIZE */}
      {screen === 'finalize' && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}
        >
          <Text style={{ fontSize: 48 }}>✅</Text>
          <Text
            style={{
              color: theme.textPrimary,
              fontWeight: '700',
              fontSize: 18,
              textAlign: 'center',
            }}
          >
            {t('exchangeFinalizeTitle')}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {t('exchangeFinalizeDesc')}
          </Text>
          {confirming ? (
            <ActivityIndicator
              size="large"
              color={colors.accentBlue}
              style={{ marginVertical: 16 }}
            />
          ) : (
            <View style={{ flexDirection: 'row', gap: 8, width: '100%' }}>
              <TouchableOpacity
                onPress={handleReset}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                  {t('exchangeTradeCancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFinalize}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colors.accentOrange,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {t('exchangeFinalizeBtn')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* TRADE CONFIRM (receiver) */}
      {screen === 'trade_confirm' && incomingTrade && (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          <StickerLabelList
            title={t('exchangeYouReceive')}
            items={incomingTrade.giving}
            accentColor={colors.accentBlue}
            theme={theme}
          />
          <StickerLabelList
            title={t('exchangeYouGive')}
            items={incomingTrade.receiving}
            accentColor={colors.accentOrange}
            theme={theme}
          />
        </ScrollView>
      )}

      {/* TRADE CONFIRM bottom bar */}
      {screen === 'trade_confirm' && incomingTrade && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 16,
            backgroundColor: theme.bgPrimary,
            borderTopWidth: 1,
            borderTopColor: theme.borderColor,
          }}
        >
          {confirming ? (
            <ActivityIndicator
              size="large"
              color={colors.accentBlue}
              style={{ marginVertical: 14 }}
            />
          ) : (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                onPress={handleReset}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.borderColor,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '600' }}>
                  {t('exchangeTradeCancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleTradeConfirm}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: colors.accentBlue,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                  {t('exchangeConfirmYes')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* SUCCESS */}
      {screen === 'success' && successData && (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 }}
        >
          <Text style={{ fontSize: 56 }}>🎉</Text>
          <Text
            style={{
              color: theme.textPrimary,
              fontWeight: '700',
              fontSize: 22,
              textAlign: 'center',
            }}
          >
            {t('exchangeSuccessTitle')}
          </Text>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            {t('exchangeSuccessDesc')
              .replace('{given}', String(successData.given))
              .replace('{received}', String(successData.received))}
          </Text>
          <TouchableOpacity
            onPress={handleReset}
            style={{
              backgroundColor: colors.accentOrange,
              borderRadius: 12,
              paddingVertical: 14,
              paddingHorizontal: 32,
              marginTop: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
              {t('exchangeSuccessBtn')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* My QR Modal */}
      <ScrollableModal
        visible={showMyQr}
        onClose={() => setShowMyQr(false)}
        title={t('exchangeMyQrTitle')}
        scrollable={false}
        contentPadding={24}
      >
        <View style={{ alignItems: 'center', gap: 16 }}>
          <Text style={{ color: theme.textMuted, fontSize: 13, textAlign: 'center' }}>
            {t('exchangeMyQrSubtitle')}
          </Text>
          {myQrValue ? (
            <View
              style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 12,
              }}
            >
              <QRCode value={myQrValue} size={Math.min(width - 120, 240)} />
            </View>
          ) : (
            <ActivityIndicator color={colors.accentBlue} />
          )}
        </View>
      </ScrollableModal>

      {/* Confirm trade Modal */}
      <ScrollableModal
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        title={t('exchangeConfirmTitle')}
        scrollable={false}
        contentPadding={24}
      >
        <View style={{ gap: 16 }}>
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 14,
              lineHeight: 22,
              textAlign: 'center',
            }}
          >
            {t('exchangeConfirmTradeDesc')
              .replace('{given}', String(selectedGive.size))
              .replace('{received}', String(selectedReceive.size))}
          </Text>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setShowConfirm(false)}
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
                {t('exchangeConfirmCancel')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: colors.accentBlue,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>{t('exchangeConfirmYes')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollableModal>
    </SafeAreaView>
  )
}
