import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  useWindowDimensions,
  type ListRenderItem,
} from 'react-native'
import { supabase } from '../lib/supabaseClient'
import { useTheme, colors } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'
import StickerCard from './StickerCard'

const LONG_PRESS_MS = 500
const keyExtractor = (num: number) => String(num)
const contentContainerStyle = { paddingTop: 16, paddingBottom: 24 }
const columnWrapperStyle = { gap: 5 }
const ItemSeparatorComponent = () => <View style={{ height: 5 }} />

interface CollectionEntry {
  collected: boolean
  repeated: number
}

interface StickerState {
  collected: Record<number, boolean>
  repeated: Record<number, number>
}

function buildState(data: Record<string, CollectionEntry>): StickerState {
  const collected: Record<number, boolean> = {}
  const repeated: Record<number, number> = {}
  Object.entries(data).forEach(([num, entry]) => {
    collected[Number(num)] = entry.collected
    repeated[Number(num)] = entry.repeated ?? 0
  })
  return { collected, repeated }
}

interface StickerPanelProps {
  countryCode: string
  user: { id: string } | null
  stickerCount: number
  stickerNumbers?: number[]
  initialData: Record<string, CollectionEntry>
  highlightNumber?: number | null
  onCollectionChange: (countryCode: string, number: number, data: CollectionEntry) => void
}

