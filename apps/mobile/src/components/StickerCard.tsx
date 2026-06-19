import React, { useEffect, useRef } from 'react'
import { View, Text, Pressable, Animated } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'

interface StickerCardProps {
  num: number
  countryCode: string
  isCollected: boolean
  isRepeated: boolean
  repeatedCount: number
  isHighlighted?: boolean
  onPress: () => void
  onLongPress: () => void
  onPressIn: () => void
  onPressOut: () => void
  delayLongPress: number
}

export default function StickerCard({
  num,
  countryCode,
  isCollected,
  isRepeated,
  repeatedCount,
  isHighlighted = false,
  onPress,
  onLongPress,
  onPressIn,
  onPressOut,
  delayLongPress,
}: StickerCardProps) {
  const { theme } = useTheme()
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!isHighlighted) {
      pulseAnim.setValue(1)
      return
    }
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 400, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      { iterations: 2 }
    )
    pulse.start()
    return () => pulse.stop()
  }, [isHighlighted])

  let bgColor = theme.bgTertiary
  let borderColor = theme.borderColor
  let textColor = theme.textMuted

  if (isCollected && isRepeated) {
    bgColor = colors.accentBlueHover
    borderColor = colors.accentBlue
    textColor = '#ffffff'
  } else if (isCollected) {
    bgColor = colors.accentBlue
    borderColor = colors.accentBlue
    textColor = '#ffffff'
  } else if (isRepeated) {
    bgColor = `${colors.accentOrange}1F`
    borderColor = `${colors.accentOrange}66`
    textColor = colors.accentOrange
  }

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        delayLongPress={delayLongPress}
        style={{
          aspectRatio: 1.1,
          backgroundColor: bgColor,
          borderWidth: isHighlighted ? 2 : 1,
          borderColor: isHighlighted ? colors.highlightYellow : borderColor,
          borderRadius: 6,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          paddingVertical: 4,
        }}
      >
        <Text style={{ color: textColor, fontSize: 15, fontWeight: '700', lineHeight: 16 }}>
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
          {countryCode}
        </Text>
        {isRepeated && (
          <View
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              backgroundColor: colors.accentOrange,
              borderRadius: 3,
              paddingHorizontal: 2,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: 8, fontWeight: '700' }}>
              +{repeatedCount}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
}
