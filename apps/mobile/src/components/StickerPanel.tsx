import { useState, useEffect, useRef } from 'react'
import { View, Text, FlatList, Modal, Pressable, TouchableOpacity } from 'react-native'
import { supabase } from '../lib/supabaseClient'
import { useTheme } from '../hooks/useTheme'
import StickerCard from './StickerCard'

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

interface StickerPanelProps {
  countryCode: string
  user: { id: string } | null
  stickerCount: number
  initialData: Record<string, CollectionEntry>
  highlightNumber?: number | null
  onCollectionChange: (countryCode: string, number: number, data: CollectionEntry) => void
}

export default function StickerPanel({
  countryCode,
  user,
  stickerCount,
  initialData,
  highlightNumber = null,
  onCollectionChange,
}: StickerPanelProps) {
  const { theme } = useTheme()

  const { cMap: initCollected, rMap: initRepeated } = buildMaps(initialData)
  const [collected, setCollected] = useState(initCollected)
  const [repeated, setRepeated] = useState(initRepeated)
  const [modal, setModal] = useState<number | null>(null)
  const [modalRepeated, setModalRepeated] = useState(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const { cMap, rMap } = buildMaps(initialData)
    setCollected(cMap)
    setRepeated(rMap)
  }, [countryCode, initialData])

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
    onCollectionChange(countryCode, number, { collected: next, repeated: 0 })

    if (next) {
      await supabase.from('sticker_collection').insert({
        user_id: user!.id,
        country_code: countryCode,
        sticker_number: number,
        repeated: 0,
        updated_at: new Date().toISOString(),
      })
    } else {
      await supabase
        .from('sticker_collection')
        .delete()
        .eq('user_id', user!.id)
        .eq('country_code', countryCode)
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
      onCollectionChange(countryCode, number, { collected: false, repeated: 0 })
      await supabase
        .from('sticker_collection')
        .delete()
        .eq('user_id', user!.id)
        .eq('country_code', countryCode)
        .eq('sticker_number', number)
      return
    }

    setCollected((prev) => ({ ...prev, [number]: true }))
    setRepeated((prev) => ({ ...prev, [number]: rep }))
    onCollectionChange(countryCode, number, { collected: true, repeated: rep })

    const existing = collected[number]
    if (existing) {
      await supabase
        .from('sticker_collection')
        .update({ repeated: rep, updated_at: new Date().toISOString() })
        .eq('user_id', user!.id)
        .eq('country_code', countryCode)
        .eq('sticker_number', number)
    } else {
      await supabase.from('sticker_collection').insert({
        user_id: user!.id,
        country_code: countryCode,
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
    <>
      <FlatList
        data={Array.from({ length: stickerCount }, (_, i) => i + 1)}
        numColumns={5}
        keyExtractor={(num) => String(num)}
        scrollEnabled={false}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
        columnWrapperStyle={{ gap: 5 }}
        ItemSeparatorComponent={() => <View style={{ height: 5 }} />}
        renderItem={({ item: num }) => (
          <StickerCard
            num={num}
            countryCode={countryCode}
            isCollected={!!collected[num]}
            isRepeated={(repeated[num] ?? 0) > 0}
            repeatedCount={repeated[num] ?? 0}
            isHighlighted={highlightNumber === num}
            onPress={() => toggleSticker(num)}
            onLongPress={() => openModal(num)}
            onPressIn={() => handleLongPressIn(num)}
            onPressOut={handleLongPressOut}
            delayLongPress={LONG_PRESS_MS}
          />
        )}
      />

      <Text style={{ color: theme.textDisabled, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
        Toca para marcar · Mantén presionado para repetidas
      </Text>

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
              {countryCode} #{modal}
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
    </>
  )
}
