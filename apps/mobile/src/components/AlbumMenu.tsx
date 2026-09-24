import { useEffect, useRef, useState } from 'react'
import { View, Text, Pressable, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { SYSTEM_ALBUMS } from '@mi-album-fifa/shared'
import { useCollectionState, useCollectionDispatch } from '../context/CollectionContext'
import { useTheme, colors } from '../hooks/useTheme'
import { useI18n } from '../hooks/useI18n'

function BookIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
      <Path d="M4 3h13a2 2 0 0 1 2 2v16H6a2 2 0 0 1-2-2V3zm3 0v18M10 7h6M10 11h6" />
    </Svg>
  )
}

function ChevronDownIcon({ color, size = 12 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m7 10 5 5 5-5" />
    </Svg>
  )
}

function CheckIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M5 13l4 4L19 7" />
    </Svg>
  )
}

function PlusIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

function TrashIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v5M14 11v5" />
    </Svg>
  )
}

function ResetIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 12a9 9 0 1 0 3-6.7" />
      <Path d="M3 4v5h5" />
    </Svg>
  )
}

function CheckCircleIcon({ color, size = 16 }: { color: string; size?: number }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
      <Path d="m8 12.5 2.5 2.5L16 9.5" />
    </Svg>
  )
}

export default function AlbumMenu() {
  const { theme } = useTheme()
  const { t } = useI18n()
  const { albums, myAlbumIds, albumsLoading, albumsError, activeAlbumId } = useCollectionState()
  const { addAlbum, selectAlbum, removeAlbum, resetCollection, completeCollection, refreshAlbums } =
    useCollectionDispatch()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'mine' | 'all'>('mine')
  const [busy, setBusy] = useState(false)
  const scrollRef = useRef<ScrollView>(null)
  const itemOffsets = useRef<Record<string, number>>({})

  const name = (id: string) =>
    t(SYSTEM_ALBUMS.find((a) => a.id === id)?.nameKey ?? 'albumsNoActive')

  const remove = (id: string) =>
    Alert.alert(t('albumsRemove'), t('albumsRemoveBody').replace('{album}', name(id)), [
      { text: t('resetCollectionCancel'), style: 'cancel' },
      {
        text: t('albumsRemove'),
        style: 'destructive',
        onPress: async () => {
          setBusy(true)
          try {
            await removeAlbum(id)
          } catch {
            Alert.alert(t('albumsErrorTitle'), t('albumsErrorBody'))
          } finally {
            setBusy(false)
          }
        },
      },
    ])

  const act = async (id: string) => {
    setBusy(true)
    try {
      if (myAlbumIds.includes(id)) await selectAlbum(id)
      else await addAlbum(id)
      setOpen(false)
    } catch {
      Alert.alert(t('albumsErrorTitle'), t('albumsErrorBody'))
    } finally {
      setBusy(false)
    }
  }

  const promptAdd = (id: string) =>
    Alert.alert(t('albumsAddConfirmTitle'), t('albumsAddConfirmBody').replace('{album}', name(id)), [
      { text: t('resetCollectionCancel'), style: 'cancel' },
      { text: t('albumsAdd'), onPress: () => void act(id) },
    ])

  const reset = () =>
    Alert.alert(
      t('resetCollectionTitle'),
      t('albumsResetBody').replace('{album}', name(activeAlbumId)),
      [
        { text: t('resetCollectionCancel'), style: 'cancel' },
        {
          text: t('resetCollectionConfirm'),
          style: 'destructive',
          onPress: async () => {
            setBusy(true)
            try {
              await resetCollection()
              setOpen(false)
            } catch {
              Alert.alert(t('resetCollectionErrorTitle'), t('resetCollectionErrorMessage'))
            } finally {
              setBusy(false)
            }
          },
        },
      ]
    )

  const complete = () =>
    Alert.alert(
      t('completeCollectionTitle'),
      t('albumsCompleteBody').replace('{album}', name(activeAlbumId)),
      [
        { text: t('resetCollectionCancel'), style: 'cancel' },
        {
          text: t('completeCollectionConfirm'),
          onPress: async () => {
            setBusy(true)
            try {
              await completeCollection()
              setOpen(false)
            } catch {
              Alert.alert(t('completeCollectionErrorTitle'), t('completeCollectionErrorMessage'))
            } finally {
              setBusy(false)
            }
          },
        },
      ]
    )

  const visibleAlbums = albums.filter((a) => tab === 'all' || myAlbumIds.includes(a.id))

  // Keep the active album in view whenever the modal opens or the tab changes,
  // in case the list is long enough to require scrolling.
  useEffect(() => {
    if (!open) return
    const offset = itemOffsets.current[activeAlbumId]
    if (offset == null) return
    const id = setTimeout(
      () => scrollRef.current?.scrollTo({ y: Math.max(offset - 12, 0), animated: false }),
      0
    )
    return () => clearTimeout(id)
  }, [open, tab, activeAlbumId])

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('albumsSelect')}
        accessibilityState={{ expanded: open }}
        onPress={() => {
          setTab('mine')
          setOpen(true)
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          maxWidth: 150,
          paddingHorizontal: 10,
          paddingVertical: 7,
          borderRadius: 9999,
          backgroundColor: theme.bgTertiary,
        }}
      >
        <BookIcon color={theme.textSecondary} />
        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flexShrink: 1, color: theme.textPrimary, fontSize: 13, fontWeight: '600' }}
        >
          {name(activeAlbumId)}
        </Text>
        <ChevronDownIcon color={theme.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!busy) setOpen(false)
        }}
      >
        <Pressable
          onPress={() => {
            if (!busy) setOpen(false)
          }}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              maxHeight: '85%',
              width: '100%',
              maxWidth: 420,
              alignSelf: 'center',
              backgroundColor: theme.cardBg,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: theme.borderColor,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700' }}>
                {t('albumsMenu')}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('albumsClose')}
                disabled={busy}
                onPress={() => setOpen(false)}
                style={{
                  minHeight: 32,
                  minWidth: 32,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: theme.textMuted, fontSize: 20 }}>×</Text>
              </Pressable>
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 13, marginBottom: 14 }}>
              {t('albumsActive')}: {name(activeAlbumId)}
            </Text>

            <View
              style={{
                flexDirection: 'row',
                backgroundColor: theme.bgTertiary,
                borderRadius: 10,
                padding: 3,
                marginBottom: 8,
              }}
            >
              {(['mine', 'all'] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === value }}
                  onPress={() => setTab(value)}
                  style={{
                    flex: 1,
                    paddingVertical: 8,
                    borderRadius: 8,
                    backgroundColor: tab === value ? colors.accentBlue : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 13,
                      fontWeight: '600',
                      color: tab === value ? '#ffffff' : theme.textSecondary,
                    }}
                  >
                    {t(value === 'mine' ? 'albumsTitle' : 'albumsAllTitle')}
                  </Text>
                </Pressable>
              ))}
            </View>

            {(albumsLoading || busy) && (
              <ActivityIndicator color={colors.accentBlue} style={{ marginVertical: 12 }} />
            )}

            {albumsError ? (
              <Pressable
                onPress={() => void refreshAlbums()}
                style={{ paddingVertical: 20, alignItems: 'center' }}
              >
                <Text style={{ color: theme.textMuted, fontSize: 13, textAlign: 'center' }}>
                  {t('albumsRetry')}
                </Text>
              </Pressable>
            ) : (
              <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                style={{ maxHeight: 340 }}
              >
                {tab === 'mine' && visibleAlbums.length === 0 && !albumsLoading && (
                  <View style={{ paddingVertical: 20, gap: 10, alignItems: 'flex-start' }}>
                    <Text style={{ color: theme.textMuted, fontSize: 13 }}>
                      {t('albumsEmpty')}
                    </Text>
                    <Pressable
                      onPress={() => setTab('all')}
                      accessibilityRole="button"
                      style={{ minHeight: 32, justifyContent: 'center' }}
                    >
                      <Text style={{ color: colors.accentBlue, fontSize: 13, fontWeight: '600' }}>
                        {t('albumsAllTitle')}
                      </Text>
                    </Pressable>
                  </View>
                )}
                {visibleAlbums.map((album, index) => {
                  const isActive = album.id === activeAlbumId
                  const isMine = myAlbumIds.includes(album.id)
                  const systemAlbum = SYSTEM_ALBUMS.find((a) => a.id === album.id)
                  return (
                    <View
                      key={album.id}
                      onLayout={(e) => {
                        itemOffsets.current[album.id] = e.nativeEvent.layout.y
                      }}
                    >
                      {index > 0 && (
                        <View style={{ height: 1, backgroundColor: theme.borderColor }} />
                      )}
                      <Pressable
                        disabled={busy}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive, disabled: busy }}
                        onPress={() => (isMine ? void act(album.id) : promptAdd(album.id))}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 10,
                          paddingVertical: 12,
                        }}
                      >
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              color: isActive ? colors.accentBlue : theme.textPrimary,
                              fontSize: 15,
                              fontWeight: '600',
                            }}
                          >
                            {name(album.id)}
                          </Text>
                          {systemAlbum?.sample && (
                            <Text
                              numberOfLines={1}
                              style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}
                            >
                              {t('albumsSample')}
                            </Text>
                          )}
                        </View>

                        {isActive && <CheckIcon color={colors.accentBlue} size={18} />}
                        {!isActive && tab === 'all' && isMine && (
                          <CheckIcon color={theme.textMuted} size={18} />
                        )}
                        {!isMine && <PlusIcon color={colors.accentBlue} size={18} />}

                        {tab === 'mine' && (
                          <Pressable
                            disabled={busy}
                            accessibilityRole="button"
                            accessibilityLabel={t('albumsRemove') + ': ' + name(album.id)}
                            onPress={(e) => {
                              e.stopPropagation()
                              remove(album.id)
                            }}
                            style={{ padding: 6, marginLeft: 2 }}
                          >
                            <TrashIcon color={theme.textMuted} />
                          </Pressable>
                        )}
                      </Pressable>

                      {tab === 'mine' && isActive && (
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                          <Pressable
                            disabled={busy}
                            accessibilityRole="button"
                            onPress={complete}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              paddingVertical: 8,
                              paddingRight: 12,
                              marginBottom: 6,
                            }}
                          >
                            <CheckCircleIcon color={colors.successGreen} size={14} />
                            <Text style={{ color: colors.successGreen, fontSize: 13 }}>
                              {t('albumsCompleteAction')}
                            </Text>
                          </Pressable>

                          <Pressable
                            disabled={busy}
                            accessibilityRole="button"
                            onPress={reset}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 6,
                              paddingVertical: 8,
                              marginBottom: 6,
                            }}
                          >
                            <ResetIcon color={colors.errorRed} size={14} />
                            <Text style={{ color: colors.errorRed, fontSize: 13 }}>
                              {t('albumsResetAction')}
                            </Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  )
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  )
}
