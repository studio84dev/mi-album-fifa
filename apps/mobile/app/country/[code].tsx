import { useState, useEffect, useRef, useMemo } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
  StatusBar,
  FlatList,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { allStickers } from '@mi-album-fifa/shared'
import { supabase } from '@/src/lib/supabaseClient'
import { useAuth } from '@/src/hooks/useAuth'
import { useGlobalCollection } from '@/src/hooks/useGlobalCollection'
import { useTheme } from '@/src/hooks/useTheme'
import flags from '@/src/data/flags'
import CuriosityCarousel from '@/src/components/CuriosityCarousel'
import Svg, { Path } from 'react-native-svg'

const GoogleIcon = () => (
  <Svg width={16} height={16} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
)

const LONG_PRESS_MS = 500

interface CollectionEntry {
  collected: boolean
  repeated: number
}

function buildMaps(data: Record<string, CollectionEntry>) {
  const cMap: Record<number, boolean> = {}
  const rMap: Record<number, number> = {}
  Object.entries(data).forEach(([num, entry]) => {
    cMap[Number(num)] = entry.collected
    rMap[Number(num)] = entry.repeated ?? 0
  })
  return { cMap, rMap }
}

export default function CountryScreen() {
  const { code } = useLocalSearchParams<{ code: string }>()
  const router = useRouter()
  const { user, signInWithGoogle } = useAuth()
  const { collection, updateEntry } = useGlobalCollection(user)
  const { theme, isDark } = useTheme()

  const countryStickers = useMemo(() => allStickers.filter((s) => s.country_code === code), [code])
  const stickerCount = countryStickers.length
  const teamName = countryStickers[0]?.team_name ?? code
  const page = countryStickers[0]?.page ?? null
  const isoCode = countryStickers[0]?.iso ?? null

  const initialData = collection[code ?? ''] ?? {}
  const { cMap: initCollected, rMap: initRepeated } = buildMaps(initialData)

  const [collected, setCollected] = useState(initCollected)
  const [repeated, setRepeated] = useState(initRepeated)
  const [modal, setModal] = useState<number | null>(null)
  const [modalRepeated, setModalRepeated] = useState(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const { cMap, rMap } = buildMaps(collection[code ?? ''] ?? {})
    setCollected(cMap)
    setRepeated(rMap)
  }, [code, collection])

  const collectedCount = Object.values(collected).filter(Boolean).length
  const repeatedCount = Object.values(repeated).reduce((acc, v) => acc + (v || 0), 0)
  const isComplete = stickerCount > 0 && collectedCount >= stickerCount

  const rawFlag = isoCode ? flags[isoCode] : null
  const FlagSvg = rawFlag
    ? (((rawFlag as { default?: unknown }).default ?? rawFlag) as React.FC<{
        width: number
        height: number
      }>)
    : null

  const toggleSticker = (number: number) => {
    if (repeated[number] > 0) {
      openModal(number)
      return
    }
    doToggle(number)
  }

  const doToggle = async (number: number) => {
    const current = !!collected[number]
    const next = !current
    setCollected((prev) => ({ ...prev, [number]: next }))
    if (!next) setRepeated((prev) => ({ ...prev, [number]: 0 }))
    updateEntry(code!, number, { collected: next, repeated: 0 })

    if (next) {
      await supabase.from('sticker_collection').insert({
        user_id: user!.id,
        country_code: code,
        sticker_number: number,
        repeated: 0,
        updated_at: new Date().toISOString(),
      })
    } else {
      await supabase
        .from('sticker_collection')
        .delete()
        .eq('user_id', user!.id)
        .eq('country_code', code)
        .eq('sticker_number', number)
    }
  }

  const openModal = (number: number) => {
    const current = repeated[number] ?? 0
    setModalRepeated(current > 0 ? current : 1)
    setModal(number)
  }

  const closeModal = () => setModal(null)

  const applyModalAction = async (action: string) => {
    const number = modal!
    const rep = modalRepeated
    closeModal()

    if (action === 'none') {
      setCollected((prev) => ({ ...prev, [number]: false }))
      setRepeated((prev) => ({ ...prev, [number]: 0 }))
      updateEntry(code!, number, { collected: false, repeated: 0 })
      await supabase
        .from('sticker_collection')
        .delete()
        .eq('user_id', user!.id)
        .eq('country_code', code)
        .eq('sticker_number', number)
      return
    }

    setCollected((prev) => ({ ...prev, [number]: true }))
    setRepeated((prev) => ({ ...prev, [number]: rep }))
    updateEntry(code!, number, { collected: true, repeated: rep })

    const existing = collected[number]
    if (existing) {
      await supabase
        .from('sticker_collection')
        .update({ repeated: rep, updated_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .eq('country_code', code)
        .eq('sticker_number', number)
    } else {
      await supabase.from('sticker_collection').insert({
        user_id: user!.id,
        country_code: code,
        sticker_number: number,
        repeated: rep,
        updated_at: new Date().toISOString(),
      })
    }
  }

  const handleLongPressIn = (number: number) => {
    longPressTimer.current = setTimeout(() => openModal(number), LONG_PRESS_MS)
  }

  const handleLongPressOut = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bgPrimary }}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgPrimary}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.borderColor,
          backgroundColor: theme.bgSecondary,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Text style={{ color: '#3b82f6', fontSize: 15 }}>← Volver</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 }}>
          {FlagSvg && (
            <View style={{ width: 28, height: 20, borderRadius: 2, overflow: 'hidden' }}>
              <FlagSvg width={28} height={20} />
            </View>
          )}
          <View>
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15 }}>
              {teamName}
            </Text>
            {page != null && (
              <Text style={{ color: theme.textMuted, fontSize: 11 }}>Pág. {page}</Text>
            )}
          </View>
        </View>
        <Text
          style={{ color: isComplete ? '#E8742A' : '#3b82f6', fontWeight: '700', fontSize: 14 }}
        >
          {collectedCount}/{stickerCount}
          {repeatedCount > 0 && <Text style={{ color: '#E8742A' }}> · +{repeatedCount}</Text>}
        </Text>
      </View>

      {!user ? (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}
        >
          <Text style={{ fontSize: 40, marginBottom: 16 }}>🏆</Text>
          <Text
            style={{
              color: theme.textPrimary,
              fontWeight: '700',
              fontSize: 17,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Iniciá sesión para registrar tu colección
          </Text>
          <Text
            style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}
          >
            Marcá las {stickerCount} figuritas de {teamName} y controla tus repetidas.
          </Text>
          <TouchableOpacity
            onPress={signInWithGoogle}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: theme.bgTertiary,
              borderWidth: 1,
              borderColor: theme.borderStrong,
              borderRadius: 9999,
              paddingHorizontal: 20,
              paddingVertical: 12,
            }}
            activeOpacity={0.75}
          >
            <GoogleIcon />
            <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '600' }}>
              Iniciar sesión con Google
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
          <FlatList
            data={Array.from({ length: stickerCount }, (_, i) => i + 1)}
            numColumns={5}
            keyExtractor={(num) => String(num)}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 16 }}
            columnWrapperStyle={{ gap: 5 }}
            ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
            renderItem={({ item: num }) => {
              const isCollected = !!collected[num]
              const isRepeated = (repeated[num] ?? 0) > 0

              let bgColor = theme.bgTertiary
              let borderColor = theme.borderColor
              let textColor = theme.textMuted

              if (isCollected && isRepeated) {
                bgColor = '#1d4ed8'
                borderColor = '#3b82f6'
                textColor = '#ffffff'
              } else if (isCollected) {
                bgColor = '#3b82f6'
                borderColor = '#3b82f6'
                textColor = '#ffffff'
              } else if (isRepeated) {
                bgColor = 'rgba(232,116,42,0.12)'
                borderColor = 'rgba(232,116,42,0.4)'
                textColor = '#E8742A'
              }

              return (
                <Pressable
                  onPress={() => toggleSticker(num)}
                  onLongPress={() => openModal(num)}
                  onPressIn={() => handleLongPressIn(num)}
                  onPressOut={handleLongPressOut}
                  delayLongPress={LONG_PRESS_MS}
                  style={{
                    flex: 1,
                    aspectRatio: 1.1,
                    backgroundColor: bgColor,
                    borderWidth: 1,
                    borderColor,
                    borderRadius: 6,
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{ color: textColor, fontSize: 15, fontWeight: '700', lineHeight: 16 }}
                  >
                    {num}
                  </Text>
                  <Text
                    style={{
                      color: textColor,
                      fontSize: 9,
                      fontWeight: '500',
                      opacity: 0.75,
                      marginTop: 1,
                    }}
                  >
                    {code}
                  </Text>
                  {isRepeated && (
                    <View
                      style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        backgroundColor: '#E8742A',
                        borderRadius: 3,
                        paddingHorizontal: 2,
                      }}
                    >
                      <Text style={{ color: '#fff', fontSize: 8, fontWeight: '700' }}>
                        +{repeated[num]}
                      </Text>
                    </View>
                  )}
                </Pressable>
              )
            }}
          />

          <Text
            style={{ color: theme.textDisabled, fontSize: 12, textAlign: 'center', marginTop: 8 }}
          >
            Toca para marcar · Mantén presionado para repetidas
          </Text>

          <View style={{ marginTop: 16 }}>
            <CuriosityCarousel countryCode={code ?? ''} />
          </View>
        </ScrollView>
      )}

      <Modal visible={modal !== null} transparent animationType="fade" onRequestClose={closeModal}>
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.65)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 16,
          }}
          onPress={closeModal}
        >
          <Pressable
            style={{
              backgroundColor: theme.cardBg,
              borderWidth: 1,
              borderColor: theme.borderColor,
              borderRadius: 16,
              padding: 24,
              width: '100%',
              maxWidth: 320,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                color: theme.textPrimary,
                fontWeight: '700',
                fontSize: 15,
                textAlign: 'center',
                marginBottom: 16,
              }}
            >
              {code} #{modal}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'rgba(232,116,42,0.1)',
                borderWidth: 1,
                borderColor: 'rgba(232,116,42,0.3)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: '#E8742A', fontWeight: '600', fontSize: 14 }}>Repetidas</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity
                  onPress={() => setModalRepeated((v) => Math.max(0, v - 1))}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(232,116,42,0.4)',
                    backgroundColor: 'rgba(232,116,42,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#E8742A', fontSize: 16, fontWeight: '700' }}>−</Text>
                </TouchableOpacity>
                <Text
                  style={{
                    color: theme.textPrimary,
                    fontSize: 20,
                    fontWeight: '700',
                    minWidth: 24,
                    textAlign: 'center',
                  }}
                >
                  {modalRepeated}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalRepeated((v) => v + 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: 'rgba(232,116,42,0.4)',
                    backgroundColor: 'rgba(232,116,42,0.1)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#E8742A', fontSize: 16, fontWeight: '700' }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {modalRepeated === 0 && (
              <Text
                style={{
                  color: theme.textMuted,
                  fontSize: 12,
                  textAlign: 'center',
                  marginBottom: 8,
                }}
              >
                0 repetidas = quitar de la colección
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: '#3b82f6',
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={() => applyModalAction('collected')}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                  {modalRepeated === 0 ? 'Solo coleccionada' : `Tengo +${modalRepeated}`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  backgroundColor: 'rgba(239,68,68,0.1)',
                }}
                onPress={() => applyModalAction('none')}
              >
                <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 14 }}>Quitar</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={closeModal}
              style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ color: theme.textMuted, fontSize: 14 }}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}