function StickerPanel({
  countryCode,
  user,
  stickerCount,
  stickerNumbers,
  initialData,
  highlightNumber = null,
  onCollectionChange,
}: StickerPanelProps) {
  const { theme } = useTheme()
  const { t } = useI18n()
  const { width: screenWidth } = useWindowDimensions()
  // 16px paddingH each side + 4 gaps of 5px between 5 columns
  const cardWidth = Math.floor((screenWidth - 32 - 20) / 5)

  const [state, setState] = useState<StickerState>(() => buildState(initialData))
  const [modal, setModal] = useState<number | null>(null)
  const [modalRepeated, setModalRepeated] = useState(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setState(buildState(initialData))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode])

  const { collected, repeated } = state

  // Refs para mantener handlers estables y evitar re-render de StickerCards
  const stateRef = useRef(state)
  stateRef.current = state
  const countryCodeRef = useRef(countryCode)
  countryCodeRef.current = countryCode
  const onCollectionChangeRef = useRef(onCollectionChange)
  onCollectionChangeRef.current = onCollectionChange
  const userRef = useRef(user)
  userRef.current = user
  const cardWidthRef = useRef(cardWidth)
  cardWidthRef.current = cardWidth
  const highlightNumberRef = useRef(highlightNumber)
  highlightNumberRef.current = highlightNumber

  const setSticker = useCallback((number: number, collected: boolean, repeated: number) => {
    setState((prev) => ({
      collected: { ...prev.collected, [number]: collected },
      repeated: { ...prev.repeated, [number]: repeated },
    }))
  }, [])

  const openModal = useCallback((number: number) => {
    const current = stateRef.current.repeated[number] ?? 0
    setModalRepeated(current > 0 ? current : 1)
    setModal(number)
  }, [])

  const closeModal = useCallback(() => setModal(null), [])

  const syncSupabase = useCallback(async (number: number, collected: boolean, repeated: number) => {
    const currentUser = userRef.current
    const currentCountryCode = countryCodeRef.current
    if (!currentUser) return
    if (collected) {
      const existing = stateRef.current.collected[number]
      if (existing) {
        await supabase
          .from('sticker_collection')
          .update({ repeated, updated_at: new Date().toISOString() })
          .eq('user_id', currentUser.id)
          .eq('country_code', currentCountryCode)
          .eq('sticker_number', number)
      } else {
        await supabase.from('sticker_collection').insert({
          user_id: currentUser.id,
          country_code: currentCountryCode,
          sticker_number: number,
          repeated,
          updated_at: new Date().toISOString(),
        })
      }
    } else {
      await supabase
        .from('sticker_collection')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('country_code', currentCountryCode)
        .eq('sticker_number', number)
    }
  }, [])

  const handleStickerPress = useCallback(
    async (number: number) => {
      const currentState = stateRef.current
      if (currentState.repeated[number] > 0) {
        openModal(number)
        return
      }
      const current = !!currentState.collected[number]
      const next = !current
      setSticker(number, next, 0)
      onCollectionChangeRef.current(countryCodeRef.current, number, {
        collected: next,
        repeated: 0,
      })
      await syncSupabase(number, next, 0)
    },
    [setSticker, syncSupabase]
  )

  const handleStickerLongPress = useCallback((number: number) => openModal(number), [])

  const applyModalAction = useCallback(
    async (action: string) => {
      const number = modal!
      const rep = modalRepeated
      closeModal()

      if (action === 'none') {
        setSticker(number, false, 0)
        onCollectionChangeRef.current(countryCodeRef.current, number, {
          collected: false,
          repeated: 0,
        })
        await syncSupabase(number, false, 0)
        return
      }

      setSticker(number, true, rep)
      onCollectionChangeRef.current(countryCodeRef.current, number, {
        collected: true,
        repeated: rep,
      })
      await syncSupabase(number, true, rep)
    },
    [modal, modalRepeated, closeModal, setSticker, syncSupabase]
  )

  const handleLongPressIn = useCallback((number: number) => {
    longPressTimer.current = setTimeout(() => openModal(number), LONG_PRESS_MS)
  }, [])

  const handleLongPressOut = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const data = useMemo(
    () => stickerNumbers ?? Array.from({ length: stickerCount }, (_, i) => i + 1),
    [stickerNumbers, stickerCount]
  )

  const renderItem: ListRenderItem<number> = useCallback(
    ({ item: num }) => {
      const currentState = stateRef.current
      const currentHighlight = highlightNumberRef.current
      return (
        <View style={{ width: cardWidthRef.current }}>
          <StickerCard
            num={num}
            countryCode={countryCodeRef.current}
            isCollected={!!currentState.collected[num]}
            isRepeated={(currentState.repeated[num] ?? 0) > 0}
            repeatedCount={currentState.repeated[num] ?? 0}
            isHighlighted={currentHighlight === num}
            onPress={handleStickerPress}
            onLongPress={handleStickerLongPress}
            onPressIn={handleLongPressIn}
            onPressOut={handleLongPressOut}
            delayLongPress={LONG_PRESS_MS}
          />
        </View>
      )
    },
    [handleStickerPress, handleStickerLongPress, handleLongPressIn, handleLongPressOut]
  )

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: cardWidthRef.current,
      offset: cardWidthRef.current * (index % 5),
      index,
    }),
    []
  )

  return (
    <>
      <FlatList
        data={data}
        numColumns={5}
        keyExtractor={keyExtractor}
        scrollEnabled={false}
        contentContainerStyle={contentContainerStyle}
        columnWrapperStyle={columnWrapperStyle}
        ItemSeparatorComponent={ItemSeparatorComponent}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        extraData={state}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={5}
        removeClippedSubviews={true}
      />

      <Text style={{ color: theme.textDisabled, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
        {t('hintTouch')}
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
              {countryCode} #{modal} · {t('modalTitle')}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: `${colors.accentOrange}1A`,
                borderWidth: 1,
                borderColor: `${colors.accentOrange}4D`,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.accentOrange, fontWeight: '600', fontSize: 14 }}>
                {t('modalRepeatedLabel')}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity
                  onPress={() => setModalRepeated((v) => Math.max(0, v - 1))}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: `${colors.accentOrange}66`,
                    backgroundColor: `${colors.accentOrange}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.accentOrange, fontSize: 16, fontWeight: '700' }}>
                    −
                  </Text>
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
                    borderColor: `${colors.accentOrange}66`,
                    backgroundColor: `${colors.accentOrange}1A`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: colors.accentOrange, fontSize: 16, fontWeight: '700' }}>
                    +
                  </Text>
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
                {t('modalHintRemove')}
              </Text>
            )}

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.accentBlue,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                }}
                onPress={() => applyModalAction('collected')}
              >
                <Text style={{ color: '#ffffff', fontWeight: '600', fontSize: 14 }}>
                  {modalRepeated === 0
                    ? t('modalBtnCollectedZero')
                    : t('modalBtnCollectedRep').replace('{count}', String(modalRepeated))}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  borderRadius: 8,
                  paddingVertical: 12,
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: `${colors.errorRed}4D`,
                  backgroundColor: `${colors.errorRed}1A`,
                }}
                onPress={() => applyModalAction('none')}
              >
                <Text style={{ color: colors.errorRed, fontWeight: '600', fontSize: 14 }}>
                  {t('modalBtnNone')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={closeModal}
              style={{ marginTop: 16, paddingVertical: 8, alignItems: 'center' }}
            >
              <Text style={{ color: theme.textMuted, fontSize: 14 }}>{t('modalCancel')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}

export default React.memo(StickerPanel)
