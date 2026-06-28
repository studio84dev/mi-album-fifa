import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native'
import { supabase } from '../lib/supabaseClient'
import { useTheme, colors } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'
import ScrollableModal from './ScrollableModal'
import StickerCard from './StickerCard'

const LONG_PRESS_MS = 500

interface CollectionEntry {
  collected: boolean
  repeated: number
}

interface StickerState {
  collected: Record<number, boolean>
  repeated: Record<number, number>
}

interface StickerRowProps {
  rowNumbers: number[]
  countryCode: string
  state: StickerState
  highlightNumber: number | null
  cardWidth: number
  onPress: (_num: number) => void
  onLongPress: (_num: number) => void
  onPressIn: (_num: number) => void
  onPressOut: () => void
}

function areStickerRowsEqual(prev: StickerRowProps, next: StickerRowProps) {
  if (prev.countryCode !== next.countryCode) return false
  if (prev.highlightNumber !== next.highlightNumber) return false
  if (prev.cardWidth !== next.cardWidth) return false
  if (prev.rowNumbers.length !== next.rowNumbers.length) return false
  if (prev.rowNumbers !== next.rowNumbers) {
    for (let i = 0; i < prev.rowNumbers.length; i++) {
      if (prev.rowNumbers[i] !== next.rowNumbers[i]) return false
    }
  }
  if (prev.onPress !== next.onPress) return false
  if (prev.onLongPress !== next.onLongPress) return false
  if (prev.onPressIn !== next.onPressIn) return false
  if (prev.onPressOut !== next.onPressOut) return false
  for (const num of prev.rowNumbers) {
    if (prev.state.collected[num] !== next.state.collected[num]) return false
    if (prev.state.repeated[num] !== next.state.repeated[num]) return false
  }
  return true
}

const StickerRow = React.memo(function StickerRow({
  rowNumbers,
  countryCode,
  state,
  highlightNumber,
  cardWidth,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
}: StickerRowProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 5 }}>
      {rowNumbers.map((num) => (
        <View key={num} style={{ width: cardWidth }}>
          <StickerCard
            num={num}
            countryCode={countryCode}
            isCollected={!!state.collected[num]}
            isRepeated={(state.repeated[num] ?? 0) > 0}
            repeatedCount={state.repeated[num] ?? 0}
            isHighlighted={highlightNumber === num}
            onPress={onPress}
            onLongPress={onLongPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            delayLongPress={LONG_PRESS_MS}
          />
        </View>
      ))}
    </View>
  )
}, areStickerRowsEqual)

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
  onCollectionChange: (_countryCode: string, _number: number, _data: CollectionEntry) => void
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

  // Derive collected/repeated directly from initialData (source of truth is the context).
  // updateEntry already does an optimistic setCollection, so initialData is always current.
  const state = useMemo(() => buildState(initialData), [initialData])

  const [modal, setModal] = useState<number | null>(null)
  const [modalRepeated, setModalRepeated] = useState(0)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refs para mantener handlers estables y evitar re-render de StickerCards
  const stateRef = useRef(state)
  // eslint-disable-next-line react-hooks/refs
  stateRef.current = state
  const countryCodeRef = useRef(countryCode)
  // eslint-disable-next-line react-hooks/refs
  countryCodeRef.current = countryCode
  const onCollectionChangeRef = useRef(onCollectionChange)
  // eslint-disable-next-line react-hooks/refs
  onCollectionChangeRef.current = onCollectionChange
  const userRef = useRef(user)
  // eslint-disable-next-line react-hooks/refs
  userRef.current = user

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
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      const currentState = stateRef.current
      if (currentState.repeated[number] > 0) {
        openModal(number)
        return
      }
      const current = !!currentState.collected[number]
      const next = !current
      onCollectionChangeRef.current(countryCodeRef.current, number, {
        collected: next,
        repeated: 0,
      })
      await syncSupabase(number, next, 0)
    },
    [openModal, syncSupabase]
  )

  const handleStickerLongPress = useCallback((number: number) => openModal(number), [openModal])

  const applyModalAction = useCallback(
    async (action: string) => {
      const number = modal!
      const rep = modalRepeated
      closeModal()

      if (action === 'none') {
        onCollectionChangeRef.current(countryCodeRef.current, number, {
          collected: false,
          repeated: 0,
        })
        await syncSupabase(number, false, 0)
        return
      }

      onCollectionChangeRef.current(countryCodeRef.current, number, {
        collected: true,
        repeated: rep,
      })
      await syncSupabase(number, true, rep)
    },
    [modal, modalRepeated, closeModal, syncSupabase]
  )

  const handleLongPressIn = useCallback(
    (number: number) => {
      longPressTimer.current = setTimeout(() => openModal(number), LONG_PRESS_MS)
    },
    [openModal]
  )

  const handleLongPressOut = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }
  }, [])

  const data = useMemo(
    () => stickerNumbers ?? Array.from({ length: stickerCount }, (_, i) => i + 1),
    [stickerNumbers, stickerCount]
  )

  const rows = useMemo(() => {
    const chunks: number[][] = []
    for (let i = 0; i < data.length; i += 5) {
      chunks.push(data.slice(i, i + 5))
    }
    return chunks
  }, [data])

  return (
    <>
      <View style={{ paddingTop: 16, paddingBottom: 24, gap: 5 }}>
        {rows.map((rowNumbers, index) => (
          <StickerRow
            key={index}
            rowNumbers={rowNumbers}
            countryCode={countryCode}
            state={state}
            highlightNumber={highlightNumber ?? null}
            cardWidth={cardWidth}
            onPress={handleStickerPress}
            onLongPress={handleStickerLongPress}
            onPressIn={handleLongPressIn}
            onPressOut={handleLongPressOut}
          />
        ))}
      </View>

      <Text style={{ color: theme.textDisabled, fontSize: 12, textAlign: 'center', marginTop: 8 }}>
        {t('hintTouch')}
      </Text>

      <ScrollableModal
        visible={modal !== null}
        onClose={closeModal}
        title={`${countryCode} #${modal} · ${t('modalTitle')}`}
        scrollable={false}
        contentPadding={24}
      >
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
              <Text style={{ color: colors.accentOrange, fontSize: 16, fontWeight: '700' }}>−</Text>
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
              <Text style={{ color: colors.accentOrange, fontSize: 16, fontWeight: '700' }}>+</Text>
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
      </ScrollableModal>
    </>
  )
}

export default React.memo(StickerPanel)
