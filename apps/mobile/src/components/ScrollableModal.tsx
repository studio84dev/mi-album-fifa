import { ReactNode } from 'react'
import { View, Text, Modal, Pressable, ScrollView, useWindowDimensions } from 'react-native'
import { useTheme } from '../hooks/useTheme'
import Svg, { Path } from 'react-native-svg'

const CloseIcon = ({ color }: { color: string }) => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
    <Path d="M18 6L6 18" />
    <Path d="M6 6l12 12" />
  </Svg>
)

interface ScrollableModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  headerRight?: ReactNode
  children: ReactNode
  maxHeightRatio?: number
  closeOnBackdrop?: boolean
  scrollable?: boolean
  contentPadding?: number
}

export default function ScrollableModal({
  visible,
  onClose,
  title,
  headerRight,
  children,
  maxHeightRatio = 0.85,
  closeOnBackdrop = true,
  scrollable = true,
  contentPadding = 16,
}: ScrollableModalProps) {
  const { theme } = useTheme()
  const { height } = useWindowDimensions()
  const modalHeight = height * maxHeightRatio

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 32,
        }}
      >
        <Pressable
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
          }}
          onPress={closeOnBackdrop ? onClose : undefined}
        />
        <View
          style={{
            backgroundColor: theme.cardBg,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.borderColor,
            width: '100%',
            maxWidth: 400,
            height: modalHeight,
            overflow: 'hidden',
          }}
        >
          {(title || headerRight) && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.borderColor,
              }}
            >
              {title ? (
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.textPrimary }}>
                  {title}
                </Text>
              ) : (
                <View />
              )}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {headerRight}
                <Pressable onPress={onClose} hitSlop={8}>
                  <CloseIcon color={theme.textMuted} />
                </Pressable>
              </View>
            </View>
          )}

          {scrollable ? (
            <ScrollView
              style={{ flex: 1, padding: contentPadding }}
              contentContainerStyle={{ paddingBottom: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {children}
            </ScrollView>
          ) : (
            <View style={{ flex: 1, padding: contentPadding }}>{children}</View>
          )}
        </View>
      </View>
    </Modal>
  )
}
