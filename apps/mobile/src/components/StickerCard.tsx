import React, { useEffect, useRef, useMemo } from 'react'
import { View, Text, Pressable, Animated, type ViewStyle, type TextStyle } from 'react-native'
import { useTheme, colors } from '../hooks/useTheme'

interface StickerCardProps {
  num: number
  countryCode: string
  isCollected: boolean
  isRepeated: boolean
  repeatedCount: number
  isHighlighted?: boolean
  onPress: (num: number) => void
  onLongPress: (num: number) => void
  onPressIn: (num: number) => void
  onPressOut: () => void
  delayLongPress: number
}

const BASE_STYLE: ViewStyle = {
  aspectRatio: 1.1,
  borderRadius: 6,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  paddingVertical: 4,
}

const NUM_STYLE: TextStyle = { fontSize: 15, fontWeight: '700', lineHeight: 16 }
const CODE_STYLE: TextStyle = { fontSize: 9, fontWeight: '500', opacity: 0.75, marginTop: 1 }
const BADGE_STYLE: ViewStyle = {
  position: 'absolute',
  top: 2,
  right: 2,
  backgroundColor: colors.accentOrange,
  borderRadius: 3,
  paddingHorizontal: 2,
}
const BADGE_TEXT_STYLE: TextStyle = { color: '#ffffff', fontSize: 8, fontWeight: '700' }

const StickerCard = React.memo(function StickerCard({
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

  const { bgColor, borderColor, textColor, borderWidth } = useMemo(() => {
    if (isCollected && isRepeated) {
      return {
        bgColor: colors.accentBlueHover,
        borderColor: colors.accentBlue,
        textColor: '#ffffff',
        borderWidth: isHighlighted ? 2 : 1,
      }
    }
    if (isCollected) {
      return {
        bgColor: colors.accentBlue,
        borderColor: colors.accentBlue,
        textColor: '#ffffff',
        borderWidth: isHighlighted ? 2 : 1,
      }
    }
    if (isRepeated) {
      return {
        bgColor: `${colors.accentOrange}1F`,
        borderColor: `${colors.accentOrange}66`,
        textColor: colors.accentOrange,
        borderWidth: isHighlighted ? 2 : 1,
      }
    }
    return {
      bgColor: theme.bgTertiary,
      borderColor: theme.borderColor,
      textColor: theme.textMuted,
      borderWidth: isHighlighted ? 2 : 1,
    }
  }, [isCollected, isRepeated, isHighlighted, theme.bgTertiary, theme.borderColor, theme.textMuted])

  const containerStyle = useMemo(
    () => ({
      ...BASE_STYLE,
      backgroundColor: bgColor,
      borderWidth,
      borderColor,
    }),
    [bgColor, borderWidth, borderColor]
  )

  const handlePress = () => onPress(num)
  const handleLongPress = () => onLongPress(num)
  const handlePressIn = () => onPressIn(num)

  return (
    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        onPressIn={handlePressIn}
        onPressOut={onPressOut}
        delayLongPress={delayLongPress}
        style={containerStyle}
      >
        <Text style={{ color: textColor, ...NUM_STYLE }}>{num}</Text>
        <Text style={{ color: textColor, ...CODE_STYLE }}>{countryCode}</Text>
        {isRepeated && (
          <View style={BADGE_STYLE}>
            <Text style={BADGE_TEXT_STYLE}>+{repeatedCount}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  )
})

export default StickerCard
